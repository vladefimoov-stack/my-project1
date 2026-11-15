import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { orderSchema, type Order, type OrderResponse } from "@/lib/order-schema";
import { rateLimit, recall, remember } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { buildCustomerEmail, buildOwnerEmail } from "@/lib/order-email";
import { log, maskEmail } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_FILL_MS = 2500; // humans need more than 2.5 s to fill the form
const MAX_BODY = 8 * 1024;
const CONTENT_DEDUPE_MS = 2 * 60 * 1000;

function reply(body: OrderResponse, status: number, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

function clientIp(req: NextRequest) {
  return (req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown").slice(0, 64);
}

function makeReference(now: Date) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(5);
  const rand = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  const ymd = now.toISOString().slice(2, 10).replace(/-/g, "");
  return `KM-${ymd}-${rand}`;
}

export async function POST(req: NextRequest) {
  // ── same-origin check (basic CSRF protection) ──
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        log("warn", "order.rejected", { reason: "origin" });
        return reply({ ok: false, error: "invalid" }, 403);
      }
    } catch {
      return reply({ ok: false, error: "invalid" }, 403);
    }
  }

  if (!req.headers.get("content-type")?.includes("application/json")) return reply({ ok: false, error: "invalid" }, 415);

  // ── rate limit ──
  const ip = clientIp(req);
  const max = Number(process.env.RATE_LIMIT_MAX) || 5;
  const windowS = Number(process.env.RATE_LIMIT_WINDOW_SECONDS) || 600;
  const rl = rateLimit(`order:${ip}`, max, windowS * 1000);
  if (!rl.ok) {
    log("warn", "order.rejected", { reason: "rate_limit" });
    return reply({ ok: false, error: "rate" }, 429, { "Retry-After": String(rl.retryAfter) });
  }

  // ── parse + validate ──
  let raw: unknown;
  try {
    const text = await req.text();
    if (text.length > MAX_BODY) return reply({ ok: false, error: "invalid" }, 413);
    raw = JSON.parse(text);
  } catch {
    return reply({ ok: false, error: "invalid" }, 400);
  }

  // honeypot is checked before schema so bots get a generic answer
  if (raw && typeof raw === "object" && typeof (raw as Record<string, unknown>).website === "string" && (raw as Record<string, string>).website.length > 0) {
    log("warn", "order.rejected", { reason: "honeypot" });
    return reply({ ok: false, error: "spam" }, 400);
  }

  const parsed = orderSchema.safeParse(raw);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((i) => String(i.path[0])))];
    log("warn", "order.rejected", { reason: "validation", fields });
    return reply({ ok: false, error: "invalid", fields }, 400);
  }
  const order = parsed.data;

  const elapsed = Date.now() - order.startedAt;
  if (elapsed < MIN_FILL_MS) {
    log("warn", "order.rejected", { reason: "too_fast", elapsed });
    return reply({ ok: false, error: "spam" }, 400);
  }

  // ── duplicate protection ──
  const dupKeys = [`idem:${order.idempotencyKey}`, `content:${order.email}:${order.quantity}:${order.country}`];
  for (const k of dupKeys) {
    const ref = recall(k);
    if (ref) {
      log("info", "order.duplicate", { reference: ref });
      return reply({ ok: true, reference: ref, duplicate: true }, 200);
    }
  }

  // concurrent retries of the same submission share one delivery attempt
  const pending = inflight.get(order.idempotencyKey);
  if (pending) {
    const r = await pending;
    return r.ok ? reply({ ok: true, reference: r.reference, duplicate: true }, 200) : reply({ ok: false, error: "server" }, 502);
  }
  const attempt = deliver(order, dupKeys);
  inflight.set(order.idempotencyKey, attempt);
  try {
    const r = await attempt;
    if (!r.ok) return reply({ ok: false, error: "server" }, r.status);
    return reply({ ok: true, reference: r.reference }, 200);
  } finally {
    inflight.delete(order.idempotencyKey);
  }
}

type Delivery = { ok: true; reference: string } | { ok: false; status: number };
const inflight = new Map<string, Promise<Delivery>>();

async function deliver(order: Order, dupKeys: string[]): Promise<Delivery> {
  const to = process.env.ORDER_NOTIFICATION_EMAIL;
  if (!to) {
    log("error", "order.config", { reason: "ORDER_NOTIFICATION_EMAIL missing" });
    return { ok: false, status: 503 };
  }

  const now = new Date();
  const reference = makeReference(now);
  const result = await sendEmail(buildOwnerEmail(order, reference, now, to), "owner-notification");

  if (!result.ok) {
    log("error", "order.failed", { reference, reason: result.reason, customer: maskEmail(order.email) });
    return { ok: false, status: 502 };
  }

  remember(dupKeys[0], reference); // same form submission retried → same reference (24 h)
  remember(dupKeys[1], reference, CONTENT_DEDUPE_MS); // same person submitting twice from two tabs

  log("info", "order.accepted", {
    reference,
    emailId: result.id,
    customer: maskEmail(order.email),
    country: order.country,
    quantity: order.quantity,
    locale: order.locale,
  });

  if (process.env.SEND_CUSTOMER_CONFIRMATION === "true") {
    // best effort — the request is already confirmed by the owner notification
    void sendEmail(buildCustomerEmail(order, reference), "customer-confirmation");
  }
  return { ok: true, reference };
}

export function GET() {
  return reply({ ok: false, error: "invalid" }, 405);
}

import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { log, maskEmail } from "./logger";

export type EmailMessage = {
  to: string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

export type SendResult = { ok: true; id: string } | { ok: false; reason: string };

/** gmail (app password) if configured, otherwise resend — unless EMAIL_PROVIDER says otherwise */
export function emailProvider() {
  const explicit = process.env.EMAIL_PROVIDER?.toLowerCase();
  if (explicit) return explicit;
  return process.env.GMAIL_APP_PASSWORD ? "gmail" : "resend";
}

/** true when an email provider is set up (or the dev "log" provider is used) */
export function emailConfigured() {
  const provider = emailProvider();
  if (provider === "log") return process.env.NODE_ENV !== "production";
  if (provider === "gmail") return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

let gmailTransport: Transporter | null = null;

async function sendViaGmail(msg: EmailMessage, tag: string, toMasked: string[]): Promise<SendResult> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, ""); // Google shows it in groups of 4
  if (!user || !pass) {
    log("error", "email.config", { tag, reason: "GMAIL_USER or GMAIL_APP_PASSWORD missing" });
    return { ok: false, reason: "not_configured" };
  }
  gmailTransport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: (Number(process.env.SMTP_PORT) || 465) === 465,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  try {
    const info = await gmailTransport.sendMail({
      from: { name: process.env.EMAIL_FROM_NAME || "Kalm", address: user },
      to: msg.to,
      subject: msg.subject,
      text: msg.text,
      html: msg.html,
      replyTo: msg.replyTo,
    });
    if (info.rejected?.length) {
      log("error", "email.failed", { tag, provider: "gmail", error: "rejected", to: toMasked });
      return { ok: false, reason: "rejected" };
    }
    log("info", "email.sent", { tag, provider: "gmail", id: info.messageId, to: toMasked });
    return { ok: true, id: info.messageId };
  } catch (e) {
    const err = e as { code?: string; responseCode?: number; message?: string };
    // EAUTH / 535 = wrong address or app password (or 2-Step Verification is off)
    log("error", "email.failed", { tag, provider: "gmail", code: err.code, responseCode: err.responseCode, error: err.message?.slice(0, 200), to: toMasked });
    gmailTransport = null;
    return { ok: false, reason: err.code === "EAUTH" ? "auth" : "smtp" };
  }
}

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Sends an email through the configured provider.
 * Returns ok only when the provider ACCEPTED the message.
 */
export async function sendEmail(msg: EmailMessage, tag: string): Promise<SendResult> {
  const provider = emailProvider();
  const toMasked = msg.to.map(maskEmail);

  if (provider === "gmail") return sendViaGmail(msg, tag, toMasked);

  if (provider === "log") {
    if (process.env.NODE_ENV === "production") {
      log("error", "email.config", { tag, reason: "EMAIL_PROVIDER=log is not allowed in production" });
      return { ok: false, reason: "provider_not_allowed" };
    }
    const id = `dev-${Date.now()}`;
    console.info(`\n──── [DEV EMAIL · ${tag}] ────\nTo: ${msg.to.join(", ")}\nSubject: ${msg.subject}\n\n${msg.text}\n────────────────────────────\n`);
    log("info", "email.sent", { tag, provider, id, to: toMasked });
    return { ok: true, id };
  }

  if (provider !== "resend") {
    log("error", "email.config", { tag, reason: `unknown EMAIL_PROVIDER "${provider}"` });
    return { ok: false, reason: "unknown_provider" };
  }

  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    log("error", "email.config", { tag, reason: "RESEND_API_KEY or EMAIL_FROM missing" });
    return { ok: false, reason: "not_configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: msg.to,
        subject: msg.subject,
        text: msg.text,
        html: msg.html,
        ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string; name?: string };
    if (res.ok && body.id) {
      log("info", "email.sent", { tag, provider, id: body.id, to: toMasked });
      return { ok: true, id: body.id };
    }
    log("error", "email.failed", { tag, provider, status: res.status, error: body.name ?? body.message ?? "unknown", to: toMasked });
    return { ok: false, reason: `http_${res.status}` };
  } catch (e) {
    log("error", "email.failed", { tag, provider, error: e instanceof Error ? e.message : String(e), to: toMasked });
    return { ok: false, reason: "network" };
  }
}

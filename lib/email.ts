import "server-only";
import { log, maskEmail } from "./logger";

export type EmailMessage = {
  to: string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

export type SendResult = { ok: true; id: string } | { ok: false; reason: string };

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Sends an email through the configured provider.
 * Returns ok only when the provider ACCEPTED the message.
 */
export async function sendEmail(msg: EmailMessage, tag: string): Promise<SendResult> {
  const provider = (process.env.EMAIL_PROVIDER || "resend").toLowerCase();
  const toMasked = msg.to.map(maskEmail);

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

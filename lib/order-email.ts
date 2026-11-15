import "server-only";
import { product, formatPrice } from "@/config/product";
import { getDictionary, fmt } from "@/i18n/dictionaries";
import { localeNames } from "@/i18n/config";
import { escapeHtml, type EmailMessage } from "./email";
import type { Order } from "./order-schema";

export const ORDER_SUBJECT = "NEW PRODUCT PURCHASE INTEREST — TEST ORDER";

export function countryName(code: string) {
  if (code === "OTHER") return "Other";
  try {
    return `${new Intl.DisplayNames(["en"], { type: "region" }).of(code)} (${code})`;
  } catch {
    return code;
  }
}

/** Internal notification to the shop owner (always English). */
export function buildOwnerEmail(order: Order, reference: string, submittedAt: Date, to: string): EmailMessage {
  const unit = formatPrice(product.price, "en");
  const total = formatPrice(product.price * order.quantity, "en");
  const rows: [string, string][] = [
    ["Order reference", reference],
    ["Customer name", order.name],
    ["Customer email", order.email],
    ["Customer country", countryName(order.country)],
    ["Customer phone", order.phone || "—"],
    ["Product", `${product.name} (${product.sku})`],
    ["Colour", order.colour],
    ["Quantity", String(order.quantity)],
    ["Displayed unit price", unit],
    ["Total indicative value", total],
    ["Selected language", `${localeNames[order.locale]} (${order.locale.toUpperCase()})`],
    ["Submitted at (UTC)", submittedAt.toISOString().replace("T", " ").slice(0, 19)],
  ];
  const notice = "This is a TEST submission. No payment was requested or made, and no binding order was created.";

  const text = [ORDER_SUBJECT, "", ...rows.map(([k, v]) => `${k}: ${v}`), "", notice].join("\n");
  const html = `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#111">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden">
<tr><td style="background:#111;color:#fff;padding:20px 24px;font-size:14px;letter-spacing:.08em;font-weight:600">${escapeHtml(ORDER_SUBJECT)}</td></tr>
<tr><td style="padding:8px 24px 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#777;width:46%">${escapeHtml(k)}</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:500">${escapeHtml(v)}</td></tr>`
  )
  .join("\n")}
</table></td></tr>
<tr><td style="padding:20px 24px 24px"><div style="background:#fff8e6;border:1px solid #f3dfa6;border-radius:10px;padding:12px 14px;font-size:13px;color:#6b5200">${escapeHtml(notice)}</div></td></tr>
</table></td></tr></table></body></html>`;

  return { to: [to], subject: `${ORDER_SUBJECT} · ${reference}`, text, html, replyTo: order.email };
}

/** Optional confirmation to the visitor, in their language. */
export function buildCustomerEmail(order: Order, reference: string): EmailMessage {
  const d = getDictionary(order.locale);
  const greeting = fmt(d.email.customerGreeting, { name: order.name });
  const body = fmt(d.email.customerBody, { ref: reference });
  return {
    to: [order.email],
    subject: d.email.customerSubject,
    text: `${greeting}\n\n${body}\n\n— Keyline`,
    html: `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#111;max-width:520px"><p>${escapeHtml(
      greeting
    )}</p><p>${escapeHtml(body)}</p><p style="color:#777">— Keyline</p></div>`,
  };
}

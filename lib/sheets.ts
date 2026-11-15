import "server-only";
import { log } from "./logger";
import { product } from "@/config/product";
import { countryName } from "./order-email";
import type { Order } from "./order-schema";

/** Saves an order as a row in Google Sheets (via the Apps Script web app in integrations/google-sheets). */
export function sheetsConfigured() {
  return Boolean(process.env.GOOGLE_SHEETS_WEBHOOK_URL && process.env.GOOGLE_SHEETS_SECRET);
}

export async function saveOrderToSheet(order: Order, reference: string, submittedAt: Date): Promise<boolean> {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const secret = process.env.GOOGLE_SHEETS_SECRET;
  if (!url || !secret) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      // text/plain avoids a CORS preflight on Apps Script; the body is JSON
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        secret,
        reference,
        submittedAt: submittedAt.toISOString(),
        name: order.name,
        email: order.email,
        phone: order.phone || "",
        country: countryName(order.country),
        quantity: order.quantity,
        total: product.price * order.quantity,
        locale: order.locale.toUpperCase(),
      }),
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
    const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (res.ok && body?.ok) {
      log("info", "sheets.saved", { reference });
      return true;
    }
    log("error", "sheets.failed", { reference, status: res.status, error: body?.error ?? "bad response (check the web app access is 'Anyone')" });
    return false;
  } catch (e) {
    log("error", "sheets.failed", { reference, error: e instanceof Error ? e.message : String(e) });
    return false;
  }
}

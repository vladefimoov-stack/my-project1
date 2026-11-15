import { z } from "zod";
import { product } from "@/config/product";
import { locales } from "@/i18n/config";

/** Countries offered in checkout (EU/EEA + CH + UK). "OTHER" allowed too. */
export const COUNTRIES = [
  "LT", "DE", "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "GR", "HU", "IE", "IT",
  "LV", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "CH", "GB",
] as const;

const clean = (s: string) => s.normalize("NFC").replace(/[\u0000-\u001F\u007F<>]/g, "").replace(/\s+/g, " ").trim();

export const orderSchema = z.object({
  name: z.string().transform(clean).pipe(z.string().min(2).max(100)),
  email: z.string().transform((s) => s.trim().toLowerCase()).pipe(z.email().max(200)),
  country: z.enum([...COUNTRIES, "OTHER"]),
  phone: z
    .string()
    .transform(clean)
    .pipe(z.string().max(30).regex(/^$|^\+?[0-9 ()\-./]{6,30}$/))
    .optional()
    .default(""),
  quantity: z.coerce.number().int().min(1).max(product.maxQuantity),
  colour: z.string().max(40).default(product.colours[0].id),
  locale: z.enum(locales),
  consent: z.literal(true),
  // anti-spam
  website: z.string().max(0).optional().default(""), // honeypot — must stay empty
  startedAt: z.coerce.number().int().positive(), // ms timestamp when the form opened
  idempotencyKey: z.string().regex(/^[A-Za-z0-9-]{16,64}$/),
});

export type OrderInput = z.input<typeof orderSchema>;
export type Order = z.output<typeof orderSchema>;

export type OrderResponse =
  | { ok: true; reference: string; duplicate?: boolean }
  | { ok: false; error: "invalid" | "rate" | "server" | "spam"; fields?: string[] };

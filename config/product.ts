/**
 * ════════════════════════════════════════════════════════════════════
 *  CENTRAL PRODUCT CONFIGURATION
 *  Edit this file to change price, colours, specifications and the 3D model.
 *  Translated marketing copy lives in /locales/{en,lt,de}.json.
 * ════════════════════════════════════════════════════════════════════
 *
 *  RULE: never put an unverified value in `specs`. Leave it `null` and the
 *  website shows "To be confirmed" in the visitor's language. Set
 *  `verified: true` only once the value is confirmed with the supplier
 *  (ideally with a physical sample in hand).
 */

export type SpecKey =
  | "display"
  | "os"
  | "processor"
  | "memory"
  | "battery"
  | "connectivity"
  | "connector"
  | "dimensions"
  | "weight"
  | "inBox";

/** a value can be one string for all languages, or one per language */
export type SpecValue = string | { en: string; lt: string; de: string };
export type Spec = { value: SpecValue | null; verified: boolean };

export const product = {
  /** Internal SKU used in order notifications */
  sku: "KALM-BLACK",
  /** Display name (brand names are not translated) */
  name: "Kalm",
  brand: "Kalm",

  /** ── PRICE ─────────────────────────────────────────────────────── */
  price: 140, // price in EUR shown on the site (payment is arranged when we confirm the order)
  currency: "EUR" as const,
  /** Maximum units per test order */
  maxQuantity: 5,

  /** ── COLOURS ───────────────────────────────────────────────────── */
  colours: [
    {
      id: "black",
      // swatch + material colours used by the 3D model
      swatch: "#16171A",
      body: "#18191C",
      keys: "#1F2024",
      available: true,
    },
  ],

  /**
   * ── SPECIFICATIONS ─────────────────────────────────────────────────
   * All `null` until confirmed by the supplier. Values are shown as-is
   * (they are mostly units/numbers, so they work across languages).
   * Example once confirmed:  display: { value: '3.5" touchscreen', verified: true }
   */
  specs: {
    display: { value: { en: '2.8" · 480 × 640', lt: '2,8" · 480 × 640', de: '2,8" · 480 × 640' }, verified: true },
    os: { value: "Android 11", verified: true },
    processor: { value: "MediaTek MT6739", verified: true },
    memory: { value: "3 GB / 32 GB", verified: true },
    battery: { value: { en: "2000 mAh", lt: "2000 mAh", de: "2000 mAh" }, verified: true },
    connectivity: {
      value: { en: "Wi-Fi · Bluetooth · hotspot", lt: "Wi-Fi · Bluetooth · prieigos taškas", de: "WLAN · Bluetooth · Hotspot" },
      verified: true,
    },
    connector: { value: "USB Type-C", verified: true },
    dimensions: { value: "131 × 52 × 9 mm", verified: true },
    weight: { value: { en: "91.1 g", lt: "91,1 g", de: "91,1 g" }, verified: true },
    inBox: {
      value: { en: "Phone, USB-A → USB-C cable", lt: "Telefonas, USB-A → USB-C kabelis", de: "Telefon, USB-A → USB-C-Kabel" },
      verified: true,
    },
  } satisfies Record<SpecKey, Spec>,

  /** ── 3D MODEL ──────────────────────────────────────────────────────
   * Leave `glbUrl` null to use the built-in provisional procedural model.
   * To use a real model: put `phone.glb` in /public/models and set
   * glbUrl: "/models/phone.glb". See README → "Adding the real 3D model".
   */
  model: {
    glbUrl: null as string | null,
    /** uniform scale applied to a GLB so it matches the procedural size (~1.3 units tall) */
    glbScale: 1,
  },
} as const;

export type Product = typeof product;

export function formatPrice(amount: number, locale: string) {
  const tag = locale === "lt" ? "lt-LT" : locale === "de" ? "de-DE" : "en-IE";
  return new Intl.NumberFormat(tag, {
    style: "currency",
    currency: product.currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

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
  | "ram"
  | "storage"
  | "battery"
  | "camera"
  | "sim"
  | "network"
  | "dimensions"
  | "weight"
  | "colours";

export type Spec = { value: string | null; verified: boolean };

export type FeatureKey =
  | "compact"
  | "keypad"
  | "touch"
  | "hybrid"
  | "apps"
  | "dualSim"
  | "lte";

export const product = {
  /** Internal SKU used in order notifications */
  sku: "KL-ONE-GRAPHITE",
  /** Display name (brand names are not translated) */
  name: "Keyline One",
  brand: "Keyline",

  /** ── PRICE ─────────────────────────────────────────────────────── */
  price: 149, // indicative price shown on the site (test phase, no payment)
  currency: "EUR" as const,
  /** Maximum units per test order */
  maxQuantity: 5,

  /** ── COLOURS ───────────────────────────────────────────────────── */
  colours: [
    {
      id: "graphite",
      // swatch + material colours used by the 3D model
      swatch: "#2A2B2E",
      body: "#2B2C30",
      keys: "#3A3B40",
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
    display: { value: null, verified: false },
    os: { value: null, verified: false },
    processor: { value: null, verified: false },
    ram: { value: null, verified: false },
    storage: { value: null, verified: false },
    battery: { value: null, verified: false },
    camera: { value: null, verified: false },
    sim: { value: null, verified: false },
    network: { value: null, verified: false },
    dimensions: { value: null, verified: false },
    weight: { value: null, verified: false },
    colours: { value: null, verified: false },
  } satisfies Record<SpecKey, Spec>,

  /**
   * ── FEATURES ───────────────────────────────────────────────────────
   * `confirmed: false` → shown with a "pending verification" label.
   * Physical traits visible in the reference photos are marked confirmed.
   */
  features: [
    { key: "compact", confirmed: true },
    { key: "keypad", confirmed: true },
    { key: "touch", confirmed: true },
    { key: "hybrid", confirmed: true },
    { key: "apps", confirmed: false },
    { key: "dualSim", confirmed: false },
    { key: "lte", confirmed: false },
  ] satisfies { key: FeatureKey; confirmed: boolean }[],

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

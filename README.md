# Keyline One — product validation store

A premium single-product e-commerce website for a compact **hybrid phone**: a real physical numeric keypad plus a colour touchscreen. Built for **demand validation** — it looks and behaves like a real store, but **no payments are taken**: "orders" are delivered to the owner by email.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Framer Motion · Three.js + React Three Fiber + Drei · Zod · Resend (email).

---

## Features

| Section | What it does |
|---|---|
| Hero | Staggered entrance, scroll parallax, price from config, CTAs to the 3D viewer and demo |
| 360° viewer | Real WebGL 3D model: drag/touch rotate (horizontal + vertical), wheel/pinch zoom, idle auto-rotate that pauses on interaction, preset views (display, keypad, back & camera, side, top & bottom), reset, fullscreen (with iOS fallback). Lazy-loaded when near the viewport, render loop paused off-screen, static renders if WebGL is unavailable |
| Presentation | Editorial blocks with scroll reveals: front, display close-up, keypad close-up, back (parallax), scale vs. a bank card |
| Specifications | Driven by `config/product.ts`; unverified values show "To be confirmed" |
| Interactive demo | A website **simulation** of the phone (not an emulator). Launcher identical in layout to the reference photo; 9 working apps (Telegram-style & WhatsApp-style chat with multi-tap keypad typing, Maps, Gallery, Video, Music with generated tones, Settings, Phone dialer, Contacts). Works with touch, the on-device keypad (D-pad, OK, back, call/end, digits) and the computer keyboard |
| Features | Confirmed vs "pending verification" per feature, from config |
| Purchase | Colour, quantity, "Order now" → test checkout; delivery/returns/warranty placeholders |
| Test checkout | Name, email, country, optional phone, quantity, consent → `POST /api/order` → owner email. Success shown **only after** the email provider accepts the message |
| FAQ | Accessible accordion + FAQPage JSON-LD |
| i18n | EN / LT / DE with server-side IP detection, manual switcher, hreflang |
| Legal | Privacy, Terms, Shipping & Returns, Contact — templates in all 3 languages |

---

## Quick start

```bash
npm install
cp .env.example .env.local     # then edit
npm run dev                    # http://localhost:3000
```

For local testing without an email account set `EMAIL_PROVIDER=log` in `.env.local` — notifications are printed to the terminal instead of sent (this mode is refused in production).

```bash
npm run build && npm start     # production build
npm run typecheck
npm run test:api               # API tests against a running server (see below)
```

---

## Environment variables

See [`.env.example`](.env.example). Server-only secrets are **never** exposed to the browser (nothing secret uses the `NEXT_PUBLIC_` prefix).

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | yes (prod) | Canonical URL for SEO, hreflang, sitemap |
| `EMAIL_PROVIDER` | – | `resend` (default) or `log` (dev only) |
| `RESEND_API_KEY` | yes (prod) | Resend API key |
| `EMAIL_FROM` | yes (prod) | Verified sender, e.g. `Keyline <orders@yourdomain.com>` |
| `ORDER_NOTIFICATION_EMAIL` | yes | Recipient of test-order notifications |
| `SEND_CUSTOMER_CONFIRMATION` | – | `true` to also email the customer (in their language) |
| `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_SECONDS` | – | Default 5 submissions / 10 min / IP |
| `GEOIP_API_URL` | – | Optional geolocation fallback when the host gives no country header |
| `ENABLE_RENDER_ROUTE` | – | Enables `/render` in production (used to regenerate images) |

### Setting up Resend

1. Create an account at resend.com, add and verify your domain (DNS records).
2. Create an API key with "sending" permission → `RESEND_API_KEY`.
3. Set `EMAIL_FROM` to an address on the verified domain.
   Until a domain is verified Resend only allows sending from `onboarding@resend.dev` **to the account owner's address** — fine for a first test.

---

## Changing product content

Everything lives in two places:

- **`config/product.ts`** — price, currency, max quantity, colours, specifications, feature verification flags, 3D model URL.
  ```ts
  price: 149,                 // ← change the price here
  specs: {
    display: { value: '3.5" IPS touchscreen', verified: true },   // shown
    battery: { value: null, verified: false },                     // "To be confirmed"
  }
  features: [{ key: "lte", confirmed: true }, …]                   // removes the "pending" tag
  ```
- **`locales/en.json`, `locales/lt.json`, `locales/de.json`** — all text: headlines, descriptions, FAQ answers, demo content, legal templates, email copy. Keep the same keys in all three files.
- **`config/site.ts`** — public contact email, company details for the legal pages, data-retention period.

> Rule of thumb: never mark a specification or feature as verified until it has been confirmed on a physical sample.

---

## Languages & geolocation

- URLs are prefixed: `/en`, `/lt`, `/de`. Visiting `/` triggers `middleware.ts`:
  1. a language the visitor **picked manually** (cookie `kl_locale_src=manual`, mirrored in localStorage) always wins;
  2. otherwise the country from the hosting platform's geo header (`x-vercel-ip-country`, `cf-ipcountry`, `cloudfront-viewer-country`, …): **LT → Lithuanian, DE → German, anything else → English**;
  3. otherwise an optional `GEOIP_API_URL` lookup (800 ms timeout);
  4. otherwise the browser's `Accept-Language`;
  5. otherwise English.
- A URL with an explicit locale is always respected, so shared links don't get rewritten.
- `<html lang>`, `hreflang` alternates (+ `x-default`), Open Graph locale and the sitemap are set per language.
- Implementation is a lightweight typed dictionary system (`i18n/`), equivalent to i18next for this use-case but with zero runtime cost.

---

## Test checkout — how it works

`components/checkout/CheckoutDialog.tsx` → `app/api/order/route.ts`

1. Client-side validation with the **same Zod schema** used on the server (`lib/order-schema.ts`).
2. Server: same-origin check → per-IP rate limit → body size limit → honeypot field → minimum fill time (2.5 s) → schema validation & sanitisation.
3. Duplicate protection: each checkout carries an idempotency key; retries/double-clicks return the original reference instead of sending a second email. Identical submissions from two tabs within 2 minutes are also merged. Concurrent retries share one delivery attempt.
4. Email to `ORDER_NOTIFICATION_EMAIL`, subject **`NEW PRODUCT PURCHASE INTEREST — TEST ORDER`**, with name, email, country, phone, product, quantity, unit price, indicative total, language, UTC timestamp, order reference and an explicit "test submission — no payment" notice. `reply_to` is the customer.
5. The visitor sees the success message **only** when the provider accepted the email; otherwise an error with a retry button (the idempotency key is kept so a retry can't double-send).
6. Structured JSON logs: `order.accepted`, `order.failed`, `order.rejected` (reason), `email.sent`, `email.failed` — customer emails are masked.

No card data is ever requested; there is no payment integration.

**Note on serverless:** rate-limit and dedupe state is in memory, i.e. per instance. That's adequate for a validation test; for strict guarantees plug in Upstash Redis / Vercel KV in `lib/rate-limit.ts`.

### API tests

```bash
EMAIL_PROVIDER=log ORDER_NOTIFICATION_EMAIL=test@example.com npm run dev
npm run test:api
```

---

## Deployment (Vercel recommended)

1. Push the repo, import it in Vercel (framework auto-detected).
2. Add the environment variables above (Production + Preview).
3. Deploy. Vercel provides `x-vercel-ip-country`, so IP-based language detection works with no extra service.
4. Point your domain, set `NEXT_PUBLIC_SITE_URL` to it, redeploy.

Other hosts: any Node 18.18+ server (`npm run build && npm start`). Behind Cloudflare, enable "IP Geolocation" so `cf-ipcountry` is sent; otherwise configure `GEOIP_API_URL`.

---

## Project structure

```
app/
  [locale]/            pages per language (home, privacy, terms, shipping, contact)
  api/order/route.ts   test-order endpoint
  render/              internal render route for product images (dev only)
  sitemap.ts robots.ts
components/
  hero/ product-viewer/ virtual-phone/ checkout/ sections/ layout/ ui/
config/                product.ts (price, specs…), site.ts
i18n/  locales/        language config + dictionaries
lib/                   device geometry, app icons, validation, email, rate limit
public/images/renders  product renders (generated)
public/models          exported GLB
scripts/               render generator, API tests
docs/3D-MODEL.md       model status, verification checklist, how to swap in a real GLB
```

---

## Assets still required before launch

- [ ] **Real 3D model** of the production device (see `docs/3D-MODEL.md`) — the current one is a provisional reconstruction.
- [ ] **Studio photography** of a physical sample, and a **photo of the device in a hand**.
- [ ] **Verified specifications** (display, OS, CPU, RAM, storage, battery, camera, SIM, network bands, dimensions, weight, colours).
- [ ] Verified app compatibility (WhatsApp, Telegram, etc.) before changing FAQ answers.
- [ ] Final brand name / logo (current "Keyline" identity is temporary).
- [ ] Company details, contact email and legally reviewed Privacy Policy, Terms, Shipping & Returns (templates contain `[placeholders]`).
- [ ] Delivery times/costs, return policy, warranty text.
- [ ] A verified sending domain in Resend.

## Known limitations / documented placeholders

- The virtual phone is a simulation with fictional data; it does not run Android or connect to any service (stated on the page).
- Side buttons and ports on the 3D model are assumptions.
- The cookie notice is informational because only strictly-necessary storage is used; add a consent manager if analytics/marketing tags are introduced.

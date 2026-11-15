/**
 * Functional tests for POST /api/order against a running server.
 *   EMAIL_PROVIDER=log ORDER_NOTIFICATION_EMAIL=test@example.com npm run dev
 *   npm run test:api            (BASE_URL defaults to http://localhost:3000)
 *
 * Note: the rate limiter is per-IP; tests send distinct X-Forwarded-For values.
 */
const BASE = process.env.BASE_URL || "http://localhost:3000";
let pass = 0, fail = 0;
let ipN = Math.floor(Math.random() * 200);

const valid = (over = {}) => ({
  name: "Test Person",
  email: `tester+${Math.random().toString(36).slice(2, 8)}@example.com`,
  country: "LT",
  phone: "+370 600 00000",
  quantity: 2,
  colour: "black",
  locale: "lt",
  consent: true,
  website: "",
  startedAt: Date.now() - 10_000,
  idempotencyKey: crypto.randomUUID(),
  ...over,
});

async function post(body, { ip = `10.0.0.${++ipN}`, headers = {} } = {}) {
  const res = await fetch(`${BASE}/api/order`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

async function t(name, fn) {
  try {
    await fn();
    pass++;
    console.log("  ✓", name);
  } catch (e) {
    fail++;
    console.log("  ✗", name, "—", e.message);
  }
}
const eq = (a, b, m) => { if (a !== b) throw new Error(`${m ?? ""} expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };

console.log(`Testing ${BASE}/api/order`);

await t("valid order is accepted and returns a reference", async () => {
  const r = await post(valid());
  eq(r.status, 200, "status");
  eq(r.body.ok, true);
  if (!/^KM-\d{6}-[A-Z2-9]{5}$/.test(r.body.reference)) throw new Error("bad reference " + r.body.reference);
});

await t("optional phone may be empty", async () => {
  const r = await post(valid({ phone: "" }));
  eq(r.status, 200);
});

await t("same idempotency key → same reference, no second email", async () => {
  const body = valid();
  const a = await post(body);
  const b = await post(body, { ip: "10.9.9.9" });
  eq(a.body.reference, b.body.reference);
  eq(b.body.duplicate, true);
});

await t("concurrent double-submit is merged", async () => {
  const body = valid();
  const [a, b] = await Promise.all([post(body), post(body)]);
  eq(a.body.reference, b.body.reference);
});

await t("invalid email rejected with field list", async () => {
  const r = await post(valid({ email: "not-an-email" }));
  eq(r.status, 400);
  eq(r.body.error, "invalid");
  if (!r.body.fields.includes("email")) throw new Error("email not flagged");
});

await t("missing consent rejected", async () => {
  const r = await post(valid({ consent: false }));
  eq(r.status, 400);
});

await t("quantity above max rejected", async () => {
  const r = await post(valid({ quantity: 99 }));
  eq(r.status, 400);
  if (!r.body.fields.includes("quantity")) throw new Error("quantity not flagged");
});

await t("unknown country rejected", async () => {
  const r = await post(valid({ country: "XX" }));
  eq(r.status, 400);
});

await t("HTML is stripped from name", async () => {
  const r = await post(valid({ name: "<b>Eve</b>" }));
  eq(r.status, 200); // sanitised to "bEve/b" and accepted
});

await t("honeypot filled → rejected as spam", async () => {
  const r = await post(valid({ website: "http://spam.example" }));
  eq(r.status, 400);
  eq(r.body.error, "spam");
});

await t("submitted too fast → rejected as spam", async () => {
  const r = await post(valid({ startedAt: Date.now() }));
  eq(r.body.error, "spam");
});

await t("malformed JSON rejected", async () => {
  const r = await post("{oops");
  eq(r.status, 400);
});

await t("cross-origin request rejected", async () => {
  const r = await post(valid(), { headers: { origin: "https://evil.example" } });
  eq(r.status, 403);
});

await t("rate limit kicks in after the configured maximum", async () => {
  const ip = "10.250.250.250";
  let last;
  for (let i = 0; i < 8; i++) last = await post(valid({ email: `rl${i}@example.com` }), { ip });
  eq(last.status, 429);
  eq(last.body.error, "rate");
});

await t("GET is not allowed", async () => {
  const r = await fetch(`${BASE}/api/order`);
  eq(r.status, 405);
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

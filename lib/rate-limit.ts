/**
 * Simple in-memory sliding-window rate limiter.
 *
 * ⚠ On serverless platforms each instance has its own memory, so limits are
 * per-instance (still effective against bursts). For strict global limits use
 * a shared store such as Upstash Redis / Vercel KV — see README.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - hits[0])) / 1000) };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  }
  return { ok: true, retryAfter: 0 };
}

/** Idempotency / duplicate-submission cache (per-entry TTL) */
const seen = new Map<string, { reference: string; expires: number }>();
const DAY = 24 * 60 * 60 * 1000;

export function recall(key: string) {
  const hit = seen.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expires) {
    seen.delete(key);
    return null;
  }
  return hit.reference;
}

export function remember(key: string, reference: string, ttlMs = DAY) {
  seen.set(key, { reference, expires: Date.now() + ttlMs });
  if (seen.size > 5000) {
    const now = Date.now();
    for (const [k, v] of seen) if (now > v.expires) seen.delete(k);
  }
}

/** For tests only */
export function __resetRateLimits() {
  buckets.clear();
  seen.clear();
}

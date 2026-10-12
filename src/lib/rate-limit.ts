import "server-only";

import { headers } from "next/headers";

/**
 * A tiny in-memory rate limiter.
 *
 * Good enough for a single-admin site: it stops a script from hammering the
 * login form or the contact endpoint. It is per-instance and resets when the
 * process restarts, which is an accepted limitation documented in the README —
 * a distributed limiter would mean another service, and that is not justified
 * here.
 */

type Bucket = { count: number; resetAt: number };

const globalForLimiter = globalThis as unknown as {
  _rateBuckets?: Map<string, Bucket>;
};

const buckets = (globalForLimiter._rateBuckets ??= new Map<string, Bucket>());

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSeconds: number };

/** Count one hit against `key`. Fixed window: `limit` hits per `windowMs`. */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();

  // Opportunistic cleanup so the map cannot grow without bound.
  if (buckets.size > 5000) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count };
}

/** Forgive a key (e.g. clear the login counter after a success). */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

/**
 * Best-effort client IP for rate-limit keys.
 *
 * Behind Vercel (and most proxies) `x-forwarded-for` holds the chain; the first
 * entry is the client. Falls back to `x-real-ip`, then a constant so a missing
 * header degrades to a shared bucket rather than no limiting at all.
 */
export async function getClientIp(): Promise<string> {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return requestHeaders.get("x-real-ip") ?? "unknown";
}
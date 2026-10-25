import "server-only";
import { createHash, createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { appSecret, env } from "./env";
import { log } from "./log";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, keylen: number, opts: object) => Promise<Buffer>;

/* ── Hashing helpers ─────────────────────────────────────────── */

export const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");
export const hmac = (v: string) => createHmac("sha256", appSecret()).update(v).digest("base64url");

export function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/* ── Passwords (scrypt, N=2^15) ──────────────────────────────── */

const SCRYPT = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scrypt(password.normalize("NFKC"), salt, 64, SCRYPT);
  return `scrypt$${SCRYPT.N}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [alg, n, saltB64, keyB64] = stored.split("$");
  if (alg !== "scrypt" || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, "base64");
  const key = await scrypt(password.normalize("NFKC"), Buffer.from(saltB64, "base64"), expected.length, {
    ...SCRYPT,
    N: Number(n),
  });
  return timingSafeEqual(key, expected);
}

/* ── Client identity for rate limiting ───────────────────────── */

/**
 * Returns a salted hash of the client IP. The raw IP is never stored.
 * On Vercel, x-forwarded-for is set by the platform and is trustworthy.
 */
export function clientKey(headers: Headers) {
  const trust = env().TRUST_PROXY !== "false";
  const fwd = trust ? headers.get("x-forwarded-for")?.split(",")[0]?.trim() : null;
  const ip = fwd || headers.get("x-real-ip") || "unknown";
  return hmac(`ip:${ip}`).slice(0, 32);
}

/* ── Rate limiting (fixed window, stored in Postgres) ────────── */

export type RateResult = { ok: boolean; remaining: number; retryAfter: number };

export async function rateLimit(bucket: string, id: string, limit: number, windowSeconds: number): Promise<RateResult> {
  const windowMs = windowSeconds * 1000;
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const key = `${bucket}:${id}`;
  const db = await getDb();
  const rows = await db
    .insert(schema.rateLimits)
    .values({ key, windowStart, count: 1 })
    .onConflictDoUpdate({
      target: [schema.rateLimits.key, schema.rateLimits.windowStart],
      set: { count: sql`${schema.rateLimits.count} + 1` },
    })
    .returning({ count: schema.rateLimits.count });
  const count = rows[0]?.count ?? 1;

  // Opportunistic cleanup of old windows (cheap, indexed by PK prefix).
  if (Math.random() < 0.02) {
    db.delete(schema.rateLimits)
      .where(sql`${schema.rateLimits.windowStart} < ${now - 24 * 3600 * 1000}`)
      .catch((e) => log.warn("rate_limit.cleanup_failed", { error: String(e) }));
  }

  return {
    ok: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfter: Math.ceil((windowStart + windowMs - now) / 1000),
  };
}

/* ── Bot protection ──────────────────────────────────────────── */

export const turnstileEnabled = () => Boolean(env().TURNSTILE_SECRET_KEY);

export async function verifyTurnstile(token: string, remoteKey?: string): Promise<boolean> {
  const secret = env().TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured — honeypot + timing + rate limits still apply
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, ...(remoteKey ? { idempotency_key: remoteKey } : {}) }),
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (e) {
    log.error("turnstile.verify_failed", { error: String(e) });
    return false;
  }
}

/** Honeypot + minimum fill time. Returns a reason string when it looks automated. */
export function botSignals(input: { website?: string; startedAt: number }, minSeconds: number) {
  if (input.website) return "honeypot";
  const elapsed = (Date.now() - input.startedAt) / 1000;
  if (elapsed < minSeconds) return "too_fast";
  if (elapsed > 60 * 60 * 24 * 7) return "stale";
  return null;
}

/** Same-origin check for state-changing JSON requests. */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients; other protections apply
  try {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

/** Short human-friendly application reference, e.g. ND-7K4Q-M2XP. */
export function applicationReference() {
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const bytes = randomBytes(8);
  let s = "";
  for (let i = 0; i < 8; i++) s += alphabet[bytes[i] % alphabet.length];
  return `ND-${s.slice(0, 4)}-${s.slice(4)}`;
}

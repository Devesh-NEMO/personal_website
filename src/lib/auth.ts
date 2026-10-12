import "server-only";

import { timingSafeEqual } from "node:crypto";

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * ============================================================================
 * ADMIN AUTH
 * ============================================================================
 * Single admin, no user table. Credentials come from environment variables:
 *
 *   ADMIN_EMAIL          the login address
 *   ADMIN_PASSWORD_HASH  bcrypt hash (generate with `npm run hash-password`)
 *   SESSION_SECRET       long random string that signs the session cookie
 *
 * The session is a signed JWT (HS256) in an httpOnly, sameSite=strict cookie.
 * There is no server-side session store: the cookie is self-contained and
 * expires on its own, and rotating SESSION_SECRET invalidates every session.
 */

const COOKIE_NAME = "admin_session";
/** 7 days. Long enough to be convenient, short enough to bound exposure. */
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

function getSecret(): Uint8Array | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

/** Constant-time string equality that tolerates differing lengths. */
function safeEqual(a: string, b: string): boolean {
  const aBytes = Buffer.from(a);
  const bBytes = Buffer.from(b);
  if (aBytes.length !== bBytes.length) return false;
  return timingSafeEqual(aBytes, bBytes);
}

/** Sign a fresh session and set it as an httpOnly cookie. Server actions only. */
export async function createSession(email: string): Promise<void> {
  const secret = getSecret();
  if (!secret) throw new Error("SESSION_SECRET is not set");

  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secret);

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    // Secure cookies are skipped on http://localhost, so only require them in
    // production — which is also the only place the session is on the wire.
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

/** Clear the session cookie. Server actions only. */
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

/** The current session payload, or null when absent/invalid/expired. */
export async function getSession(): Promise<{ email: string } | null> {
  const secret = getSecret();

  // Always read the cookie jar, before any early return. `cookies()` is a
  // request-time API: touching it is what registers the dynamic dependency, so
  // the route is consistently partially prerendered. Skipping it when the
  // secret is unset (e.g. a build without SESSION_SECRET) would let the route
  // bake into a fully static page whose session check never re-runs.
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!secret || !token) return null;

  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    if (payload.sub !== "admin" || typeof payload.email !== "string") return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}

/** Redirects to the login page unless the request carries a valid session. */
export async function requireAdmin(): Promise<{ email: string }> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/**
 * Compare submitted credentials against the environment without leaking which
 * half was wrong:
 *
 *  - the email is compared in constant time, and
 *  - bcrypt runs even when the email already failed, so both paths take the
 *    same amount of time.
 */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !adminHash) return false;

  const emailMatches = safeEqual(email.trim().toLowerCase(), adminEmail.trim().toLowerCase());
  const passwordMatches = await bcrypt.compare(password, adminHash);

  return emailMatches && passwordMatches;
}
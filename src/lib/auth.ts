/**
 * Admin auth: one shared password (ADMIN_PASSWORD) and an HMAC-signed,
 * httpOnly cookie (AUTH_SECRET). Decision 0003. Server-only.
 *
 * - `src/proxy.ts` redirects unauthenticated /admin/* requests to /admin/login.
 * - Server components and server actions must still call `requireAdmin()`
 *   (or `getSession()`) themselves; the proxy is not the only check.
 * - With cacheComponents on, anything that reads the session reads cookies,
 *   so render it inside <Suspense>.
 */
import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  getAuthSecret,
  signSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/auth-token";

export { ADMIN_COOKIE, type SessionPayload };

export const LOGIN_PATH = "/admin/login";

const DEV_PASSWORD = "admin";

function getAdminPassword(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (password) return password;
  if (process.env.NODE_ENV !== "production") return DEV_PASSWORD;
  return null;
}

/** Constant-time check of a submitted password against ADMIN_PASSWORD. */
export function verifyAdminPassword(input: string): boolean {
  const expected = getAdminPassword();
  if (!expected || !input) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

/** Sets the session cookie. Call from a server action or route handler. */
export async function createSession(): Promise<void> {
  const secret = getAuthSecret();
  if (!secret) throw new Error("AUTH_SECRET is not set (min 16 characters).");
  const now = Math.floor(Date.now() / 1000);
  const token = await signSessionToken(
    { sub: "admin", iat: now, exp: now + SESSION_MAX_AGE_SECONDS },
    secret,
  );
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/** The current admin session, or null. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

/** Deletes the session cookie. Call from a server action or route handler. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

/**
 * Use at the top of every admin server action and in admin server components.
 * Redirects to /admin/login when there is no valid session.
 */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect(LOGIN_PATH);
  return session;
}

/** Only allow same-site relative redirects after login. */
export function safeNextPath(value: unknown): string {
  if (typeof value !== "string") return "/admin";
  if (!value.startsWith("/admin") || value.startsWith("//")) return "/admin";
  if (value.startsWith(LOGIN_PATH)) return "/admin";
  return value;
}

/**
 * Admin auth: env-based users with roles (decision 0006, extends 0003) and an
 * HMAC-signed, httpOnly cookie (AUTH_SECRET). Server-only.
 *
 * Sign-in (email + password):
 * - super_admin: email = SUPER_ADMIN_EMAIL (case-insensitive), password = SUPER_ADMIN_PASSWORD.
 * - staff: any email, password = ADMIN_PASSWORD.
 * - viewer: any email, password = VIEWER_PASSWORD (optional).
 * - Legacy: when SUPER_ADMIN_EMAIL/PASSWORD are not both set, ADMIN_PASSWORD
 *   signs in as super_admin so a single-password deploy keeps full access.
 * - Outside production, unset values fall back to dev defaults
 *   (super admin DEV_SUPER_EMAIL / "admin", staff any email / "staff").
 *
 * - `src/proxy.ts` redirects unauthenticated /admin/* requests to /admin/login.
 * - Server components and server actions must still call `requireAdmin()` or
 *   `requirePermission()` (src/lib/rbac.ts) themselves.
 * - With cacheComponents on, anything that reads the session reads cookies,
 *   so render it inside <Suspense>.
 */
import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  getAuthSecret,
  signSessionToken,
  verifySessionToken,
  type Role,
  type SessionPayload,
} from "@/lib/auth-token";

export { ADMIN_COOKIE, type Role, type SessionPayload };

export const LOGIN_PATH = "/admin/login";

const DEV_SUPER_EMAIL = "ahmadsalmankhan137@gmail.com";
const DEV_SUPER_PASSWORD = "admin";
const DEV_STAFF_PASSWORD = "staff";

const isProduction = () => process.env.NODE_ENV === "production";
const env = (name: string) => process.env[name]?.trim() || null;

/** Constant-time string compare (hashes first so lengths do not leak). */
function safeEqual(input: string, expected: string | null): boolean {
  if (!expected || !input) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export type SignedInUser = Pick<SessionPayload, "role" | "email" | "name">;

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local.slice(0, 100) || email;
}

/**
 * Resolve an email + password to a user and role, or null. Every candidate is
 * compared so timing does not reveal which password matched.
 */
export function verifyCredentials(rawEmail: string, password: string): SignedInUser | null {
  const email = rawEmail.trim().toLowerCase();
  if (!email || !email.includes("@") || email.length > 254 || !password) return null;

  const superEmailEnv = env("SUPER_ADMIN_EMAIL");
  const superPasswordEnv = env("SUPER_ADMIN_PASSWORD");
  const adminPasswordEnv = env("ADMIN_PASSWORD");
  const dev = !isProduction();

  const superEmail = (superEmailEnv ?? (dev ? DEV_SUPER_EMAIL : null))?.toLowerCase() ?? null;
  const superPassword = superPasswordEnv ?? (dev ? DEV_SUPER_PASSWORD : null);
  const staffPassword = adminPasswordEnv ?? (dev ? DEV_STAFF_PASSWORD : null);
  const viewerPassword = env("VIEWER_PASSWORD");
  // Legacy single-password deploys: ADMIN_PASSWORD keeps full access until
  // SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are both set.
  const legacy = Boolean(adminPasswordEnv) && !(superEmailEnv && superPasswordEnv);

  const superMatch = safeEqual(email, superEmail) && safeEqual(password, superPassword);
  const staffMatch = safeEqual(password, staffPassword);
  const viewerMatch = safeEqual(password, viewerPassword);

  let role: Role | null = null;
  if (superMatch || (legacy && staffMatch)) role = "super_admin";
  else if (staffMatch) role = "staff";
  else if (viewerMatch) role = "viewer";
  if (!role) return null;
  return { role, email, name: nameFromEmail(email) };
}

/** Sets the session cookie. Call from a server action or route handler. */
export async function createSession(user: SignedInUser): Promise<void> {
  const secret = getAuthSecret();
  if (!secret) throw new Error("AUTH_SECRET is not set (min 16 characters).");
  const now = Math.floor(Date.now() / 1000);
  const token = await signSessionToken(
    { sub: "admin", ...user, iat: now, exp: now + SESSION_MAX_AGE_SECONDS },
    secret,
  );
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/** The current admin session, or null. */
export async function getSession(): Promise<SessionPayload | null> {
  // Request-time only: the token check compares against Date.now(), which
  // cacheComponents must not see during prerendering.
  await connection();
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

/** Deletes the session cookie. Call from a server action or route handler. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

/**
 * Any signed-in role. Redirects to /admin/login when there is no valid session.
 * Prefer `requirePermission()` from src/lib/rbac.ts, which also checks the role.
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

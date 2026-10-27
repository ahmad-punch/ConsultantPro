/**
 * Signed session tokens (HMAC-SHA256, Web Crypto). No Next.js imports so the
 * proxy and server code can both use it. Token: base64url(payload).base64url(sig)
 */

export const ADMIN_COOKIE = "rasta_admin";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

/** Control-panel roles. Permissions per role live in src/lib/rbac.ts. */
export const ROLES = ["super_admin", "staff", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export type SessionPayload = {
  sub: "admin";
  role: Role;
  /** Lower-cased sign-in email. */
  email: string;
  /** Display name (email local part for env-based users). */
  name: string;
  /** Issued at, seconds since epoch. */
  iat: number;
  /** Expires at, seconds since epoch. */
  exp: number;
};

const DEV_SECRET = "rasta-dev-secret-change-me";

/** AUTH_SECRET, with a fixed fallback outside production. Null if unusable. */
export function getAuthSecret(): string | null {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV !== "production") return DEV_SECRET;
  return null;
}

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signSessionToken(
  payload: SessionPayload,
  secret: string,
): Promise<string> {
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const key = await hmacKey(secret);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(body)));
  return `${body}.${toBase64Url(sig)}`;
}

/** Returns the payload when the signature is valid and not expired, else null. */
export async function verifySessionToken(
  token: string | undefined | null,
  secret: string | null = getAuthSecret(),
): Promise<SessionPayload | null> {
  if (!token || !secret) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const key = await hmacKey(secret);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(sig),
      encoder.encode(body),
    );
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as SessionPayload;
    if (payload.sub !== "admin" || typeof payload.exp !== "number") return null;
    // Tokens from before roles existed carry no role: force a fresh sign-in.
    if (!isRole(payload.role) || typeof payload.email !== "string") return null;
    if (payload.exp * 1000 <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

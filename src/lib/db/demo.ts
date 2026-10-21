/**
 * Demo mode: a deployed build (production or Vercel) with no DATABASE_URL.
 *
 * Serverless filesystems are read-only (except /tmp), so the on-disk PGlite
 * used in development cannot work there. Instead the app runs an in-memory
 * PGlite, applies the migrations in `drizzle/` and loads the demo seed once
 * per server process. Data resets on every cold start and is not shared
 * between serverless instances. Set DATABASE_URL (Neon) to leave demo mode.
 *
 * Env-only checks, no imports: safe to call from any server code, including
 * src/lib/db/index.ts itself. See docs/decisions/0007-demo-mode-without-database.md.
 */

/** True when the app runs on a deploy without a database. */
export function isDemoMode(): boolean {
  if (process.env.DATABASE_URL) return false;
  return process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
}

/** Whether demo mode loads the demo seed at startup (DEMO_SEED=0 turns it off). */
export function shouldSeedDemo(): boolean {
  return process.env.DEMO_SEED !== "0";
}

/** One-sentence explanation for the UI, or null when not in demo mode. */
export function demoModeReason(): string | null {
  if (!isDemoMode()) return null;
  return "No database connected. Data resets on each cold start and is not shared between servers. Add DATABASE_URL (Neon free tier) to keep data. See docs/DEPLOY.md.";
}

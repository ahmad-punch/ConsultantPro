import { connection } from "next/server";

import { isDemoMode } from "@/lib/db/demo";

/**
 * Slim amber bar shown across the control panel in demo mode (deployed with
 * no DATABASE_URL). Reads the environment at request time, so render it
 * inside <Suspense>.
 */
export async function DemoBanner() {
  await connection();
  if (!isDemoMode()) return null;
  return (
    <div
      role="status"
      className="border-b border-amber-300 bg-amber-100 px-4 py-1.5 text-xs leading-snug text-amber-950 sm:px-6 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
    >
      <span className="font-semibold">Demo mode:</span> no database connected. Data resets on
      each cold start and is not shared between servers. Add DATABASE_URL (Neon free tier) to
      keep data. See docs/DEPLOY.md.
    </div>
  );
}

import { connection } from "next/server";

import { getDbDriver } from "@/lib/db";
import { isDemoMode } from "@/lib/db/demo";

/**
 * Liveness check for uptime monitors. Does not query the database.
 * `mode` is "demo" when no DATABASE_URL is set on a deploy (in-memory data
 * that resets on cold start), otherwise "persistent".
 */
export async function GET() {
  await connection(); // request time, never prerendered
  return Response.json({
    ok: true,
    db: getDbDriver(),
    mode: isDemoMode() ? "demo" : "persistent",
  });
}

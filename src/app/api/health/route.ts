import { connection } from "next/server";

import { getDbDriver } from "@/lib/db";

/** Liveness check for uptime monitors. Does not query the database. */
export async function GET() {
  await connection(); // request time, never prerendered
  return Response.json({ ok: true, db: getDbDriver() });
}

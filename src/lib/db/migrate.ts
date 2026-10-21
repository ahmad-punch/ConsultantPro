/**
 * `pnpm db:migrate`: apply SQL migrations in drizzle/ to DATABASE_URL (Neon),
 * or to the local PGlite folder when DATABASE_URL is unset.
 * (Deployed demo mode needs no migrate step: it migrates its in-memory PGlite
 * at startup. See src/lib/db/demo.ts.)
 */
import { config } from "dotenv";

config({ path: [".env.local", ".env"], quiet: true });

async function main() {
  const { closeDb, getDbDriver, migrateDb } = await import("./index");
  await migrateDb();
  console.log(`Migrations applied (${getDbDriver()}).`);
  await closeDb();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

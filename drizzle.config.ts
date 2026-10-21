import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: [".env.local", ".env"], quiet: true });

/**
 * `pnpm db:generate` writes SQL migrations to drizzle/ (no database needed).
 * `pnpm db:push` and `pnpm db:studio` target DATABASE_URL (Neon). Local
 * PGlite applies the migrations in drizzle/ automatically on first use, so
 * never `db:push` into the local .pglite/ folder.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});

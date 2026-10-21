/**
 * Database client.
 *
 * - DATABASE_URL set   -> Neon over HTTP (drizzle-orm/neon-http). Production.
 * - DATABASE_URL unset, development -> PGlite (embedded Postgres) persisted
 *   to `.pglite/`.
 * - DATABASE_URL unset, deployed (NODE_ENV=production or VERCEL set) -> demo
 *   mode: in-memory PGlite, migrated and loaded with the demo seed once per
 *   process (unless DEMO_SEED=0). Data resets on every cold start and may
 *   differ between serverless instances. See src/lib/db/demo.ts.
 * - During `next build` without DATABASE_URL an in-memory PGlite (no seed) is
 *   used so parallel build workers never open the same data folder.
 *
 * PGlite applies the SQL migrations in `drizzle/` automatically before the
 * first query runs (every query waits on that promise). Neon is migrated
 * explicitly with `pnpm db:migrate` or `pnpm db:push`.
 *
 * Rules for callers:
 * - Import `db` from "@/lib/db" in server code only (server components,
 *   server actions, route handlers, scripts). Never in client components.
 * - Do not use `db.transaction()`: the neon-http driver does not support
 *   interactive transactions. Write sequentially instead.
 * - Do not use `db.batch()`: PGlite does not support it.
 */
import path from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { migrate as migrateNeon } from "drizzle-orm/neon-http/migrator";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";

import { isDemoMode, shouldSeedDemo } from "./demo";
import * as schema from "./schema";

export { schema };

/** The driver-agnostic database type. Use it for helper parameters. */
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

export type DbDriver = "neon" | "pglite" | "pglite-memory";

const CASING = "snake_case" as const;
const MIGRATIONS_FOLDER = path.join(process.cwd(), "drizzle");
const PGLITE_DIR = path.join(process.cwd(), ".pglite");

type DbHandle = {
  db: Database;
  driver: DbDriver;
  /**
   * Resolves once the database is ready (PGlite: migrations applied, demo
   * seed loaded). Created once per handle, so concurrent first requests all
   * wait on the same initialisation.
   */
  ready: Promise<void>;
  close: () => Promise<void>;
};

declare global {
  // Survives Next dev HMR so PGlite is opened once per process. Created
  // synchronously on first use, so there is only ever one handle (and one
  // `ready` promise) per process.
  var __rastaDb: DbHandle | undefined;
}

function createNeon(url: string): DbHandle {
  const db = drizzleNeon({ client: neon(url), schema, casing: CASING });
  return {
    db: db as unknown as Database,
    driver: "neon",
    ready: Promise.resolve(),
    close: async () => {},
  };
}

function createPglite(dataDir: string | undefined, seedDemo = false): DbHandle {
  const raw = new PGlite(dataDir);
  const ready = (async () => {
    await raw.waitReady;
    // Ungated instance: the gated client below waits on this very promise.
    const direct = drizzlePglite(raw, { schema, casing: CASING });
    await migratePglite(direct, { migrationsFolder: MIGRATIONS_FOLDER });
    if (seedDemo) {
      try {
        const { seedDatabase } = await import("./seed");
        await seedDatabase(direct as unknown as Database);
        console.info("[db] Demo mode: in-memory database seeded with demo data.");
      } catch (error) {
        // An empty database still works; do not take the site down.
        console.error("[db] Demo mode: seeding failed.", error);
      }
    }
  })();
  // Avoid an unhandled rejection; the error surfaces on the first query.
  ready.catch(() => {});

  // Drizzle's PGlite session only calls `query` and `transaction` on the
  // client. Gate both on `ready` so the first query waits for migrations.
  const gated = {
    query: async (...args: Parameters<PGlite["query"]>) => {
      await ready;
      return raw.query(...args);
    },
    transaction: async (...args: Parameters<PGlite["transaction"]>) => {
      await ready;
      return raw.transaction(...args);
    },
  } as unknown as PGlite;

  return {
    db: drizzlePglite(gated, { schema, casing: CASING }) as unknown as Database,
    driver: dataDir ? "pglite" : "pglite-memory",
    ready,
    close: async () => {
      await ready.catch(() => {});
      if (!raw.closed) await raw.close();
    },
  };
}

function createHandle(): DbHandle {
  const url = process.env.DATABASE_URL;
  if (url) return createNeon(url);
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";
  if (isBuild) return createPglite(undefined);
  if (isDemoMode()) return createPglite(undefined, shouldSeedDemo());
  return createPglite(PGLITE_DIR);
}

function getHandle(): DbHandle {
  if (!globalThis.__rastaDb) globalThis.__rastaDb = createHandle();
  return globalThis.__rastaDb;
}

/**
 * The shared Drizzle instance. Created lazily on first use, so importing this
 * module never opens a connection by itself.
 */
export const db: Database = new Proxy({} as Database, {
  get(_target, prop) {
    const real = getHandle().db;
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

/** Which driver is in use ("neon", "pglite" or "pglite-memory"). */
export function getDbDriver(): DbDriver {
  return getHandle().driver;
}

/**
 * Apply pending migrations from `drizzle/`. PGlite does this automatically;
 * scripts call it for Neon (`pnpm db:migrate`).
 */
export async function migrateDb(): Promise<void> {
  const handle = getHandle();
  if (handle.driver === "neon") {
    await migrateNeon(handle.db as never, { migrationsFolder: MIGRATIONS_FOLDER });
    return;
  }
  await handle.ready;
}

/** Close the connection. Scripts must call this so PGlite flushes to disk. */
export async function closeDb(): Promise<void> {
  const handle = globalThis.__rastaDb;
  if (!handle) return;
  globalThis.__rastaDb = undefined;
  await handle.close();
}

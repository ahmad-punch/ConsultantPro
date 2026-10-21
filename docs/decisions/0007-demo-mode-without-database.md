# 0007. Demo mode when deployed without a database

Status: accepted, 2026-10-21.

## Context
The site is deployed on Vercel before a database exists. Without `DATABASE_URL` the app fell back to PGlite persisted to `.pglite/`, but Vercel's filesystem is read-only except `/tmp`, so every database read failed and the control panel was unusable. The founders want the deployed site and panel to work for demos until they add a free Neon database.

## Decision
- `DATABASE_URL` set: Neon, unchanged.
- `DATABASE_URL` unset and deployed (`NODE_ENV=production` or `VERCEL` set): **demo mode**. An in-memory PGlite starts on first use, applies the migrations in `drizzle/` and loads the demo seed (`seedDatabase` from `src/lib/db/seed.ts`) once per process, unless `DEMO_SEED=0`.
- `DATABASE_URL` unset in development: on-disk `.pglite/`, unchanged. During `next build`: in-memory, unseeded, unchanged.
- One handle and one initialisation promise per process (`globalThis.__rastaDb`); concurrent first requests wait on the same promise.
- `src/lib/db/demo.ts` holds the env checks (`isDemoMode`, `demoModeReason`). Demo mode is visible: an amber bar in the control panel, a "Demo site" line in the public footer, and `"mode": "demo"` from `/api/health`.
- `drizzle/` is added to `outputFileTracingIncludes` so migrations ship with the serverless functions.

We chose in-memory over PGlite in `/tmp` because `/tmp` is just as ephemeral per instance on Vercel and adds file-locking risk between invocations, with no real benefit.

## Consequences
- The deployed site and panel work with zero database setup.
- Data resets on every cold start and differs between serverless instances. Leads submitted on the public site in demo mode can be lost. Demo mode is for showing the product, not for real clients.
- Leaving demo mode needs only `DATABASE_URL` and a redeploy (steps in `docs/DEPLOY.md`).
- Seeding takes a moment on each cold start; the first request of a new instance is slower.
- `pnpm start` locally without `DATABASE_URL` is now demo mode too (previously `.pglite/`).

# Rasta

Website, control panel, content and marketing assets for Rasta, a navigation and case-management service for overseas Pakistanis.

Start with [`CLAUDE.md`](CLAUDE.md) (rules and commands), then [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) (stack, folders, data model, ownership) and [`docs/STATUS.md`](docs/STATUS.md) (what is done and next).

## Quick start

```bash
pnpm install
pnpm db:seed     # optional: demo data in a local PGlite database (.pglite/)
pnpm dev         # http://localhost:3000, control panel at /admin (dev password: admin)
```

No environment variables are needed locally. Copy `.env.example` to `.env.local` to set them; `DATABASE_URL` switches from local PGlite to Neon.

| Command | What it does |
|---|---|
| `pnpm lint && pnpm typecheck && pnpm build` | Must pass before any commit |
| `pnpm db:generate` | Write a SQL migration to `drizzle/` after changing `src/lib/db/schema.ts` |
| `pnpm db:migrate` | Apply migrations to `DATABASE_URL` (or local PGlite) |
| `pnpm db:push` | Push the schema straight to `DATABASE_URL` (Neon only) |
| `pnpm db:seed` | Replace all data with demo data (stop `pnpm dev` first) |

Decisions live in [`docs/decisions/`](docs/decisions/), gotchas in [`docs/LEARNINGS.md`](docs/LEARNINGS.md), the business plan in [`docs/BUSINESS-PLAN.md`](docs/BUSINESS-PLAN.md).

# 0003. Stack: Next.js, Drizzle, Postgres (Neon) with PGlite locally, no paid services

Status: accepted, 2026-10-21.

## Context
Must run on Vercel free tier, connect to a database later, store client documents in the client's own storage (Google Drive links), and be easy for AI agents to extend.

## Decision
- Next.js (latest, App Router, `src/`), TypeScript strict, Tailwind v4, shadcn/ui, lucide icons.
- Drizzle ORM with the Postgres dialect. Production uses Neon (free tier) through `DATABASE_URL`. Local dev with no `DATABASE_URL` uses PGlite (embedded Postgres) persisted to `.pglite/` (gitignored). Same schema, same queries.
- Control panel auth: single shared admin password (`ADMIN_PASSWORD`) with an HMAC-signed httpOnly cookie. Upgrade to Auth.js when there are more than three staff.
- Documents are never uploaded. Each case stores `driveFolderUrl` and `memoDocUrl` (Google Docs / Drive links owned by the client or the company account).
- Payments: Stripe payment links (env vars) rendered as buttons; payment status recorded manually in the panel until a webhook is added.
- Content: pathway guides as MDX in `content/guides/`, rendered with next-mdx-remote.

## Consequences
- `pnpm dev` works with zero setup. Setting `DATABASE_URL` switches to Neon.
- No file storage bill, no auth provider bill.
- When adding a dependency, prefer free-tier or self-contained options.

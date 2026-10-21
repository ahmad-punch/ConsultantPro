# Status

Updated: 2026-10-21. One line per item. Move items between sections, do not delete them.

## Done
- Business plan and research (see `docs/research/` and the plan summary in `docs/BUSINESS-PLAN.md`).
- Repo initialised, Next.js scaffold, docs structure.
- Foundation: schema + migrations, db client (Neon / PGlite), seed data, admin auth + proxy, brand config, pricing config, design tokens, shadcn UI kit. `pnpm lint`, `typecheck`, `build`, `db:seed` pass.
- Content: 10 pathway guides in `content/guides/`, and marketing assets in `marketing/` (strategy, WhatsApp posts, group scripts, ambassador pitch, FAQ replies, objection handling, price sheet, video scripts, email sequence, channels CSV). Needs a native Urdu review and a lawyer fact-check before launch.

## In progress
- Public site (marketing).
- Control panel (admin).

## Next
- Deploy to Vercel (free tier), set env vars, connect Neon Postgres.
- Stripe payment links through a UK or US entity.
- First 5 Pathway Memo templates as Google Docs.
- Recruit 2 partner advocates and 2 errand runners; load them into the panel.
- Run the 90-day test (plan Section 10).

## Open decisions
- Fill `TODO:` placeholders in `src/lib/site.ts` (WhatsApp number, email, legal entity, socials) once decided.
- Brand name and domain. Working name "Rasta" (راستہ). See decision 0002.
- Customer-facing entity: UK Ltd vs US LLC.
- Which advocate fee flow to use (plan Section 4.7, options a or b). Needs a Bar Council member.
- Whether lawyer-fronted videos are allowed under Bar Council Rule 135.
- Analytics: Vercel Analytics only, or add PostHog free tier.
- Email provider for transactional mail (Resend free tier is the default candidate).

## Blocked
- Nothing blocked.

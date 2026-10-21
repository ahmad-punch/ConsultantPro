# Changelog

Format: Keep a Changelog. Newest first. Group by Added / Changed / Fixed / Removed / Docs.

## [Unreleased]
### Added
- Repo structure, CLAUDE.md, docs skeleton, decision records 0001-0003.
- Next.js app scaffold (App Router, TypeScript, Tailwind).
- Foundation: dependencies (Drizzle, Neon, PGlite, zod, next-mdx-remote, react-hook-form, Vercel Analytics, lucide), shadcn/ui kit (button, card, input, textarea, select, badge, table, dialog, sheet, tabs, label, separator, dropdown-menu, field, sonner, skeleton, avatar, tooltip).
- Foundation: `src/lib/site.ts` (brand), `src/lib/pricing.ts` (catalogue and retainer tiers), `src/lib/db/schema.ts` + `enums.ts` (data model), `src/lib/db/index.ts` (Neon or PGlite), initial migration in `drizzle/`, `pnpm db:seed` demo data, `src/lib/auth.ts` + `src/proxy.ts` (admin password and signed cookie), `src/lib/ids.ts`, `src/lib/validation/common.ts`.
- Design tokens: Fraunces display, Inter body, deep green primary, warm paper background, terracotta highlight; `.env.example`.
- Content: 10 pathway guides (`content/guides/*.mdx`) and the marketing pack (`marketing/`: strategy, WhatsApp posts, group intro scripts, ambassador pitch, FAQ replies, objection handling, price sheet, video scripts, email sequence, channels CSV).
- Public site (`src/app/(marketing)/`): home, `/pricing`, `/how-it-works`, `/guides` + `/guides/[slug]` (MDX, table of contents, Urdu summary, related guides), `/start` intake form, `/about`, `/faq`, `/legal/terms`, `/legal/privacy`, `/legal/disclaimer` (drafts), group `not-found`, `sitemap.xml`, generated Open Graph image, JSON-LD (Organization, FAQPage, Article).
- Marketing components (`src/components/marketing/`): header with mobile sheet nav, footer, wordmark, HTML Pathway Memo mock, offering cards with Stripe or "Pay on invoice" buttons, cited stats with sources, trust stack, FAQ disclosure list, guide cards with Urdu toggle, MDX prose components, visible `TODO:` marker.
- `src/lib/guides.ts` (gray-matter guide loader) and `src/lib/actions/leads-public.ts` (public intake server action: zod, honeypot, in-memory IP rate limit, inserts into `leads`).
- `public/icon.svg` favicon, `src/app/robots.ts` and a root `src/app/not-found.tsx`.
- `docs/DEPLOY.md` (Vercel + Neon free tier), `docs/RUNBOOK.md` (daily and weekly operating rhythm), `.github/pull_request_template.md`.
- Control panel "Rasta Control" (`src/app/(admin)/admin/`): sidebar shell with mobile sheet nav and a global New case / New lead menu; dashboard (next actions due and overdue, memos older than 3 working days, new leads, pipeline by stage, revenue this month, paid cases vs the gate); leads (filters, search, sort, detail with Mark contacted / Mark lost / Reopen / Convert to case); cases (filters, sort, list and `?view=board` pipeline, new case form with list-price defaults, detail with stage stepper, Advance stage, Set stage, Mark memo delivered, Record payment, Close out with NPS and would-recommend, inline edit, activity log and notes); clients; partners; ambassadors (referred cases, commission due, payouts, referral link); channels (cadence, "Due to post" view, Log post); content (grouped by week, status steps, Mark posted); payments; retainers (start, cancel, MRR); metrics (90-day gate cards with pass/fail, leads by source, cases by category, revenue by product by month, channel coverage, date range and presets); settings (config status, Stripe link status, team add/deactivate, "Acting as" for note authorship).
- `src/lib/actions/{leads,cases,clients,partners,ambassadors,channels,content,payments,retainers,team}.ts` server actions (all call `requireAdmin()`, revalidate `/admin`), `src/lib/queries/*` (including `metrics.ts` and `dashboard.ts`), zod schemas in `src/lib/validation/*` with `fields.ts` (null-on-empty helpers for edit forms), and `src/components/admin/*` (ActionForm, field components, FormDialog, FilterBar, status badges, skeletons, empty states).
### Changed
- Family Office tier now lists "Everything in Plus" in its inclusions.
- `src/middleware.ts` is `src/proxy.ts` (Next 16 rename); ARCHITECTURE.md updated.
- Root page moved to `src/app/(marketing)/page.tsx`; placeholder layouts for `(marketing)` and `(admin)/admin`, working `/admin/login`.
### Removed
- Scaffold boilerplate (Geist demo page, Next/Vercel SVGs in `public/`).

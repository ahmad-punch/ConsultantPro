# Architecture and working contract

This is the contract for humans and agents. If code and this file disagree, fix one and say which.

## Product in one paragraph
Rasta sells fixed-price help to overseas Pakistanis with problems back home: a written **Pathway Memo** (what the problem is, who owns it, remedies, timelines, costs, traps), optional **managed execution** with an independent partner advocate, **errands** (NADRA, attestation, FBR, SECP, record copies), and a monthly **Family Affairs retainer**. The company is not a law firm and not a fixer. Full plan: `docs/BUSINESS-PLAN.md`.

## Stack
Next.js (App Router, `src/`), TypeScript strict, Tailwind v4, shadcn/ui, lucide-react, Drizzle ORM (pg dialect), Neon Postgres in prod / PGlite locally, zod, server actions, next-mdx-remote for guides, next/font (Google Fonts), Vercel Analytics. See decision 0003.

Rendering: `cacheComponents` and `partialPrefetching` are on (Next 16). Anything that reads request data (cookies, `searchParams`, the session, database queries) must render inside a `<Suspense>` boundary, or be cached with `'use cache'`. Fonts: `font-sans` (Inter), `font-display` (Fraunces), `font-mono`, `font-urdu`; colours come from tokens in `src/app/globals.css` (`primary`, `highlight`, `muted`, `success`, `warning`, `info`).

## Folders
```
src/app/(marketing)/           public site: /, /pricing, /how-it-works, /guides, /guides/[slug], /about, /start (intake), /faq, /legal/*
src/app/(admin)/admin/         control panel, behind auth: dashboard, leads, cases, cases/[id], clients, partners, ambassadors, channels, content, payments, metrics, settings
src/app/admin/login            login page (outside the auth group)
src/app/api/                   only what server actions cannot do (health, webhooks later)
src/components/ui/             shadcn primitives (generated, do not hand-edit style)
src/components/marketing/      public site components
src/components/admin/          panel components (tables, forms, stage badges)
src/lib/site.ts                brand: name, tagline, WhatsApp number, socials, entity text
src/lib/pricing.ts             the only price list (products, retainer tiers, Stripe link env names)
src/lib/db/schema.ts           Drizzle schema (single source of data model)
src/lib/db/enums.ts            enum values + labels (no deps; safe in client components)
src/lib/db/index.ts            db client (Neon if DATABASE_URL, else PGlite)
src/lib/db/seed.ts             demo data
drizzle/                       generated SQL migrations (PGlite applies them on first query)
src/lib/auth.ts                admin session helpers (server-only)
src/lib/auth-token.ts          HMAC token sign/verify (shared by proxy and auth.ts)
src/lib/auth-actions.ts        loginAction / logoutAction server actions
src/lib/ids.ts                 nextCaseNumber() (RS-0001 style)
src/lib/actions/*.ts           server actions per entity (leads, cases, partners, ...)
src/lib/queries/*.ts           read queries per entity, plus metrics
src/lib/validation/*.ts        zod schemas shared by forms and actions
src/proxy.ts                   protects /admin/* (Next 16 renamed middleware to proxy)
content/guides/*.mdx           pathway guides (frontmatter: title, slug, category, summary, summaryUrdu, updated, readingMinutes)
marketing/                     launch posts, scripts, calendar, strategy, channel list (not shipped in the app)
docs/                          this contract, status, changelog, learnings, decisions, research, business plan
```

## Data model (Drizzle, Postgres)
Enums (values in `src/lib/db/enums.ts`): `case_category` (property, inheritance, police_fir, tax_fbr, nadra, attestation, company_secp, court, errand, other); `case_stage` (intake, triage, memo_drafting, memo_delivered, managed, errand_in_progress, closed, declined); `product` (question, call, assessment, managed, errand, retainer); `payment_status` (unpaid, paid, refunded); `lead_status` (new, contacted, converted, lost); `partner_type` (advocate, errand_runner, adviser, accountant); `channel_platform` (whatsapp, facebook, association, community_centre, linkedin, youtube, other); `channel_status` (identified, contacted, joined, posted, paused); `content_status` (idea, drafted, approved, posted); `retainer_tier` (watch, plus, family_office). The inline unions below are Postgres enums too: `team_role`, `lead_urgency`, `content_format`, `content_language`, `payment_method`, `retainer_status`.

Money columns (`priceUsd`, `amountUsd`, `monthlyUsd`, `totalPaidUsd`) are integers in whole US dollars. Timestamps are `timestamptz`. Columns are camelCase in TypeScript and snake_case in Postgres.

Tables (all with `id` uuid default, `createdAt`, `updatedAt`):
- `team_members`: name, role (founder | case_manager | ops), email, active.
- `clients`: name, whatsapp, email, country, city, ambassadorId?, notes.
- `leads`: name, whatsapp, email?, country, category, urgency (low|normal|urgent), description, referralCode?, source, status, convertedCaseId?.
- `cases`: caseNumber (RS-0001 style, unique), clientId, category, product, stage, priceUsd, paymentStatus, paymentLink?, caseManagerId?, partnerId?, driveFolderUrl?, memoDocUrl?, memoDeliveredAt?, summary, nextAction?, nextActionDue?, nps?, wouldRecommend?, ambassadorId?, referredByCaseId?, closedAt?.
- `case_notes`: caseId, authorName, body (activity log; every stage change writes a note).
- `partners`: name, type, city, whatsapp, email, ownLetterhead bool, feeTerms, slaDays, rating?, active.
- `ambassadors`: name, country, city, whatsapp, referralCode (unique), commissionPct, totalPaidUsd, active, notes.
- `channels`: name, platform, country, memberCount?, adminContact?, status, lastPostedAt?, cadenceDays?, ambassadorId?, notes.
- `content_items`: title, format (post | script | guide | video | email), language (en | ur | both), targetPlatform, status, scheduledFor?, postedAt?, url?, body?, notes.
- `payments`: caseId?, retainerId?, amountUsd, method (stripe | wise | payoneer | bank | other), status, reference?, paidAt?.
- `retainers`: clientId, tier, monthlyUsd, status (active | cancelled), startedAt, cancelledAt?.

## Metrics (the 90-day gate, computed in `src/lib/queries/metrics.ts`)
paid cases; blended revenue per paid interaction; share of cases referred by earlier customers or ambassadors; retainer sign-ups; median days from case creation to memoDeliveredAt; share of closed cases with wouldRecommend = true; plus leads by source, pipeline by stage, revenue by product, channel coverage.

## Ownership (parallel work)
| Area | Owner agent | May edit |
|---|---|---|
| Foundation | foundation | package.json, config files, `src/lib/**`, `src/components/ui/**`, `src/app/layout.tsx`, `src/app/globals.css`, `src/proxy.ts`, `drizzle/` |
| Public site | marketing-site | `src/app/(marketing)/**`, `src/components/marketing/**`, `public/**` |
| Control panel | admin-panel | `src/app/(admin)/**`, `src/app/admin/**`, `src/components/admin/**`, `src/lib/actions/**`, `src/lib/queries/**`, `src/lib/validation/**` |
| Content | content | `content/**`, `marketing/**` |
| Docs | anyone, append-only | `docs/CHANGELOG.md`, `docs/STATUS.md`, `docs/LEARNINGS.md` |

Shared files (`schema.ts`, `pricing.ts`, `site.ts`) change only through the foundation owner; others request changes in their report.

## Quality bar
- `pnpm lint`, `pnpm typecheck`, `pnpm build` pass.
- Every page renders at 375px wide with no horizontal scroll.
- Lighthouse accessibility 95+ on the public site (semantic HTML, labels, contrast).
- No lorem ipsum, no fake names, no fake numbers. Placeholders are `TODO:`-prefixed and visibly marked.
- Copy is plain English; Urdu where the contract says so.

## Documentation and help system (source of truth)
Markdown in the repo is the single source of truth. The admin panel renders it; agents read it. Never duplicate explanations in component code.

- `docs/CHANGELOG.md`, `docs/STATUS.md`, `docs/LEARNINGS.md`, `docs/decisions/*.md` render at `/admin/project` (tabs: Status, Open decisions, Decisions, Changelog, Learnings). Loader: `src/lib/project-docs.ts`.
- `docs/help/` is the help centre, rendered at `/admin/help` and `/admin/help/[...slug]`. Loader: `src/lib/help.ts`. Frontmatter: `title`, `slug` (path-like, e.g. `screens/cases`), `summary`, `audience` (everyone | staff | agents), `order`.
- Layout of `docs/help/`: `README.md` (how to maintain), `what-rasta-is.md`, `how-the-business-works.md`, `glossary.md`, `workflows.md`, `public-site.md`, `for-agents.md`, and `screens/<screen>.md` for every admin screen (dashboard, leads, cases, clients, partners, ambassadors, channels, content, payments, retainers, metrics, settings, project, help).
- Every `screens/*.md` uses these H2 headings in this order: `Why this screen exists`, `What you see`, `Buttons and actions` (one H3 per button or action, using the exact label shown in the UI), `How it connects to other screens`, `Common mistakes`.
- Contextual help: `<HelpButton topic="cases" section="advance-stage" />` (`src/components/admin/help-button.tsx`) opens a side sheet with `docs/help/screens/cases.md`, scrolled to the heading whose slug is `advance-stage`, with a link to the full page. `topic` is the screen file name; `section` is the kebab-case slug of an H3 under "Buttons and actions" or of any H2.
- Next.js on Vercel only ships files it can trace: `next.config.ts` has `outputFileTracingIncludes` for `docs/**` and `content/**` so request-time reads work in production.

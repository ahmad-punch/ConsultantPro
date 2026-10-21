# Architecture and working contract

This is the contract for humans and agents. If code and this file disagree, fix one and say which.

## Product in one paragraph
Rasta sells fixed-price help to overseas Pakistanis with problems back home: a written **Pathway Memo** (what the problem is, who owns it, remedies, timelines, costs, traps), optional **managed execution** with an independent partner advocate, **errands** (NADRA, attestation, FBR, SECP, record copies), and a monthly **Family Affairs retainer**. The company is not a law firm and not a fixer. Full plan: `docs/BUSINESS-PLAN.md`.

## Stack
Next.js (App Router, `src/`), TypeScript strict, Tailwind v4, shadcn/ui, lucide-react, Drizzle ORM (pg dialect), Neon Postgres in prod / PGlite locally, zod, server actions, next-mdx-remote for guides, next/font (Google Fonts), Vercel Analytics. See decision 0003.

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
src/lib/db/index.ts            db client (Neon if DATABASE_URL, else PGlite)
src/lib/db/seed.ts             demo data
src/lib/auth.ts                admin session helpers
src/lib/actions/*.ts           server actions per entity (leads, cases, partners, ...)
src/lib/queries/*.ts           read queries per entity, plus metrics
src/lib/validation/*.ts        zod schemas shared by forms and actions
src/middleware.ts              protects /admin/*
content/guides/*.mdx           pathway guides (frontmatter: title, slug, category, summary, summaryUrdu, updated, readingMinutes)
marketing/                     launch posts, scripts, calendar, strategy, channel list (not shipped in the app)
docs/                          this contract, status, changelog, learnings, decisions, research, business plan
```

## Data model (Drizzle, Postgres)
Enums: `case_category` (property, inheritance, police_fir, tax_fbr, nadra, attestation, company_secp, court, errand, other); `case_stage` (intake, triage, memo_drafting, memo_delivered, managed, errand_in_progress, closed, declined); `product` (question, call, assessment, managed, errand, retainer); `payment_status` (unpaid, paid, refunded); `lead_status` (new, contacted, converted, lost); `partner_type` (advocate, errand_runner, adviser, accountant); `channel_platform` (whatsapp, facebook, association, community_centre, linkedin, youtube, other); `channel_status` (identified, contacted, joined, posted, paused); `content_status` (idea, drafted, approved, posted); `retainer_tier` (watch, plus, family_office).

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
| Foundation | foundation | package.json, config files, `src/lib/**`, `src/components/ui/**`, `src/app/layout.tsx`, `src/app/globals.css`, `src/middleware.ts` |
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

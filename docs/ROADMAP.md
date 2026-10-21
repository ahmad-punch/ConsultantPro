# Roadmap

What is built, what is left before the first sale, and what to build after the 90-day gate. `docs/STATUS.md` tracks the live state; this file is the plan.

## Built (October 2026)
- Public site with intake form, pricing, 10 guides, legal drafts, SEO.
- Control panel: leads, cases (list and board), clients, partners, ambassadors, channels, content calendar, payments, retainers, metrics gate, settings, project page (status, decisions, changelog, learnings), help centre with contextual help on every screen.
- Data layer that runs locally with no setup and on Neon in production. Documents stay in the client's own Google Drive.
- Marketing pack: strategy, posts in English and Urdu, scripts, ambassador terms, FAQ replies, objection handling, price sheet, video scripts, email sequence, channel tracker.
- Repo docs for people and agents: CLAUDE.md, architecture, decisions, learnings, runbook, deploy guide, help centre.

## Phase 0: launch-ready (before the first paid case)
Business
- Decide the brand name and buy the domain. Replace the working name in `src/lib/site.ts`.
- Set up the UK Ltd or US LLC and a Stripe account; create one Payment Link per product and set the env vars.
- Sign 2 partner advocates (own letterhead, fixed fees, SLA) and 2 errand runners; add them in Partners.
- Lawyer review of the ten guides and the three legal pages; native Urdu review of all Urdu copy.
- Write the five Pathway Memo templates as Google Docs; link them from the Help centre.
- Fill every `TODO:` placeholder on the site (advisers, entity, contact details, refunds).
Product
- Deploy to Vercel, connect Neon, set env vars (`docs/DEPLOY.md`).
- Transactional email on intake and memo delivery (Resend free tier). Today the only confirmation is the on-screen message and WhatsApp link.
- Stripe webhook that marks a case paid automatically, instead of manual "Record payment".
- Per-person logins (Auth.js with email magic links) once more than the two founders use the panel.

## Phase 1: during the 90-day test
- Client-facing case status page: a private link per case showing stage, next step and the memo link, so clients stop asking "any update?" on WhatsApp.
- WhatsApp templates sent from the panel (copy-to-clipboard first, WhatsApp Business API later).
- Weekly metrics snapshot saved to the database so the gate history is kept, not just the live number.
- CSV import for channels and leads; archive or delete for records entered by mistake.
- Intake quality: category-specific follow-up questions on `/start` (for example, for property: district, type of land record, who is occupying).

## Phase 2: after a "go" decision
- Retainer self-service: Stripe Checkout subscriptions, retainer portal with quarterly land-record check results.
- Partner portal: advocates see their assigned cases, upload their invoice link, update status.
- Document checklists per category, generated into the client's Drive folder.
- Knowledge base growth: 30+ guides, Urdu versions of every guide, YouTube explainers.
- Reporting: cohort retention, revenue by channel and ambassador, case-manager capacity.
- Search across cases, clients and notes.

## Phase 3: platform (only if the venture lens is chosen)
- Land-record monitoring with alerts (Punjab Land Records Authority data where legally accessible).
- Escrow-style milestone payments for managed cases.
- Mobile app wrapper and push notifications.
- Second-diaspora playbook (Bangladesh or India) using the same stack.

## Not planned
- Any feature that routes police or court outcomes through personal connections. See decision 0001.
- File uploads or storing client documents on our servers.
- Commission on advocate fees. See the Bar Council notes in `docs/research/03-regulatory-constraints.md`.

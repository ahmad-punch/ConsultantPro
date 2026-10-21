# 0004. Partner network: onboarding, tiers, engagements and anti-poaching

Status: accepted, 2026-10-21. Companion to 0005 (pooling and marketplace scope).

## Context
Rasta's service is delivered by independent providers on the ground. Bar Council rules (research 03, section 3) mean advocates bill clients directly on their own letterhead, cannot split fees with a non-advocate and cannot be touted. Our fee must therefore be for intake, coordination and tracking only. The commercial risk of a referral network is poaching: a provider meets the client once and takes the relationship.

## Decision
**Registry.** One `partners` table holds every "solution provider": advocate, errand runner, accountant / tax adviser, adviser. Each is tagged with departments (NADRA, FBR, Land Revenue, SECP, Courts, HEC/IBCC, Passport, Police records, Banks; `DEPARTMENTS` in `src/lib/validation/applications.ts`) and service areas (cities or districts), comma separated.

**Onboarding pipeline.** Public application (`/partners/apply`, `/partners/ambassadors`) -> `partner_applications` status new -> reviewing -> interview -> approved (creates the partners row, or an ambassadors row with a generated referral code) or rejected (reason kept in notes). The partners row then moves through `onboardingStage`: applied -> agreement_sent -> agreement_signed (records agreementVersion, agreementSignedAt, noPoachingAcceptedAt) -> trial_case -> active. `suspended` is for breaches and hides the provider from dispatch and from "Engage provider". Trial and active require a signed agreement with no-poaching accepted.

**Tiers.** probation, bronze, silver, gold. `computeTier(partner, stats)` in `src/lib/queries/network.ts` suggests a tier; staff apply it with a button (never automatic).

| Tier | Completed engagements | On-time delivery | Average rating | Disputes |
|---|---|---|---|---|
| Probation | fewer than 3 | - | - | - |
| Bronze | 3+ | 70%+ | 3.5+ | any |
| Silver | 10+ | 85%+ | 4.2+ | at most 1 |
| Gold | 25+ | 92%+ | 4.6+ | none |

On time = delivered (or completed) on or before `dueAt`, or no due date. Tier sets dispatch priority (gold first, then rating, then completed count) and order in "Engage provider".

**Engagements.** `partner_engagements` links a provider to a case: role, agreed fee, `feeBilledBy` ("partner" = provider bills the client directly, required for advocates; "company" = Rasta pays a fixed fee for non-legal work), office, city, SLA, due date, batchKey. Status: proposed -> accepted -> in_progress -> delivered -> completed, with cancelled and disputed. Every status change writes a case note. Rating (1-5) on completion updates `casesCompleted` and `avgRating`.

**Anti-poaching.**
- The client's contact details are not shared until the engagement is accepted. "Copy brief" includes them only from accepted onward.
- Every engagement carries the policy text (`NO_POACHING_POLICY`) in its notes; accepting stamps `noPoachingAcknowledgedAt`.
- All client communication is logged as case notes.
- Repeat-client detection: the provider page lists clients introduced, engagement count and the end of the 12-month protection window. A client returning directly to the provider is reported, not enforced in software.
- Breach -> Suspend (reason recorded).
- The agreement (`marketing/partner-agreement-template.md`, draft for counsel) covers 12-month non-solicitation, no direct fees outside the engagement except advocate fees on own letterhead as disclosed, confidentiality, data handling (documents stay in the client's Drive, no copies), SLA, rating and termination.

## Consequences
- partner_applications has no departments/serviceAreas columns; the public form stores them as tagged lines ("Departments: ...", "Service areas: ...") in `notes`, and approval copies them to the partner. Add real columns in a later schema change.
- Providers have no login. Staff relay briefs and record acceptance. Provider self-service is phase 2 (decision 0005).
- Ambassador referral share is an assumption (10-15% of first purchase) until confirmed.

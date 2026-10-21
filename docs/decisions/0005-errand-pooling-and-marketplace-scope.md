# 0005. Errand pooling is in scope; an open real-time marketplace is not (yet)

Status: proposed, 2026-10-21.

## Context
The founders want a network of solution providers of all kinds (advocates, errand runners, accountants, advisers) organised by government department and location, and asked whether work can be pooled like a ride-share: when one runner is going into NADRA Lahore, several clients' errands ride along. They also asked how feasible an "Uber for consultancy" is.

## Assessment
**Pooling errands by city and department: feasible now, and it is where the margin is.**
- An errand is a visit plus paperwork. One runner at one office can process several matters in one visit if the paperwork was checked in advance. Our cost per errand falls while the client price stays fixed, so pooling raises gross margin without raising prices.
- The binding constraint is not software. It is document readiness: each errand needs the right authority (NICOP copy, authority letter or power of attorney, fee challan, originals where required). A batch is only as good as its weakest file. So the dispatch board must block a batch until every item passes a checklist.
- Needed: providers tagged by department and service area, cases tagged by department and city, a dispatch board that groups open items, a batch action, and a "going in today" signal. All of this is in the schema and the Network section.

**An open, real-time marketplace where providers self-dispatch: not now.**
1. Legal: advocates cannot be marketed, fee-split or touted through a platform (Bar Council rules, see research 03). Advocate work stays a curated referral with the advocate billing directly. Only non-legal errands could ever be "marketplace" work.
2. Trust: every open legal marketplace in the research failed on supply quality (Avvo, UpCounsel, Atrium). Our customers are paying precisely to avoid a stranger.
3. Liquidity: real-time matching only matters when a city has dozens of providers and hundreds of errands a month. Before that, a staff member batching once a day is faster and cheaper.
4. Control: anti-poaching and quality rules are enforceable with 20 vetted providers and unenforceable with 500 self-serve ones.

## Decision
- Build a closed, curated network: application, vetting, agreement, trial, tiers, staff-run dispatch with batching. This is what `/admin/network` implements.
- Phase 2 (after the 90-day gate): provider self-service on a private link (accept or decline an engagement, mark "going in today", upload the visit report), still staff-approved.
- Revisit an open marketplace only for non-legal errands, only when one city exceeds roughly 50 active providers and 200 errands a month, and only with legal advice.

## Consequences
- Provider registry is generic: any department, any city; add provider types to the enum when needed.
- Dispatch quality depends on an intake checklist per errand type; add it to the errand guides and the case template.
- Metrics to add: errands per batch, cost per errand, on-time rate per provider.

# 0002. Working brand name "Rasta"

Status: proposed, 2026-10-21.

## Context
We need a name for the site and the panel now. Domain availability is unchecked.

## Decision
Use "Rasta" (راستہ, "the way / path") as the working name. All brand strings come from `src/lib/site.ts` so renaming is a one-file change. Tagline: "Your family's affairs in Pakistan, handled properly."

## Consequences
- Do not hardcode the name in components or content; import from `site.ts`.
- Check domain and trademark before launch; replace in `site.ts` if needed.

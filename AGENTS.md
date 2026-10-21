# CLAUDE.md

Rasta is a navigation and case-management service for overseas Pakistanis. This repo holds the public website, the internal control panel, the content, and the marketing assets. Read this file, then `docs/ARCHITECTURE.md`, before changing anything.

## Start here (every session)
1. `docs/STATUS.md` says what is done, what is next, and which decisions are open.
2. `docs/ARCHITECTURE.md` is the contract: stack, folders, data model, who owns which files.
3. `docs/decisions/` holds the decision records. Do not reverse one silently; add a new record.
4. `docs/LEARNINGS.md` holds things that bit us. Read it before touching the area it names.

## Non-negotiable rules
- **No officer involvement.** Nothing in code, copy, content or commits may mention serving police or civil servants, rank, or "connections". The business sells process and information, not access. See `docs/decisions/0001-officer-exclusion.md`.
- **No fabricated credibility.** No fake testimonials, fake adviser names, fake team photos, invented statistics or "trusted by 10,000" claims. Use real cited numbers from `docs/research/` or clearly marked placeholders (`TODO:`).
- **Not a law firm.** Legal advice is delivered and billed by independent advocates. The site and the memo templates say "general information, not legal advice". Keep every disclaimer that exists.
- **Prices live in one place:** `src/lib/pricing.ts`. Never hardcode a price elsewhere.
- **Brand values live in one place:** `src/lib/site.ts`.
- **No AI attribution** in commit messages, PR descriptions, or code comments. Plain conventional commits (`feat:`, `fix:`, `docs:`, `chore:`, `content:`).

## Commands
```bash
pnpm install        # deps
pnpm dev            # http://localhost:3000 (uses local PGlite when DATABASE_URL is unset)
pnpm db:push        # push Drizzle schema to the database in DATABASE_URL
pnpm db:seed        # demo data for the control panel
pnpm lint && pnpm typecheck && pnpm build   # must pass before any commit
```

## When you finish a piece of work
- Append to `docs/CHANGELOG.md` (Unreleased section).
- Update `docs/STATUS.md` (move items between Done / Next / Open decisions).
- If you learned something non-obvious, add it to `docs/LEARNINGS.md`.
- If you made a choice others must respect, add `docs/decisions/NNNN-title.md`.

## Working in parallel
Agents own disjoint folders (see the ownership table in `docs/ARCHITECTURE.md`). Do not edit outside your area without saying so in your report. Shared files (`schema.ts`, `pricing.ts`, `site.ts`) change only through the foundation owner.

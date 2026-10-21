---
title: "For agents"
slug: "for-agents"
summary: "How an AI agent should work in this repo: read order, where things live, the quality bar, and the documentation duties."
audience: "agents"
order: 90
---

# For agents

This page is for AI agents and developers who change the repository. Staff can skip it.

## Read in this order

1. `CLAUDE.md`. The rules that cannot be broken and the commands to run.
2. `docs/ARCHITECTURE.md`. The contract: stack, folders, data model, metrics, ownership of folders and the quality bar.
3. `docs/STATUS.md`. What is done, what is next, and which decisions are open.
4. `docs/decisions/`. The decision records. Do not reverse one silently. Add a new record that supersedes it.
5. `docs/LEARNINGS.md`. Things that cost time. Read the entry for any area you are about to touch.
6. `docs/BUSINESS-PLAN.md`, sections 0, 2, 7 and 10 at least. It explains why the product is shaped this way.
7. `docs/RUNBOOK.md`. How the team uses the panel day to day.
8. This folder, `docs/help/`, for the screen you are about to change.

## Where things live

| What | Where |
|---|---|
| Public site | `src/app/(marketing)/`, components in `src/components/marketing/` |
| Control panel pages | `src/app/(admin)/admin/` |
| Panel components and forms | `src/components/admin/`, `src/components/admin/forms/` |
| Server actions (what each button changes) | `src/lib/actions/*.ts` |
| Reads and the gate numbers | `src/lib/queries/*.ts`, especially `metrics.ts` and `dashboard.ts` |
| Form validation | `src/lib/validation/*.ts` |
| Data model | `src/lib/db/schema.ts`, labels in `src/lib/db/enums.ts` |
| Prices | `src/lib/pricing.ts` only |
| Brand values | `src/lib/site.ts` only |
| Guides | `content/guides/*.mdx` |
| Marketing assets | `marketing/` |
| Help centre | `docs/help/` (loader `src/lib/help.ts`) |
| Project notebook | `docs/CHANGELOG.md`, `STATUS.md`, `LEARNINGS.md`, `decisions/` (loader `src/lib/project-docs.ts`) |

Agents own disjoint folders. See the ownership table in `docs/ARCHITECTURE.md`. Do not edit outside your area without saying so in your report. `schema.ts`, `pricing.ts` and `site.ts` change only through the foundation owner.

## Rules that never bend

- **No selling of access.** Nothing in code, copy, content or commits may suggest that the business sells influence. It sells process and information. See `docs/decisions/0001-officer-exclusion.md`.
- **No fabricated credibility.** No fake testimonials, names, photos or numbers. Use real cited numbers or a visible `TODO:` placeholder.
- **Not a law firm.** Keep every disclaimer. Legal advice comes from independent advocates who bill the client directly.
- **One source for prices and brand.** Never hardcode either.
- **No AI attribution** in commits, pull request text or code comments. Use plain conventional commits (`feat:`, `fix:`, `docs:`, `chore:`, `content:`).
- **Client documents never enter the system.** The panel stores links to the client's own Google Drive.

## The quality bar

- `pnpm lint`, `pnpm typecheck` and `pnpm build` must pass before any commit.
- Every page renders at 375 pixels wide with no horizontal scroll.
- Public site accessibility score of 95 or more.
- No lorem ipsum, no invented content. Placeholders are `TODO:` and visible.
- Plain English copy. Short sentences.
- Every server action calls `requireAdmin()` first. Reads that touch request data sit inside `<Suspense>` (Next 16 Cache Components).
- Write nothing sequentially that needs a transaction on Neon HTTP. See LEARNINGS for the retry pattern on case numbers.

## Documentation duties

When you finish a piece of work:

1. Append to `docs/CHANGELOG.md` under Unreleased.
2. Update `docs/STATUS.md`: move items between Done, Next and Open decisions.
3. If you learned something non-obvious, add to `docs/LEARNINGS.md`.
4. If you made a choice others must respect, add `docs/decisions/NNNN-title.md`.
5. **Update `docs/help/` whenever a screen or button changes.** This is part of the change, not a follow-up. That means:
   - a new, renamed or removed button, field or screen: edit the matching `docs/help/screens/*.md`, keeping the exact label as the H3 heading;
   - a changed rule (for example how a gate number is worked out): update the explanation, and the glossary if a word changed;
   - a new screen: add `docs/help/screens/<name>.md` with the five fixed H2 headings, add it to the table in `docs/help/README.md`, and add `HelpButton`s;
   - a renamed heading: search the code for its old slug in `HelpButton section=` before you rename it.
6. If a screen workflow changes, update `docs/help/workflows.md`.

Read `docs/help/README.md` for the heading contract and frontmatter.

## Working habits that help

- Read the action before you describe a button. The help pages describe what the code does, not what the label suggests. If you cannot tell, write `TODO: confirm` rather than guess.
- Do not copy explanations into component text. Link to the help page instead.
- Do not reverse a decision record. Supersede it.
- Do not commit unless asked. Do not add documentation files that nobody asked for.
- Say plainly in your report which files you touched and what you could not verify.

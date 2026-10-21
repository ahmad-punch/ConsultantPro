---
title: "How the help folder works"
slug: "readme"
summary: "For agents and maintainers: the file format, the heading contract, and how to add or update a help page."
audience: "agents"
order: 95
---

# How the help folder works

This folder, `docs/help/`, is the help centre for the control panel. It is the single source of truth. The panel draws these files. People and agents read them. Nothing about how a screen works should be explained anywhere else, in code comments or in component text. If you find a second copy of an explanation, delete it and point to this folder.

The loader is `src/lib/help.ts`. The pages are `/admin/help` (index) and `/admin/help/[...slug]` (one document). The side sheet is `src/components/admin/help-button.tsx`. The overall design is in `docs/ARCHITECTURE.md`, section "Documentation and help system".

## What is in the folder

| File | Slug | Audience | What it is |
|---|---|---|---|
| `what-rasta-is.md` | `what-rasta-is` | everyone | The service in plain words |
| `how-the-business-works.md` | `how-the-business-works` | everyone | Lifecycle, roles, money, the 90-day test |
| `workflows.md` | `workflows` | everyone | Step-by-step jobs with exact button names |
| `public-site.md` | `public-site` | everyone | Every public page and where form data goes |
| `glossary.md` | `glossary` | everyone | Pakistani legal and government terms, and our own words |
| `for-agents.md` | `for-agents` | agents | How an AI agent should work in the repo |
| `README.md` | `readme` | agents | This file |
| `screens/<screen>.md` | `screens/<screen>` | everyone | One page per admin screen |

The screens covered are: dashboard, leads, cases, clients, partners, ambassadors, channels, content, payments, retainers, metrics, settings, project and help.

## Frontmatter

Every file starts with this block:

```yaml
---
title: "Cases"
slug: "screens/cases"
summary: "One sentence shown in the help index and in search."
audience: "everyone"
order: 130
---
```

- `title`: shown as the page title and in the index.
- `slug`: path-like and unique. It decides the address (`/admin/help/screens/cases`). A screen's slug is always `screens/` plus the file name without `.md`.
- `summary`: one sentence, plain English.
- `audience`: `everyone`, `staff` or `agents`. It shows as a badge. A page with audience `agents` is listed in the "For agents" group of the index.
- `order`: a number. Lower comes first inside a group. The index shows three groups in this order: "Start here", "Screens" (any slug starting `screens/`) and "For agents". Current numbers: introductions 10 to 50, agents pages 90 to 95, screens 110 to 240 in sidebar order.

## The heading contract

Every file in `screens/` uses exactly these H2 headings, in this order, spelled exactly like this:

1. `Why this screen exists`
2. `What you see`
3. `Buttons and actions`
4. `How it connects to other screens`
5. `Common mistakes`

Under `Buttons and actions`, write one H3 for every button or action. Use the exact label shown in the interface, for example `Convert to case`, `Record payment`, `Close out`. If the label on screen changes, change the heading in the same commit.

The Metrics page has one more rule. It has six H3 headings under `What you see`, named exactly: `Paid cases`, `Revenue per paid interaction`, `Referrals`, `Retainer sign-ups`, `Median days to memo`, `Would recommend`. They explain the six gate numbers. On screen the Referrals and memo cards have slightly longer titles ("Paid cases from referrals", "Median working days to memo"). The help headings stay short so that section names are stable.

Use H1 once, at the top, for the page title. The loader removes that first H1 from the body because the page title comes from the frontmatter. Do not put anything between the frontmatter and the H1 except a blank line.

## How HelpButton finds a heading

A help button is written like this:

```tsx
<HelpButton topic="cases" section="advance-stage" />
```

- `topic` is the file name in `screens/` without `.md`. `cases` opens `screens/cases.md`.
- `section` is a heading's slug. The slug is the heading text in lower case, with spaces and punctuation replaced by single hyphens. `Advance stage` becomes `advance-stage`. `Why this screen exists` becomes `why-this-screen-exists`.
- The loader looks for an H3 under `Buttons and actions` first, then any H2, then any other H3 (this is how a metric under `What you see` is found). `section` can also be a list of slugs, and the first one found wins.
- If the heading is missing, the sheet says the help is not written yet and shows the "Why this screen exists" text instead.
- The sheet opens the document scrolled to that heading and shows a link to the full page.

So if you rename a heading, every `section=` that points at it breaks. Search the code for the old slug before you rename.

## Style rules

- Write for a person with no software or legal background. Short sentences. Plain words. Explain any term the first time you use it, or link to the glossary.
- No em-dashes. No hype.
- Explain why a screen exists, how it relates to the others, and what each button changes in the data. Name the tables or fields only when it helps a reader.
- Prices come from `src/lib/pricing.ts`. If you quote one, check it there.
- Follow `docs/decisions/0001-officer-exclusion.md`. The business sells process and information, never access, and no page may suggest otherwise.
- Never promise an outcome. The business is not a law firm.
- Where you are not sure what the code does, read the code again. If you are still not sure, write `TODO: confirm` in the text so a person can check.

## How to add a help page

1. Create the file with the frontmatter above. For a new screen, put it in `screens/` and use the five fixed H2 headings.
2. Pick an `order` that fits the sidebar.
3. Add the page to the table in this README.
4. Add `HelpButton`s on the screen if useful.
5. Add a line to `docs/CHANGELOG.md`.

## How to update a help page

Whenever a screen, button, label, form field or rule changes, update the matching help page in the same change. Check these four things:

1. Is every H3 under `Buttons and actions` still an exact label?
2. Does the page still say what the button changes in the data?
3. Do the "How it connects" and "Common mistakes" sections still hold?
4. Do any `HelpButton` `section` values still match a heading?

A change to a screen is not finished until its help page is. See `for-agents.md`.

## Rules of the folder

- This folder is the source of truth for how the panel works.
- Only edit files here for help content. Do not put help text in components.
- Keep one idea per page. Link between pages by slug.
- Do not store client data, names of real people, or anything private in a help page.

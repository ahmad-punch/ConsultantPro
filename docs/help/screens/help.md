---
title: "Help"
slug: "screens/help"
summary: "The help centre inside the panel: search, full pages and the small help buttons."
audience: "everyone"
order: 240
---

# Help

## Why this screen exists

A new case manager should not need to ask a colleague what a button does. The help centre is the manual, kept inside the panel next to the screens it describes. It is written for someone with no software or legal background, in plain English.

The help is plain text files in the repository, in the `docs/help` folder. The panel only draws them. There is one source of truth. If a help page and a screen ever disagree, fix the help file in the same change.

## What you see

**The help index** at `/admin/help`. A search box with a Search button, then the pages in three groups: "Start here" (what Rasta is, how the business works, workflows, the public site, the glossary), "Screens" (one page for each admin screen) and "For agents" (pages for AI assistants and developers, which staff can ignore). Each card shows the title, a one-line summary, an audience badge and the file path.

**Search results.** Searching reads page titles, summaries and the full text. Every word you type must appear in the page. Title matches rank first. Each result shows a snippet with your words highlighted. A "Clear search" link returns to the index.

**A help page** at `/admin/help/...`. It shows one document with an "On this page" list of its headings, "Previous" and "Next" links, and a line that says which file to edit. Screen pages always have the same five parts: why the screen exists, what you see, buttons and actions, how it connects to other screens, and common mistakes.

**Help buttons.** Many screens have a small round "?" button, usually next to the page title or a heading. Its accessible name is "Help:" and the topic. Pressing it opens a side panel with the matching part of the matching help page.

## Buttons and actions

### Search

Type words into "Search help" and press Search. The list narrows to pages that contain all of your words. Try one word first, such as memo, refund or referral.

### Clear search

Appears above the results. It takes you back to the full list.

### Help button

The small round "?" next to a heading or control. It opens a side panel showing the help for that spot. The panel also shows the section called "How it connects to other screens" for the same page. If the help has not been written for that spot, the panel says so.

### Open full help page

A link at the bottom of the side panel. It opens the whole page, scrolled to the same heading.

### Previous and Next

At the bottom of a help page. They move to the page before or after this one in the list.

## How it connects to other screens

- **Every admin screen** can carry help buttons that open its page here.
- **Project.** Project is the history of decisions and changes. Help is how to use the panel today.
- **Glossary.** Words such as FIR, fard or NICOP are explained in the glossary page.
- **Workflows.** The workflows page walks through whole jobs from start to finish with the exact button names.

## Common mistakes

- **Searching for a button name and finding too much.** Add the screen name as well, for example "cases close out".
- **Trusting an old help page after a screen changed.** Tell whoever looks after the repository. The rule is that a change to a screen or button also changes its help page.
- **Pasting client details into a help page.** Never. Help pages are general and are stored in the repository.
- **Reading only the side panel.** It shows one section. Open the full page for the context around it.
- **Looking for an edit button.** The pages are read-only here. They are edited as files, and the page shows which file.

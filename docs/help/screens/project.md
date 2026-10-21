---
title: "Project"
slug: "screens/project"
summary: "The project notebook: status, open decisions, decisions, changelog and learnings, read from files in the repo."
audience: "everyone"
order: 230
---

# Project

## Why this screen exists

A business like this runs on decisions: which legal entity, which payment provider, what we will never do. If those decisions live only in chat messages, they get lost and people repeat old arguments.

The Project screen shows the project's own notebook inside the panel. It is read-only. Nothing is stored in the database. Every tab is drawn from plain text files in the repository's `docs` folder, so whoever edits a file edits what you read here. Nothing on this screen changes business data.

## What you see

The screen is at `/admin/project` and has five tabs. The tab you pick is kept in the web address (`?tab=`), so you can link to one. Under each tab, a small note names the file it comes from.

- **Status.** Cards for Done, In progress, Next, Open decisions and Blocked, each with a count, then a list under each heading. The note says when the status file was last updated. Check that date before you trust the page. This is from `docs/STATUS.md`.
- **Open decisions.** The questions still waiting for an answer, with a count on the tab. If an item mentions a decision number, a link jumps to that record. Once a question is settled, it is written up as a decision record and removed from this list.
- **Decisions.** The numbered decision records from `docs/decisions/`. Each has a status badge such as accepted or proposed, and a Show and Hide control to read the full text. A decision is never edited after it is accepted. A later record replaces it.
- **Changelog.** What changed, newest first, from `docs/CHANGELOG.md`. New work sits under "Unreleased", marked "Not yet released".
- **Learnings.** Things that were not obvious and cost time, from `docs/LEARNINGS.md`. It is mostly for the people building the software.

## Buttons and actions

The tabs are the only controls. There is no save or edit button, because everything is read-only.

### Status

Shows what is done, in progress, next, blocked and waiting for a decision.

### Open decisions

Shows only the questions still waiting for an answer.

### Decisions

Lists every decision record. Press Show on one to read it.

### Changelog

Shows the history of changes, newest first.

### Learnings

Shows the lessons file.

## How it connects to other screens

- **Help.** Help explains how to use the panel. Project says what the project is doing and why.
- **Metrics.** When the 90-day gate is decided, the decision is written as a record in `docs/decisions/` and then appears under Decisions.
- **Every screen.** When someone changes a screen or button, they also add a line to the Changelog and update Status. That is how this page stays true.

## Common mistakes

- **Trying to edit a page here.** You cannot. The files are edited in the repository, and the change appears after the site is redeployed or reloaded.
- **Trusting an old status.** Always check the "Last updated" date on the Status tab.
- **Reversing a decision in conversation.** If you disagree with a decision, the right step is a new decision record that replaces it.
- **Looking for client data.** None is here. This is about the project, not about cases.
- **Treating a proposed decision as final.** Read the status badge. Only accepted records are settled.

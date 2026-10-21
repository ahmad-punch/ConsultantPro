---
title: "Dashboard"
slug: "screens/dashboard"
summary: "The Today screen: what needs doing right now, in one place."
audience: "everyone"
order: 110
---

# Dashboard

## Why this screen exists

The dashboard is the first page you see after you sign in. Its title on screen is "Today". It answers one question: what should I do first this morning?

A case can quietly stall. A new lead can wait too long for a reply. A memo can run past its deadline. The dashboard pulls those three risks to the top. It does not change data. It shows you where to go, and almost every card links to the screen where the work happens. Spend about 15 minutes here every working day.


## What you see

**Five number cards across the top.**

- **Actions due.** The count of open cases whose "next action" date is today or already past. The small text under the number says how many are overdue and how many are due today.
- **New leads.** Enquiries that nobody has marked as contacted yet.
- **Memos due.** Memo cases that were opened more than 3 working days ago and have no memo delivered yet. Only cases at Intake, Triage or Memo drafting count. Errands are left out because they have no memo.
- **Revenue this month.** The total of payments with status Paid since the first day of this month, and how many payments that was.
- **Paid cases.** Shown as "X / 20". It counts every case marked Paid, across all time, against the 90-day target of 20. This card is not limited to a date range. Metrics uses a date range, so the two can differ.

**Next actions due.** A list of the overdue cases first, then the ones due today. Each row shows the case number, a badge such as "3d overdue" or "Today", the next action, the client, the product, the manager and the stage. Click a row to open the case. If nothing is due, the card says how many open cases have no next action date. Those are the dangerous ones, because they never appear on this list.

**Pipeline.** A bar for each stage, with the number of cases in it. Clicking a stage opens the Cases list filtered to that stage.

**Memo deliveries due.** The same cases counted by the Memos due card, oldest first.

**New leads.** The five most recent new leads, with category, source, how long ago, and an urgency badge.

**Quick links.** A row of pill-shaped links at the bottom.

## Buttons and actions

The dashboard has no forms. Everything here is a link. Nothing on this screen changes data.

### Actions due

Opens the Cases list showing open cases only, sorted by next action date, earliest first. Use it to work through everything that is late.

### New leads

Opens the Leads list filtered to status New. These people have not heard back from us yet.

### Memos due

Not a link. Scroll to "Memo deliveries due" below to see which cases are late.

### Revenue this month

Opens Payments, filtered to Paid.

### Paid cases

Opens Metrics.

### All open cases

Same as the Actions due card.

### Board

Opens the Cases screen in Board view, which shows one column per stage.

### All leads

Opens Leads, filtered to New.

### Open a case

Opens the New case form. See the Cases help page.

### Log a lead

Opens the New lead form. Use it for enquiries that came in by WhatsApp, phone or in person. Website enquiries are added automatically.

### Channels due a post

Opens the Channels screen in the "Due to post" view. These are the groups and pages where our scheduled post is overdue.

### Content calendar

Opens Content.

### 90-day gate

Opens Metrics.

### New

The "New" button sits in the top bar on every admin screen, not only here. It opens a small menu with two choices: "New case" and "New lead".

## How it connects to other screens

- **Leads feed it.** A new lead raises the New leads number. Marking it contacted or converting it lowers the number.
- **Cases feed it most.** The next action date you set on a case decides whether it shows in "Next actions due". The stage decides which pipeline bar it sits in. The created date and memo status decide whether it shows in "Memos due".
- **Payments feed it.** Recording a payment raises Revenue this month. A case marked Paid raises the Paid cases count.
- **Metrics is the long view.** The dashboard is today. Metrics is the whole 90 days.

## Common mistakes

- **Leaving the next action date empty.** A case without a date never appears in "Next actions due". Give every open case a date, even if it is only "check in with client on Friday".
- **Thinking Memos due means "the memo is late for the client".** It means the case is more than 3 working days old with no delivered memo. The promise to clients is 5 working days, so you have a small buffer. Act on this list early.
- **Reading Paid cases as this month's number.** It is all-time.
- **Expecting retainers in the pipeline.** Only cases appear there.
- **Ignoring the "no next action date" warning.** That text is the only place the dashboard tells you about cases it cannot show.

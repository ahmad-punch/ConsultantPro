---
title: "Cases"
slug: "screens/cases"
summary: "Every piece of paid or prospective work, from intake to close."
audience: "everyone"
order: 130
---

# Cases

## Why this screen exists

A case is one piece of work for one client: a question, a call, a Pathway Memo, a managed project or an errand. It holds everything about that work: owner, stage, next step, payments and every note. The stage tells the whole team where the work stands, and the Dashboard, Board and Metrics all read it.

## What you see

**The list.** One row per case: number (RS-0001 style), client, category, product, stage, price, payment status, next action, manager and date opened. Search by number, client or summary. Filter by open only, stage, category, product, payment and manager.

**List and Board views.** The toggle above the list switches between a table and a Board with one column per stage. Closed and Declined columns show only the latest 12.

**A case page.** From top to bottom:

- A header with the key facts and the action buttons.
- A **stage stepper** showing the normal path for that product. Errands run Intake, Triage, Errand in progress, Closed. Managed cases run Intake, Triage, Memo drafting, Memo delivered, Managed, Closed. Everything else runs Intake, Triage, Memo drafting, Memo delivered, Closed. Declined is a side exit from any stage.
- **Next action**, with a due badge.
- **Case details**, an editable form.
- **Activity**, the notes log. Every stage change, payment and edit writes a line with the author and time.
- On the right: client, people and links, payments, and referral and feedback.

## Buttons and actions

### New case

The button at the top of the list, and in the "New" menu. It opens a form with three parts: the client (pick an existing one, or leave it on "New client" and type their details), the case (Category, Product, Price, Summary, Case manager, Partner, Next action, Next action due, Payment link) and the referral (ambassador or earlier case).

### Open case

Saves the New case form. It creates the client if needed, creates the case at Intake with status Unpaid, writes a first note, and opens the case page. No money is taken.

### Advance stage

On the case page the button is labelled "Move to" plus the next stage name, for example "Move to Triage". It appears only when the case has a next step on its path. It moves the case one step forward and writes a note ("Stage changed: Intake -> Triage"). Moving into Memo delivered also stamps the memo delivered date if it was empty. Moving into Closed stamps the closed date, but it does not ask for feedback. Use Close out for that.

### Mark memo delivered

Appears on any case except errands, until a memo has been delivered. It records the memo delivered date as now. If the case is still before Memo delivered, it also moves the stage there. It writes a note. The "Median days to memo" gate uses this date, so press it on the day the client gets the memo.

### Record payment

Opens a form: Amount (USD, filled with the case price), Method (Stripe, Wise, Payoneer, Bank transfer, Other), Status (Paid, Unpaid, Refunded), Paid on, Reference. Saving adds a payment row and a note. Paid or Refunded changes the case's payment status to match. Unpaid leaves it alone. This is the only way a case becomes Paid.

### Set stage

Opens a form with "New stage" and "Reason (goes in the activity log)". Use it to skip a step, go back, or decline a case. Choosing Closed or Declined stamps the closed date. Choosing an open stage clears it. Declining is how you turn away a request we must not take. Write the reason.

### Close out

The button reads "Edit close-out" once a case is closed. It opens "Close out the case": NPS score (0 to 10), Would recommend? (Yes, No, Not asked yet), Closed on, and a Closing note. The submit button is "Save close-out". It sets the stage to Closed and stores the feedback. Ask the client the two questions first. These answers feed the "Would recommend" gate.

### Save changes

Saves the Case details form: summary, next action and date, case manager, partner, Drive folder, Memo document link, Payment link, category, product, price and referral links. It writes a note naming the tracked fields that changed. Changing the product changes the stage path shown in the stepper.

### Add note

Type in "Add a note" and press Add note. The note is signed with the name chosen under Settings, "Acting as". Add one every time you speak to the client or a partner.

## How it connects to other screens

- **Leads** create cases through Convert to case.
- **Clients** own cases. Each case links to one client.
- **Partners** are chosen on a case. The case page shows their agreed turnaround (SLA).
- **Ambassadors** are linked on a case. Commission comes from the price of Paid cases linked to them.
- **Payments** lists every payment recorded here.
- **Dashboard** reads next action, stage and memo dates.
- **Metrics** reads payment status, referral links, memo date and close-out answers.
- **Settings** decides whose name appears on notes.

## Common mistakes

- **Leaving Next action due empty.** The case will never show on the Dashboard.
- **Using Advance stage to close.** It skips the feedback questions. Use Close out.
- **Forgetting Record payment.** The case stays Unpaid and the numbers are too low.
- **Pressing Mark memo delivered at the wrong time.** The memo clock stops then.
- **Changing the price after payment.** Ambassador commission and category revenue use the case price, not the payment rows.
- **Not writing notes.** The log is the memory of the case.

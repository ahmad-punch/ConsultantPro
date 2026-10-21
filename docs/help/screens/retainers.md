---
title: "Retainers"
slug: "screens/retainers"
summary: "Family Affairs retainers: the monthly plans that give us recurring revenue."
audience: "everyone"
order: 200
---

# Retainers

## Why this screen exists

Most of what we sell is a one-off: a question, a memo, an errand. A retainer is different. A family pays a fixed amount every month for ongoing cover, and in return someone keeps an eye on their property and answers their questions. It is our only recurring income, and it is the best sign that people trust us for the long term.

The three tiers are Watch ($79 a month), Plus ($149) and Family Office ($249). The exact contents of each tier are on the public pricing page and in `src/lib/pricing.ts`.

This screen tracks who has a retainer, what they pay, whether it is still running, and how much has actually been collected.

## What you see

**Four number cards.**

- **Active retainers.** How many are currently running.
- **Monthly recurring.** The total monthly price of all active retainers. Finance people call this MRR.
- **Sign-ups (all time).** Every retainer ever started, including cancelled ones. The card reminds you the gate target is at least 3.
- **Cancelled.** How many have ended.

**The list.** One row per retainer: client (a link), tier, monthly price, start date (with the cancelled date if any), "Paid to date" (the sum of Paid payments linked to it), and status. Active retainers are listed first.

## Buttons and actions

### Start retainer

Opens a form: Client, Tier, Monthly (USD) and Started on. Choosing a tier fills in the list price. You can change it if you agreed a different amount. Saving creates an Active retainer. It does not take money and it does not message the client. The same button appears on a client page with the client already chosen.

### Cancel

Appears on each active retainer. After a confirmation question it sets the status to Cancelled and records today as the cancelled date. It does not refund anything and does not delete anything. Payments already recorded stay. Cancelled retainers drop out of "Monthly recurring" and "Active retainers" but still count in "Sign-ups" for the gate.

## How it connects to other screens

- **Clients.** Every retainer belongs to a client. The client page lists their retainers and has its own Start retainer and Cancel buttons.
- **Payments.** Each month's fee is recorded as a payment against the retainer. This is the only way "Paid to date" grows.
- **Metrics.** "Retainer sign-ups" counts retainers whose start date falls in the date range. "Revenue per paid interaction" includes retainer payments.
- **Dashboard.** Retainers do not appear in the pipeline. They are not cases.

## Common mistakes

- **Assuming the system bills the client.** It does not. You collect each payment yourself (Stripe link, Wise and so on) and then record it.
- **Forgetting to record the monthly payment.** The retainer looks like it earns nothing.
- **Cancelling when the client has only paused.** There is no pause. Cancel ends the retainer. To restart, create a new one.
- **Starting a retainer before the first payment.** It counts as a sign-up for the gate straight away. Start it when the client has agreed and paid.
- **Offering retainers only to a few people.** The plan says to offer one to every Case Assessment client.
- **Not tracking how much work a retainer takes.** The plan warns that high-touch retainers can overload a case manager. Note extra effort in the client record.

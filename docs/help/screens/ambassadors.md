---
title: "Ambassadors"
slug: "screens/ambassadors"
summary: "Community members who refer clients for a commission, and how we pay them."
audience: "everyone"
order: 160
---

# Ambassadors

## Why this screen exists

Trust is the hardest part of this business. People abroad do not send money to a company they have never heard of. They do trust a respected person in their own community. An ambassador is that person: someone in a mosque, an association, a community centre or a WhatsApp group who tells others about us.

We pay them a commission on cases that come through them. This screen records who they are, which referral code is theirs, which cases they brought, how much we owe them, and what we have already paid.

## What you see

**The list.** One row per ambassador: name and commission rate, referral code, location, referred cases, revenue, amount paid out, amount due, and status (Active or Inactive). A due amount above zero is highlighted.

**An ambassador page.**

- A **referral link** in the form `.../start?ref=CODE`, with a "Copy link" button. When a visitor opens that link, the public intake form already has the code filled in.
- Four number cards: Referred cases, Paid revenue referred, Commission earned, Commission due.
- **Referred cases**, with price, payment badge and stage.
- **Channels they cover**, **Clients** they brought, and any notes.

**How commission is worked out.** Take the price of every referred case that is marked Paid. Multiply by the commission percentage. That is the amount earned. Subtract what you have already recorded as paid out. What remains is the amount due. It never goes below zero.

## Buttons and actions

### New ambassador

Opens a form: Name, Referral code, Country, City, WhatsApp, Commission (%), Notes and an "Active" tick box. The code must be 3 to 20 letters, digits or dashes, for example UK-BHAM1. It is saved in capitals and must be unique. The default commission is 10 percent.

### Add ambassador

Saves the form and opens the ambassador's page. If the code is already taken you will see an error on the code field.

### Record payout

Opens "Record a commission payout". The amount is filled with the commission due. Change it if you paid a different amount. Saving adds the amount to "Paid out" and reduces the amount due. It does not send any money. Send the money first, by Wise or bank transfer, then press this so the record is true.

### Edit

Opens the same form with the details filled in. The save button is "Save ambassador". Untick "Active" to stop an ambassador without losing their history.

### Copy link

Copies the ambassador's referral link so you can paste it into a message.

## How it connects to other screens

- **Public site.** The `?ref=CODE` link puts the code into the intake form. It lands on the lead as a referral code.
- **Leads.** A lead with a matching code shows the ambassador's name on the lead page.
- **Cases and Clients.** Converting a lead attaches the ambassador to the client and the case. You can also set it by hand on a case.
- **Channels.** A channel can be linked to the ambassador who covers it.
- **Metrics.** The "Referrals" gate counts paid cases with an ambassador or an earlier client linked.

## Common mistakes

- **Paying before the case is Paid.** Commission only counts cases marked Paid. Do not promise money for unpaid cases.
- **Recording a payout without paying, or paying without recording.** The balance will be wrong either way.
- **Changing the commission rate later.** The rate applies to all of that ambassador's cases, old and new, because the amount is recalculated each time. Agree the rate in writing first.
- **Expecting one payment for the first purchase only.** The plan talks about a share of the first purchase. The screen calculates on every paid referred case. TODO: confirm which rule the business wants.
- **Sharing the wrong link.** Use "Copy link" on the right ambassador's page.
- **Paying someone for work that is not a referral.** Commission is for introductions, not for advice or errands.

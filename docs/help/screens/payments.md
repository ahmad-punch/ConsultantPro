---
title: "Payments"
slug: "screens/payments"
summary: "The record of money received or refunded, for cases and retainers."
audience: "everyone"
order: 190
---

# Payments

## Why this screen exists

The system does not take money by itself. Clients pay through a Stripe link, Wise, Payoneer or a bank transfer, outside the panel. This screen is where you write down that the money arrived.

That record matters for three reasons. It tells you who has paid and who has not. It feeds the revenue numbers on the Dashboard and Metrics. And when you record a payment against a case, the case itself changes to Paid, which is the thing the 90-day gate counts.

## What you see

**The list.** One row per payment, newest first: date, what it was for (a case number and client, or a retainer tier and client), amount in US dollars, method, status, and the reference.

**Statuses.**

- **Paid.** The money arrived.
- **Unpaid.** A promise or an invoice that is not paid yet.
- **Refunded.** Money went back to the client.

**Methods.** Stripe, Wise, Payoneer, Bank transfer, Other.

**Filters.** Status and method. There is no text search.

**Footer.** "Paid total (shown rows)" adds up only the Paid rows currently shown. If you filter by method, the total follows the filter.

**Three money streams stay separate.** This list holds only our own fees. The advocate's fee is paid by the client to the advocate directly. Government fees are paid at cost against a receipt. Neither belongs here.

## Buttons and actions

### Record payment

The button at the top of the screen, and also on every case page. The form asks:

- **Payment for.** A case or a retainer. (On a case page this is already fixed.)
- **Case** or **Retainer.** Pick which one.
- **Amount (USD).** Whole dollars. On a case page it is filled with the case price.
- **Method.** Defaults to Stripe.
- **Status.** Defaults to Paid.
- **Paid on.** Defaults to today.
- **Reference.** The Stripe or Wise reference. Fill it in. It is how you find the money later.

Saving adds a payment row. For a case payment, it also:

- changes the case's payment status to Paid or Refunded when you choose either of those (choosing Unpaid leaves the case alone), and
- writes a note on the case, for example "Payment recorded: $249 via Stripe (paid)".

For a retainer payment it only adds the row.

## How it connects to other screens

- **Cases.** A case payment sets the case's payment status. The case page lists its payments.
- **Retainers.** A retainer is paid every month, so record one payment each month against the retainer. The Retainers screen shows "Paid to date".
- **Dashboard.** "Revenue this month" is the sum of Paid payments since the first of the month. "Paid cases" counts cases marked Paid.
- **Metrics.** "Revenue per paid interaction" is total Paid payments divided by the number of Paid payments in the date range. "Revenue by product by month" groups the same payments by product.

## Common mistakes

- **Recording the same payment twice.** There is no edit or delete. A duplicate stays, and revenue is overstated. Check the list before you record.
- **Forgetting the monthly retainer payment.** Retainer revenue only appears when you record it.
- **Recording a refund and expecting revenue to drop.** A refund is a new row. The earlier Paid row still counts as revenue. The case will show Refunded and leave the Paid case count. TODO: confirm whether revenue should net off refunds.
- **Recording the advocate's fee here.** It is not our money. Leave it out.
- **Typing an amount in the wrong currency.** The field is US dollars only.
- **Leaving the reference blank.** You will not be able to match it to the bank or Stripe later.

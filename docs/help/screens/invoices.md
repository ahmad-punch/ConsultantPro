---
title: "Invoices"
slug: "screens/invoices"
summary: "Invoices, receipts and quotes: create from a case, preview, download as PDF, mark sent or paid."
audience: "everyone"
order: 195
---

# Invoices

## Why this screen exists

Some clients (and every company or family-office client) want a proper invoice, a receipt after paying, or a quote before agreeing. This screen makes those documents in the company's branding, keeps one numbering sequence (`INV-0001`, `INV-0002`...), and ties payment back to the case so the case's payment status stays right.

## What you see

- A list of invoices, receipts and quotes, newest first, with number, client, linked case, issue and due dates, total and status (Draft, Sent, Paid, Void).
- Filters for status and type.
- A footer with the total billed for the rows shown (quotes and void invoices are left out) and how much of that is paid.
- On an invoice's own page: a preview that looks the same as the PDF, and the action buttons.

Amounts are whole US dollars. Client details, branding and template text are copied into the invoice when it is created, so later edits to a client or the branding never change an issued invoice.

## Buttons and actions

### New invoice

Opens the invoice form. Choose the document (Invoice, Receipt or Quote), an optional case, the client, the template, the dates and the line items. Choosing a case fills in the client and adds one line with the case's product and agreed price. Add or remove lines, set the tax amount if any, and add notes. The total updates as you type. You can also open the form from a case page with **Create invoice**.

### Export CSV

Downloads every invoice as a spreadsheet file (opens in Excel or Google Sheets). For a date range or other records, use the Exports tab on the Documents screen.

### Mark sent

Moves a draft to Sent and records when. Do this once you have emailed or sent the PDF to the client.

### Mark paid

Asks for the method, date and reference, then records a payment on the Payments screen for the invoice total, links it to the invoice, and, if the invoice is for a case, sets that case's payment status to Paid and adds a note to the case.

### Download PDF

Opens the PDF in a new tab. Save or send it from there.

### Print view

Opens a clean page of the same document. Use your browser's Print and "Save as PDF" if the PDF download ever fails.

### Duplicate

Makes a new draft with the same client, lines and totals, a new number and today's date.

### Void

Cancels an unpaid invoice. The number stays used so the sequence has no gaps. A paid invoice cannot be voided; refund the payment instead.

## How it connects to other screens

- **Cases**: the **Create invoice** button on a case opens this form prefilled. Marking an invoice paid updates the case's payment status and writes a case note.
- **Payments**: Mark paid creates the payment row there.
- **Documents**: branding (name, address, colours, logo, bank details) and the templates (intro, terms, footer, sections) used here are edited on the Documents screen.

## Common mistakes

- Recording the payment on the Payments screen **and** clicking Mark paid. That creates two payments. Use one or the other.
- Editing the branding and expecting old invoices to change. They keep the details they were issued with; duplicate the invoice to reissue it.
- Typing prices in by hand when the case already has an agreed price. Pick the case first so the line is filled from it.
- Adding fees for advocates as our line items. Advocates bill clients directly.

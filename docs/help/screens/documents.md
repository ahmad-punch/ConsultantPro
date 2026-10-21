---
title: "Documents"
slug: "screens/documents"
summary: "Branding, document templates, generated letters and summaries, and CSV exports."
audience: "everyone"
order: 196
---

# Documents

## Why this screen exists

Every document we send (invoice, receipt, quote, engagement letter, case summary) should look the same and carry the same disclaimers: we are not a law firm, what we give is general information, and advocates bill separately. This screen holds the company details and the wording in one place so nobody retypes them, and it is where staff download data as spreadsheets.

## What you see

Four tabs:

- **Templates**: one row per template with its document type, name, title and whether it is the default for that type. A default template for each type is created automatically the first time the screen opens.
- **Generated**: engagement letters and case summaries made for a case, with a PDF link.
- **Branding**: the company details used on every document, with a live preview next to the form.
- **Exports**: download buttons for cases, leads, clients, payments, invoices, retainers, ambassadors, channels and partners, with an optional date range.

## Buttons and actions

### New template

Creates a template. Fill in the name, type, title, intro, terms, footer and any extra sections (each a heading and a body; add and remove them freely). Tick the options: show bank details, show a signature block, show the tax line, show the case reference. Intro, sections and terms can use `{client}`, `{case}` and `{number}`, which are replaced when the document is made.

### Edit

Changes a template. Documents already issued keep the wording they were made with.

### Duplicate

Copies a template so you can try a variation without touching the original. The copy is never the default.

### Make default

Makes this the template picked automatically for its type. Only one template per type is the default.

### Generate document

On the Generated tab. Choose a case and an engagement letter or case summary template. The document is made from the case, the client and the current branding and saved, so its PDF never changes afterwards. Engagement letters include the case fee; case summaries include the case's product, category, stage and summary.

### Save branding

Saves the legal name, trading name, address, contact details, logo link, colours, tax label and number, bank details, currency and footer text. New invoices and documents use it from then on. The logo must be a PNG or JPG link; leave "Show logo" off until you have one.

### Exports

Each button downloads a CSV file. Leave the dates empty for everything, or set From and To to limit by the date the record was created. Files open in Excel with Urdu text intact.

## How it connects to other screens

- **Invoices**: uses the default invoice, receipt or quote template and the branding.
- **Cases**: generated letters and summaries are made from a case; invoices can be made from the case page.
- **Payments, Leads, Clients and the rest**: the Exports tab downloads their records.

## Common mistakes

- Removing the "not a law firm, general information, advocates bill separately" wording from a template. Keep it on every document (see CLAUDE.md, "Not a law firm").
- Putting real bank details in before the company account exists. Leave a `TODO:` until it does.
- Using an SVG logo. PDFs cannot draw SVG; use PNG or JPG.
- Sending an export file outside the team. It contains client names and contact details.

---
title: "The public website"
slug: "public-site"
summary: "Every public page, why it exists, what a visitor can do, and where the intake form data goes."
audience: "everyone"
order: 40
---

# The public website

The public website is what a stranger sees before they trust us. Its job is simple: explain what we do, show real prices, answer worries, and get the person to send us their problem. It has no login. Everything on it is visible to anyone.

Page code lives in `src/app/(marketing)/`. Brand values come from `src/lib/site.ts`, and prices from `src/lib/pricing.ts`. Do not type a price into a page by hand.

## The pages

### Home (`/`)

Why: the first impression. It states who we serve, shows the five-step process, gives a preview of the Pathway Memo, lists prices, shows cited facts about the problem, explains what we do to earn trust, shows three recent guides and a few common questions.

A visitor can: start a case, read prices, open a guide, or read the FAQ. The big button is "Start a case".

Note: the "written update" shown at the top is an illustration and is labelled "Illustration". It is not a real case.

### Pricing (`/pricing`)

Why: people abroad will not contact a company that hides its prices. This page shows every product and the three retainer tiers, what each includes and excludes, and the three cost notes (advocate fees billed directly, government fees at cost, one stage at a time).

A visitor can: compare products and tiers, and press a pay button. If a Stripe link is set for that product, the button says "Pay by card" and opens the payment page. If not, it says "Pay on invoice" and goes to the intake form. The Settings screen shows which links are set. The button adds `?product=` to the form address. The form does not use that value yet. TODO: confirm.

### How it works (`/how-it-works`)

Why: to answer "what happens after I send my problem?". It walks through the lifecycle from intake to closure, explains the memo, managed cases and errands, lists what is and is not included, and states the refund policy in plain words. The refund text still carries a visible "TODO: confirm refund wording with counsel before launch".

### Guides (`/guides` and `/guides/[slug]`)

Why: free, useful content that builds trust and brings in people who search for help. There are 10 guides, for example on succession certificates, power of attorney from abroad, FBR filer status, and FIR basics. Each has a short Urdu summary, a table of contents and related guides.

A visitor can: read a guide and move to the intake form. The guides come from files in `content/guides/`. Editing a file changes the guide. The Content screen in the panel is only a planning calendar.

### About (`/about`)

Why: to show who we are and who we are not. It says we are not a law firm, not a fixer, and make no outcome promises. It describes the roles (case managers, partner advocates, errand runners, advisers) and explains that files live in the client's own Google Drive. Adviser names are shown as visible "TODO" placeholders until real advisers agree to be named.

### FAQ (`/faq`)

Why: it answers the questions people ask first: what we do and do not do, prices and paying from abroad, timelines, refunds, property and inheritance, documents. It also feeds search engines.

### Start a case (`/start`)

Why: this is the one page that matters most. It is the front door that creates a lead.

A visitor fills in a form and presses **Send my case**. The fields:

- Your name, WhatsApp number (with country code), Email (optional).
- Country you live in (a list).
- What is it about? (one of the ten categories)
- How urgent is it? (Low, Normal, Urgent, each with a short explanation)
- What is happening? (at least 20 characters)
- Referral code (optional).
- A tick box confirming they have read the disclaimer. It is required.

The address can carry hints: `?category=` pre-selects the category, `?ref=CODE` fills the referral code (this is how an ambassador's link works), and `?src=name` records where the visitor came from.

The form also has a hidden field that only software fills in (a "honeypot"). If it is filled, the submission is quietly dropped. After 5 submissions from one internet address in 10 minutes, further ones are refused for a while. These are spam guards.

**Quick questions by category.** Once the visitor picks a category, a few extra questions appear (all optional). For example, Property asks for the district, type of record, who is occupying it and whether they hold a power of attorney; Inheritance asks for the deceased's name, date of death, number of legal heirs and whether there is a dispute. Police / FIR, Tax (FBR), NADRA / NICOP, Attestation, Company (SECP), Court records and Errand each have their own short set. "Other" has none. Answers are saved on the lead, shown in a **Details** section on the lead's page, and copied into the case summary when you convert the lead.

**Where the data goes.** A successful submission creates a row in the leads table. In the panel it appears on the **Leads** screen with status **New**, and raises the "New leads" count on the Dashboard. The lead gets:

- the details typed in, including the category questions,
- the referral code (letters, digits, dashes and underscores only, in capitals),
- a source: the `?src=` value, or "website" if there is none.

The visitor sees a thank-you message with a short reference (the first 8 characters of the lead's id). They also see a "Message us on WhatsApp" button if a WhatsApp number is configured.

No document is uploaded here. The page tells people not to send documents yet.

### Legal pages (`/legal/terms`, `/legal/privacy`, `/legal/disclaimer`)

Why: they set out the rules between us and a client: what we provide, prices, refunds, how data is handled, and the "not a law firm" disclaimer. They are drafts. They need a lawyer's review before launch and still carry visible TODO markers for entity, retention periods, liability cap and governing law.

Keep every disclaimer that exists. Do not soften them.

### Client status page (`/c/<token>`)

Why: clients can check where their case stands without messaging us. Each case has a private, unguessable address; the case page in the control panel has a **Copy link** button for it.

What it shows: the case number and service, the stages as a stepper, "What happens next" (the case's next action, or a standard sentence for the stage), a **Read your plan** button once the memo link is set, **Pay now** while unpaid and a payment link is set, the Drive folder, the last five notes, a WhatsApp button and the disclaimer. Notes starting with `[internal]` are never shown. Search engines are told not to index it. Archived cases show the not-found page.

When a client pays through the **Pay now** button, Stripe tells the site, which records the payment, marks the case paid and writes a note (see `docs/DEPLOY.md`, Stripe webhook).

## Behind the scenes

- **Header and footer.** The header lists How it works, Pricing, Guides, FAQ, About and a "Start a case" button. The footer links to the legal pages and shows the disclaimer.
- **Search engines.** A sitemap, a robots file, a shared preview image and structured data are produced automatically.
- **Placeholders.** Anything starting with "TODO" is a placeholder, shown visibly so no one mistakes it for a final value.
- **Not found page.** A friendly page for broken addresses.
- **Emails.** When someone sends the intake form with an email address, they get a short confirmation with what happens next and the WhatsApp link. Emails are only sent once the email service is configured.
- **Language.** English, with an Urdu summary on each guide and Urdu available on request for memos.

## What the site never does

No fake testimonials. No invented numbers. No promise of an outcome. No mention of anyone's access or influence. No client documents are collected on the site.

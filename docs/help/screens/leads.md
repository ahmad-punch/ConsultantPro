---
title: "Leads"
slug: "screens/leads"
summary: "Everyone who asked for help, before they become a paying case."
audience: "everyone"
order: 120
---

# Leads

## Why this screen exists

A lead is a person who has asked for help but has not bought anything yet. Keeping leads apart from cases matters for two reasons.

First, most leads never pay. If every enquiry were a case, the case list would fill with noise. Second, we promise a quick reply. This is the inbox where that promise is kept: contact every new lead within one working day.

A lead turns into a case only when you press "Convert to case". That moment is the line between an enquiry and a piece of work.

## What you see

**The list.** One row per lead with: name (and the country and start of the problem text underneath), category, urgency, source, status, how long ago it arrived, and the linked case number once it has been converted. Click a name to open the lead.

**Search and filters.** A search box (name, phone, country, problem text) and drop-downs for Statuses, Categories and Sources. A "Clear" button appears when a filter is active. You can sort by name, urgency, status or received date.

**Statuses.**

- **New.** Nobody has contacted them yet.
- **Contacted.** Someone has messaged or called.
- **Converted.** A case exists. The lead links to it.
- **Lost.** They went quiet, said no, or were not a fit.

**A lead page.** Shows what they asked, their WhatsApp number (a link that opens a chat), email, country, source, referral code and the ambassador it belongs to. A card on the right converts the lead or links to its case.

**Where leads come from.** The public "Start a case" form adds one automatically. You can also add one by hand.

## Buttons and actions

### New lead

The button at the top of the Leads list, and also in the "New" menu in the top bar. It opens a form for logging an enquiry that came in by WhatsApp, phone or in person.

The form asks for Name, WhatsApp, Email (optional), Country they live in, Category, Urgency, Source, Referral code (optional) and "What is the problem?". Pick the true source, because Metrics reports on it.

### Add lead

The button that saves the New lead form. It creates a lead with status New and takes you to the lead's page.

### Mark contacted

Shows only while the lead is New. It changes the status to Contacted. It sends nothing. Message the person yourself first, then press this so the team can see it is handled.

### Mark lost

Shows while the lead is New or Contacted. After a confirmation question ("Mark this lead as lost?") it changes the status to Lost.

### Reopen

Shows only on a Lost lead. It changes the status back to New so the lead returns to the inbox. A lost lead cannot be converted until you reopen it.

### Edit

Opens a form to correct any detail, including the status. The save button is "Save lead".

### Save lead

Saves the Edit form.

### Convert to case

This is the card on the right of a lead page. It is the most important button on this screen. You choose a Product, a Price (USD), an optional Case manager and a Case summary. The product defaults to Case Assessment. For errand, NADRA and attestation leads it defaults to Errand. The price fills in from the price list and you can change it if you quoted something else.

When you press it, five things happen in one go:

1. The system looks for an existing client with the same WhatsApp number or the same email. If it finds one, the case is attached to that client. If not, a new client is created from the lead.
2. If the lead has a referral code that matches an ambassador, that ambassador is attached to the new client and to the case.
3. A case is opened with the next case number (RS-0001 style). Its next action is set to "Confirm details and send the payment link", due tomorrow.
4. A note is written on the case saying where it came from.
5. The lead becomes Converted and links to the case. You are taken to the new case.

The case starts Unpaid at the Intake stage. Converting does not take any money.

### Open case

Shows on a converted lead. It takes you to the case the lead became.

## How it connects to other screens

- **Public site.** The "Start a case" form creates leads here.
- **Cases.** Converting a lead creates a case and often a client.
- **Clients.** A converted lead creates a client unless the same person already exists.
- **Ambassadors.** A referral code on a lead links the case to an ambassador, and that is how commission and the "referrals" gate are worked out.
- **Dashboard.** The New leads card counts leads with status New.
- **Metrics.** "Leads by source" counts leads received in the date range, and how many converted.

## Common mistakes

- **Converting before the person agrees to buy.** A case suggests real work.
- **Forgetting to press Mark contacted.** The dashboard keeps counting the lead as waiting, and your colleagues may contact them twice.
- **A typo in the referral code.** The lead page says "no ambassador with this code". Fix it with Edit before converting, or the ambassador is not credited.
- **Creating a duplicate by hand.** Check the list first.
- **Expecting Mark lost to delete.** It never deletes. Use Reopen to bring a lead back.

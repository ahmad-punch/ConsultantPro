---
title: "Network"
slug: "screens/network"
summary: "Recruit, onboard, rank and dispatch independent providers: applications, providers, engagements and the dispatch board."
audience: "everyone"
order: 155
---

# Network

## Why this screen exists

Rasta's work on the ground is done by independent advocates, errand runners, accountants and advisers. This section is where we recruit them, check them, sign them up, give them work and group errands so one office visit covers several clients. The rules behind it are in decision 0004 (tiers, anti-poaching) and 0005 (pooling).

## What you see

Four tabs.

**Applications.** Everything sent from `/partners/apply` and `/partners/ambassadors`, newest first, filterable by status and type. Open one to read it, keep screening notes and decide.

**Providers.** Every provider with tier, onboarding stage, offices (departments), service areas, average rating and completed engagements. Filter by type, office and tier; click a city to see who serves it. Click a name for the provider page.

**Engagements.** Every piece of work given to a provider, with case, provider, office and city, fee and who bills it, status, due date and the actions for the next step.

**Dispatch.** Open engagements and errand-type cases with no accepted engagement, grouped by city and office. Each group lists the providers who serve that city and office, best tier and rating first.

## Buttons and actions

### Start review
Moves a new application to Reviewing.

### Move to interview
Marks that you have booked or held the interview. Use the interview script in `marketing/partner-recruitment.md`.

### Approve and create provider
Creates the provider record (stage Applied, inactive) with the offices and service areas from the application, and links it. For an ambassador application the button reads "Approve and create ambassador" and creates an ambassador with a generated referral code.

### Reject
Asks for a reason, which is kept in the application notes.

### Save notes
Saves screening notes. Keep the "Departments:" and "Service areas:" lines; approval reads them.

### Create batch
On Dispatch: tick items in a group, choose a provider, a fee per item and a visit date. Unassigned cases get a new engagement each; proposed engagements are reassigned. All share one batch key, and each case gets a note.

### Going in
On Dispatch: record that a provider is visiting this office in this city today. Their open cases get a note and the group is moved to the top and highlighted so you can add the other pending items to the batch.

### Accept
The provider accepted in writing and acknowledged the no-poaching policy. Stamps the acknowledgement. From now on "Copy brief" includes the client's contact details.

### Start
The provider has started work.

### Deliver
The provider says the work is done. The delivery time counts for on-time rate.

### Complete
You have checked the result. Updates the provider's completed count.

### Cancel
Stops an engagement that will not go ahead.

### Dispute
Something is wrong with the work or the conduct. Disputes count against Silver and Gold.

### Copy brief
Copies the engagement brief for WhatsApp, with the policy text. Before acceptance it says the client's contact will be shared after acceptance.

### Rate
After completion: rating 1 to 5 and a note. Updates the provider's average rating.

## How it connects to other screens

- Cases: "Engage provider" on a case page creates an engagement; every engagement change is written to the case notes.
- Partners: the provider page (`/admin/partners/[id]`) has the onboarding steps, tier suggestion and history.
- Ambassadors: approved ambassador applications appear there with their referral code.
- Public site: `/partners`, `/partners/apply`, `/partners/ambassadors`.

## Common mistakes

- Sharing the client's phone number before the provider accepts. Use "Copy brief"; it holds it back.
- Choosing "Rasta pays the provider" for an advocate. Advocates bill clients directly; the form refuses it.
- Batching items whose documents are not ready. Check the file first; a batch is only as good as its weakest item.
- Leaving a case's office and city empty. Dispatch groups them under "No city" / "No office" and cannot match providers.

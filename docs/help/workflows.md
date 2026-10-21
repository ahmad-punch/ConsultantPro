---
title: "Workflows"
slug: "workflows"
summary: "Step-by-step jobs with the exact button names: from lead to paid case, memos, managed cases, errands, retainers, payouts, posting and weekly review."
audience: "everyone"
order: 30
---

# Workflows

Each workflow lists the screens you will use and the exact buttons to press. Button names are written in bold. For what a button does in more detail, open the page for that screen.

## The daily 15 minutes

1. Open the **Dashboard** ("Today"). Clear the overdue items under "Next actions due".
2. Reply to anything under "New leads". The promise is a reply within one working day.
3. Look at "Memo deliveries due". Anything there is already more than 3 working days old.
4. After every client or partner conversation, add a note to the case.

## 1. From new lead to paid case

1. **Leads.** Open the lead. If it came in by phone or WhatsApp and is not there, press **New lead**, fill the form and press **Add lead**.
2. Message the person on WhatsApp (click their number on the lead page). Then press **Mark contacted**.
3. When they are ready to buy, press **Convert to case** on the right of the lead page. Check the Product and the Price. The price fills in from the price list. Choose a Case manager. Tidy the Case summary into one clear paragraph. Press **Convert to case**.
4. You land on the new case at the Intake stage, Unpaid. Under Case details, paste the Stripe link into **Payment link** and press **Save changes**. Send the link to the client.
5. When the money arrives, press **Record payment** on the case. Check the Amount and Method, keep Status on Paid, add the Reference, and press **Record payment**.
6. The payment badge now says Paid. Set the next action and its date under Case details, then press **Save changes**.
7. Press the **Move to** button at the top (it names the next stage, for example "Move to Triage") when triage is done.

If the person decides not to buy, press **Mark lost** on the lead instead.

## 2. Delivering a Pathway Memo

1. On the case, finish triage and press **Move to Memo drafting**.
2. In the client's Google Drive, create the folder and a Google Doc for the memo. Paste both links into **Drive folder** and **Memo document** under Case details. Choose the **Partner** (the reviewing advocate). Press **Save changes**.
3. Draft the memo. Ask the partner advocate to review the legal content. Add a note when you send it and a note when it comes back.
4. Set Next action to the delivery step and the date to your deadline. The target is 5 working days from the day the case was opened.
5. Send the memo to the client. The same day, press **Mark memo delivered**. This stamps the date and moves the case to Memo delivered.
6. Hold the walk-through call. Add a note of what was said.
7. If the client wants more, move on (see workflow 3). If not, use **Close out** (workflow 8).

## 3. Running a managed case

1. Make sure the case Product is Managed Case. If it started as an assessment, open Case details, change Product and Price, and press **Save changes**. The stage path now includes the Managed stage.
2. Choose a **Partner** who is an advocate working on their own letterhead. Remember: the advocate bills the client directly. We only record our own project fee.
3. After the memo, press **Move to Managed**.
4. Agree a milestone plan in writing with the client. Each time a stage fee is paid, press **Record payment**. The case turns Paid after the first payment, even if later stages are unpaid. TODO: confirm how the team wants to show part-paid managed cases.
5. At least every 14 days, send the client a written update, even if nothing moved. **Add note**, then set the next action date 14 days ahead with **Save changes**.
6. When the work ends, **Close out**.

## 4. Running an errand

1. **New case.** Pick the client. Set Category (for example NADRA / NICOP, or Attestation) and Product to Errand. The price fills in at the lowest list price. Set the price you quoted. Choose the errand runner as **Partner**. Press **Open case**.
2. Record the payment with **Record payment** before work starts.
3. Press **Move to Triage**, then **Move to Errand in progress** when the runner is on it.
4. Government fees are paid at cost and are not recorded under Payments. Add a note with the amount and receipt number for each fee.
5. When the document or receipt is in hand, hand it to the client and **Close out**.

## 5. Starting and cancelling a retainer

**Start.** Open the client and press **Start retainer**, or open **Retainers** and press **Start retainer**. Choose the Tier. The Monthly price fills in. Check the date. Press **Start retainer**. Each month, after the money arrives, go to **Payments**, press **Record payment**, set Payment for to "A retainer", choose the retainer, and press **Record payment**.

**Cancel.** On the Retainers screen or the client page, press **Cancel** next to the retainer and confirm. Payments already recorded stay. The retainer stops counting as active. It still counts as a sign-up.

## 6. Paying an ambassador

1. Open **Ambassadors** and click the name. Read "Commission due". It is the percentage of the price of their Paid referred cases, minus what you have already paid.
2. Send the money outside the panel, by Wise or bank transfer.
3. Press **Record payout**, confirm the amount, and press **Record payout** again to save. "Paid out" rises and "Commission due" falls.

## 7. Posting to channels on cadence

1. Open **Channels** and choose the **Due to post** view. The longest overdue is first.
2. Open **Content**. Find an item with status Approved and the right language. If none is approved, ask a founder to approve one (the founder presses **Mark approved**).
3. Post it in the group by hand, following that group's rules.
4. Back on **Channels**, press **Log post** on that row.
5. On **Content**, press **Mark posted**, paste the link if there is one, and press **Mark posted**.

Never post a client's details in a group.

## 8. Closing out a case and recording NPS

1. Ask the client two questions: "From 0 to 10, how likely are you to recommend us?" and "Would you recommend us?".
2. On the case page press **Close out** (or **Edit close-out** if it is already closed).
3. Enter the NPS score, choose Yes or No for Would recommend, check the Closed on date, and write a Closing note.
4. Press **Save close-out**. The stage becomes Closed.
5. Offer a retainer if they bought a Case Assessment, and ask for an introduction. Link any referral on the new case.

If the client is unreachable, leave Would recommend on "Not asked yet". Do not guess.

## 9. The weekly metrics review (founders, 45 minutes)

1. Open **Metrics**. Press **First 60 days** (or use From, To and **Apply**).
2. Read the six cards: Paid cases, Revenue per paid interaction, Referrals, Retainer sign-ups, Median days to memo, Would recommend. Note which are red.
3. For each red card, ask what data is missing before you ask what is wrong. Unrecorded payments, referral links and close-out answers all pull numbers down.
4. Write the numbers under a "Week N" line in `docs/STATUS.md`. This one is a file edit, not a button.
5. Then clear the **Channels** due list, approve next week's posts on **Content**, and pay what is due on **Ambassadors**.

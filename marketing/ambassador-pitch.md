# Ambassador pitch

For community members who might introduce Rasta to others. Terms marked (assumption) are not final. Confirm the fee flow with a Bar Council member before paying anyone (plan section 6.1).

---

## 1. The pitch (English)

Assalam o alaikum [Name],

People in our community often have problems back home with land, inheritance, tax papers or documents. They do not know where to start, and many have been burned by agents.

Rasta is a small service that gives a straight answer. We explain the problem in plain English, say which office owns it, give a realistic cost and time, and track the case. We publish our prices. People pay one step at a time. We are not a law firm. When a client needs a lawyer, we connect them to an independent advocate who bills them directly.

We are looking for a few trusted people to introduce Rasta to friends and family who have these problems. If someone you introduce becomes a paying customer, you receive a fee.

You do not need to know the law. You do not give advice. You do not take money. You introduce, and we do the rest.

Would you like to hear the full terms?

## 2. The pitch (Urdu)

السلام علیکم [نام]،

ہماری کمیونٹی کے لوگوں کو پاکستان میں زمین، وراثت، ٹیکس کے کاغذات یا دستاویزات کے مسائل اکثر پیش آتے ہیں۔ انہیں پتا نہیں ہوتا کہ کہاں سے شروع کریں، اور بہت سے لوگ ایجنٹوں سے دھوکا کھا چکے ہیں۔

"راستہ" ایک چھوٹی سروس ہے جو سیدھا جواب دیتی ہے۔ ہم مسئلہ سادہ زبان میں سمجھاتے ہیں، بتاتے ہیں کہ کون سا دفتر ذمہ دار ہے، حقیقت پسندانہ خرچ اور وقت بتاتے ہیں، اور کیس کو ٹریک کرتے ہیں۔ ہماری قیمتیں ظاہر ہیں۔ لوگ ایک وقت میں ایک مرحلے کی ادائیگی کرتے ہیں۔ ہم لاء فرم نہیں ہیں۔ وکیل کی ضرورت ہو تو ہم آزاد وکیل سے ملاتے ہیں جو کلائنٹ کو براہ راست بل دیتا ہے۔

ہم چند قابل اعتماد لوگ ڈھونڈ رہے ہیں جو ایسے مسائل والے دوستوں اور رشتہ داروں کو "راستہ" سے متعارف کرائیں۔ آپ کا متعارف کرایا ہوا شخص ادائیگی کرے تو آپ کو فیس ملتی ہے۔

آپ کو قانون جاننے کی ضرورت نہیں۔ آپ مشورہ نہیں دیتے۔ رقم نہیں لیتے۔ آپ تعارف کراتے ہیں، باقی کام ہمارا ہے۔

کیا آپ مکمل شرائط سننا چاہیں گے؟

---

## 3. Terms (assumption)

| Item | Term |
|---|---|
| Fee | 10 percent of the referred client's first purchase of a Rasta product. Up to 15 percent for ambassadors with consistent referrals |
| What it applies to | Rasta's own fee only. Never government fees. Never any advocate's fee |
| When it is earned | After the client has paid in full and the Pathway Memo or errand has been delivered |
| Refunds | If the client is refunded, no fee is earned. If already paid, it is deducted from the next payout |
| Repeat purchases | No fee on repeat purchases or retainers unless we agree otherwise in writing (TODO: decide) |
| Payout | Monthly by bank transfer or Wise, for confirmed cases only (TODO: confirm payout method) |
| Tax | The ambassador is responsible for any tax on the fee in their own country |
| Who can be an ambassador | An adult community member. Not an advocate. Not anyone who would handle client money for Rasta |
| Ending | Either side can stop at any time by message. Fees already earned are paid |
| Written terms | A one-page agreement signed before the first referral (TODO: draft with an adviser) |

## 4. Do and do not

### Do

- Say you are an ambassador and that you receive a fee when someone you introduced pays. Say it before they ask.
- Share the price sheet. Prices are public.
- Say "I am not a lawyer. Rasta is not a law firm."
- Tell people the first step costs $15 and they pay one step at a time.
- Point people to the free official routes where they exist. Honesty builds trust.
- Ask permission before sharing someone's number or problem.
- Use the posts in `whatsapp-posts.md` as they are.
- Tell us right away if someone asks for something we should not do.

### Do not

- Do not promise any result or any date.
- Do not suggest that anything can be sped up or arranged outside the official process.
- Do not hint that anyone can influence an office or a court. Nothing about Rasta depends on that. It works through the official process.
- Do not give legal, tax or immigration advice.
- Do not collect money, documents, passwords or ID numbers from anyone.
- Do not share a client's story or details with anyone, even without a name.
- Do not post in a group without the admin's permission.
- Do not pay or offer anything to a lawyer for a referral.
- Do not use the Rasta name for anything not approved by us.

## 5. Referral code mechanics

1. **Code.** Each ambassador gets a short unique code (TODO: fix the format, for example `RS-` plus 4 letters). The code is stored on the ambassador record in the control panel.
2. **Link.** The ambassador shares `{{SITE_URL}}/start?ref=CODE`. The code carries no personal data.
3. **Capture.** The intake form fills the code from the link. The client can also type it. It is saved on the lead as `referralCode`.
4. **Conversion.** When a lead becomes a case, the code attaches the case to the ambassador.
5. **Payment trigger.** When the client's first payment clears and the memo or errand is delivered, the panel shows the fee due, using the ambassador's `commissionPct`.
6. **Payout.** Once a month, a founder pays the confirmed amounts and records them in the panel (`totalPaidUsd`).
7. **Disputes.** If two ambassadors claim one client, the first code recorded on the lead wins.
8. **Tracking.** The metrics page shows the share of cases from referrals. The 90-day gate needs at least 30 percent from earlier customers or referrals (assumption).

## 6. First conversation checklist

- Explain the service in two sentences.
- Share the price sheet.
- Explain the fee and the terms in plain words.
- Explain the do and do not list.
- Ask: which group or community would you introduce us to first?
- Ask: how do you want to be paid?
- Agree a first small action: introduce us to 3 people, not 30.

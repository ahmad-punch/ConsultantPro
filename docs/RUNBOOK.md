# Operating runbook (the 90-day test)

The plan is in `docs/BUSINESS-PLAN.md` Section 10. This is how to run it with the panel.

## Daily (15 minutes)
1. `/admin` dashboard: clear overdue next actions, reply to new leads within 4 working hours.
2. New lead: open it, WhatsApp the person, mark Contacted. If they buy, Convert to case, set product and price, send the payment link, record the payment when it lands.
3. Every stage change writes a note. Add a note whenever you talk to the client or a partner.

## Per case
- Intake -> Triage within 1 working day. Decide category, forum, severity. If it is a "make it go away through connections" request, set stage Declined and say why in a note.
- Memo drafting: write the Pathway Memo in a Google Doc in the client's shared folder; paste the link into `memoDocUrl`; Mark memo delivered. Target: median under 5 working days.
- Managed cases: pick a Partner (advocate) with `ownLetterhead = true`; the advocate bills the client directly; we record only our project fee.
- Close-out: ask the two questions (NPS 0-10, would you recommend) and record them. This feeds the gate.

## Weekly (founders, 45 minutes)
- `/admin/metrics`: read the six gate cards. Write the numbers into `docs/STATUS.md` under a "Week N" line.
- `/admin/channels`: post in every channel that is due; log the post.
- `/admin/content`: approve next week's posts from `marketing/`.
- `/admin/ambassadors`: pay what is due, log the payout.

## Gate (day 60 after first sale)
Go if all six cards are green. No-go rules are in the plan. Record the decision in `docs/decisions/`.

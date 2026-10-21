---
title: "Settings"
slug: "screens/settings"
summary: "Who is using the panel, who is on the team, and whether the site is set up."
audience: "everyone"
order: 220
---

# Settings

## Why this screen exists

The whole team signs in with one shared password. That keeps the setup simple, but it means the system does not know who is who. Settings fixes that in a light way. You choose your name for this browser, and from then on your name is written on every note and stage change you make.

Settings also holds the team list that feeds the "Case manager" drop-downs, and a read-only checklist that shows whether the site is configured for real use.

## What you see

**Acting as.** A short drop-down of active team members and a "Save" button. The sidebar shows the same thing at the bottom as "Acting as" followed by your name, and clicking it brings you here.

**Configuration.** A read-only list with a tick or a warning for each item: site name, site URL, WhatsApp number, contact email, legal entity, database, admin password and session secret. A warning means the value is missing or still a placeholder. These values come from environment variables and `src/lib/site.ts`, so you change them there and redeploy. You cannot change them on this screen. Secrets are never shown.

**Stripe payment links.** One row per product and retainer tier, with "Set" or "Not set". Until a link is set, the public buttons say "Pay on invoice".

**Team.** A table of name, role (Founder, Case manager, Operations), email, number of open cases and status.

## Buttons and actions

### Acting as

Pick your name in the drop-down and press the "Save" button next to it. Your choice is remembered in this browser for a year. It affects only who signs notes. It does not log you in as a separate user and it does not restrict anything.

### Add member

Opens a form for a new team member: Name, Role and Email. The save button is "Add team member". Add everyone who will use the panel or be assigned cases.

### Add team member

The submit button on the Add member form. It creates the person. They then appear in the Case manager lists and in "Acting as".

### Deactivate

Next to each active team member. After a confirmation question it marks the person inactive. They disappear from new assignment lists, but they stay on the cases they already worked on. Do this when someone leaves.

### Reactivate

Replaces Deactivate on an inactive person. It puts them back.

## How it connects to other screens

- **Cases.** Case managers come from the team list. Every note and stage change is signed with the "Acting as" name. If nobody is chosen, notes are signed "Control panel".
- **Leads.** The Convert to case form offers the team as case managers.
- **Dashboard.** Open actions show the case manager's name.
- **Public site.** The WhatsApp number and contact email set here (via environment variables) appear on the public site. The Stripe links decide whether pay buttons work.
- **Partners.** Outside professionals are not on this team list. They are under Partners.

## Common mistakes

- **Skipping "Acting as".** Notes will say "Control panel" and you lose track of who did what. Set it on every new browser or device.
- **Choosing someone else's name.** It is only a label, but it makes the history untrue.
- **Trying to edit configuration here.** It is read-only. Ask whoever manages deployment.
- **Deactivating a person who still has open cases.** They stay on those cases. Reassign the cases first in Case details.
- **Adding outside advocates as team members.** Use Partners.
- **Sharing the admin password outside the team.** Anyone with it can read client details. Change it when someone leaves.

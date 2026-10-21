---
title: "Channels"
slug: "screens/channels"
summary: "The groups, pages and associations where we post, and when each post is due."
audience: "everyone"
order: 170
---

# Channels

## Why this screen exists

Nobody buys from us until they have heard of us. The plan is to find customers in places where overseas Pakistanis already gather: WhatsApp groups, Facebook groups, associations and community centres. Each of those places is a channel.

A channel is useful only if we show up regularly and politely. This screen is the list of places, who runs them, how far we have got with each, and a reminder clock so no group goes quiet for months.

## What you see

**The list.** One row per channel with name, platform, country and admin contact, status, member count, ambassador, last post, and next due.

**Statuses.** Identified (we know it exists), Contacted (we asked the admin), Joined (we are in), Posted (we have posted), Paused (do not post for now).

**Cadence.** Each channel can have a "post every N days" setting. Next due is the last post date plus that many days. A channel with a cadence that has never been posted to is due now. A channel with no cadence is never due. A Paused channel is never due, whatever its cadence.

**Two views.** "All channels" and "Due to post". The second shows only overdue channels, the longest overdue first. This is your weekly to-do list.

**Filters.** Search by name, country or admin, and filter by status and platform.

## Buttons and actions

### New channel

Opens a form: Name, Platform, Status, Country, Members, Admin contact, Post every (days), Last posted, Ambassador and Notes. Only the name is essential. A suggested starting list is in `marketing/channels-template.csv`. There is no import button yet, so add channels one by one.

### Add channel

Saves the form and adds the channel to the list.

### Log post

On every row. It records that you have just posted in this channel. It sets "Last posted" to now and the status to Posted, which restarts the cadence clock. The button is highlighted when a post is overdue. It does not post anything for you. Make the post in the group first, then press this.

### Edit

A pencil button on each row. It opens the form with the details filled in. The save button is "Save channel". Use it to change the cadence, set a channel to Paused, link an ambassador, or fix the member count.

### All channels

The view toggle above the table. Shows every channel that matches the filters.

### Due to post

The other view. Shows only the channels whose next post date has passed.

## How it connects to other screens

- **Content.** The Content screen holds the posts themselves. Channels holds the places. They are separate: pressing Log post does not mark any content item as posted, and the reverse is also true.
- **Ambassadors.** A channel can be linked to the ambassador who covers it. It appears on their page.
- **Dashboard.** The "Channels due a post" quick link opens the Due to post view.
- **Metrics.** "Channel coverage" counts channels by platform and by status.

## Common mistakes

- **Pressing Log post without posting.** The group looks covered but nothing was sent.
- **Posting without pressing Log post.** The channel stays "due" and a colleague may post again the same day.
- **Not setting a cadence.** A channel with no cadence never appears in Due to post. Set one for every group you want to keep warm.
- **Posting in a group before the admin has agreed.** Moving a channel to Contacted and Joined first is a polite rule. Respect each group's own rules.
- **Posting case details in a group.** Never. We talk to each client privately.
- **Leaving dead groups on the list.** Set them to Paused so they stop appearing as overdue.

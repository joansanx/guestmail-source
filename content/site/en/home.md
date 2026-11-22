---
# The landing page (components/marketing/PagesSite.jsx) reads this file in a fixed shape: two paragraphs (the lead and
# the line about the price), then three sections in this order: what GuestMail gives (an h3 and one paragraph each),
# agents (one paragraph, the tools as a list, then the links on) and the plans (one paragraph, {{plans}}, the list of
# what every plan has). {{tokens}} are filled from the code: lib/marketing/content-render.js lists them.
# Every claim here is something the product does today.
title: "Email marketing for hotels and restaurants"
description: "GuestMail is email marketing for hotels and restaurants: a guest list with stays, campaigns from your Google reviews, and AI agents that run it."
slug: "home"
lang: en
date: 2026-11-21
updated: 2026-11-22
status: published
translationOf: "home"
faq:
  - q: "What is GuestMail?"
    a: "GuestMail is an email tool for hotels and restaurants. It keeps a guest list with stays and reservations, sends campaigns and newsletters, gives your website a signup form and a popup with your offer's code, and turns your Google Maps reviews into a campaign draft. Plans start at {{starter_price}} a month."
  - q: "How much does GuestMail cost?"
    a: "GuestMail starts at {{starter_price}} a month for {{starter_emails}} emails a month and up to {{starter_contacts}} active contacts, billed every 3 months, so {{starter_quarter}} a quarter. Every plan has every feature. Guests who unsubscribed, bounced or went dormant stay on your list and don't count."
  - q: "How does GuestMail decide which plan I need?"
    a: "Each GuestMail plan sets two numbers: the emails you can send in a month and the active contacts you can keep. Starter covers {{starter_emails}} emails and {{starter_contacts}} active contacts. Guests who unsubscribed, bounced or went dormant stay on your list without counting."
  - q: "How does GuestMail use my Google reviews?"
    a: "You connect your place on Google Maps once. GuestMail then reads your rating and the 5 reviews Google Maps finds most relevant, live, marks up to 3 worth quoting and drafts a campaign with them, each with its author and a link to the review. You read the draft and decide what goes out."
  - q: "Does GuestMail work with my PMS, booking engine or reservation system?"
    a: "GuestMail imports the CSV export of any of them: the guest, the dates of the stay or the reservation, the booking channel and the marketing consent. It also gives you a private URL that takes each new reservation as JSON, for a PMS, a booking engine or a tool like Zapier, Make or n8n to post to. It has no built-in connection to a specific PMS yet."
  - q: "How does GuestMail handle consent and unsubscribes?"
    a: "GuestMail asks you to confirm, on every import, that those people agreed to get your emails. New signups confirm by email before they join, on by default. Every email has an unsubscribe link that works in 1 click, and addresses that bounce or complain stop getting emails on their own."
  - q: "Can an AI agent run GuestMail?"
    a: "Yes. What the GuestMail dashboard does also works from an AI agent through its MCP server, with {{tool_count}} tools, and from code through its REST API: read your reputation, draft a campaign, import guests, schedule a send. Send and schedule actions are marked as irreversible and tell the agent to ask you first. Whether it asks is up to the AI client you use."
---

GuestMail is email marketing software for hotels and restaurants: a guest list with stays and reservations, newsletters, campaigns built from your Google reviews and a signup popup that hands out your direct-booking code. Your AI agent can run it too, through the same {{tool_count}} actions as the dashboard.

From {{starter_price}} a month for {{starter_emails}} emails, billed every quarter. {{sales_note}}

## What GuestMail gives a hotel or a restaurant

### Campaigns and scheduling

Write in an editor with images and buttons, check it on a phone, then send it or pick the day and the time.

### Reviews into campaigns

Connect your place on Google Maps. GuestMail reads the 5 reviews Google finds most relevant, marks up to 3 worth quoting and drafts the campaign, each quote with its author and a link.

### A popup with your offer

One line of code on your website. Visitors leave their email and get your code, the one your booking engine takes, or one per person.

### A guest list with stays

Each guest's page keeps their stays or reservations and the booking channel, next to what they opened and clicked. Segments, the API and your AI agent read them too.

### Segments

Guests who stayed in the last 90 days, guests who booked through Booking.com, guests who haven't come back in a year.

### Imports from your PMS

Drop the CSV export of your PMS or reservation system. Arrival, departure, booking channel and marketing consent are recognized on their own, and you map any column that isn't.

### Reservations as they happen

A private URL takes each new reservation as JSON from your PMS, your booking engine or a tool like Zapier, Make or n8n, and adds the guest with the stay.

### Automatic emails for hotels

Four emails that go out on their own once you turn them on: before arrival, after the stay, for a birthday and for guests who haven't stayed in 12 months. Each guest gets each one once.

### Your own domain

Send from your hotel's domain, with the DNS records to add and a check for each. Or start from a shared address.

### Deliverability built in

Double opt-in, one-click unsubscribe, bounce and complaint handling, and a list cleanup for guests who stopped opening.

### A web page for every campaign

Each campaign you send can also be a page on a site GuestMail hosts for you, on your own subdomain if you add one, which search engines find.

### Your team

Invite the people who write and send with you, each with their own sign-in.

## Your AI agent can run GuestMail

Connect GuestMail to ChatGPT, Claude or Grok Bot with your sign-in, or to Claude Code, Codex and Cursor with an API key. The agent works through the same {{tool_count}} actions as the dashboard, with the same checks and the same plan limits.

- `get_reputation` reads your rating and the reviews worth quoting
- `create_review_campaign` drafts a campaign from them
- `import_contacts` loads last month's guests from your PMS export
- `create_segment` saves who gets it, like guests who stayed in the last 90 days
- `schedule_campaign` sets it for Sunday morning
- `send_campaign` sends it, and tells the agent to ask you first

[What an AI agent can do with GuestMail](/agents) · [MCP setup](/docs/mcp) · [API reference](/docs/api)

## Every GuestMail feature, on every plan

Each plan sets the emails you can send in a month and the active contacts you can keep. Prices are per month and billed every quarter. Cancel anytime: your plan keeps working until the end of the quarter you paid for.

{{plans}}

- Campaigns
- Scheduling
- Segments
- Reviews from Google Maps
- Signup form and popup
- Welcome emails
- Imports
- Reservations connector
- Automatic emails for hotels
- Your own domain
- A web page for every campaign
- Stats
- Team
- AI agents and API

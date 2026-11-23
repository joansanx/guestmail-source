---
# The landing page (components/marketing/PagesSite.jsx) reads this file in a fixed shape: three paragraphs (the lead,
# the line about the price and the line that leads to the demos), then eight sections in this order. The demo: one
# paragraph, then an h3 and one paragraph per tab, in the order of DEMO_TABS (lib/marketing/landing-demo.js): ask, write,
# guests, reviews, automations, website. The templates: one paragraph over the gallery, one under it. The demos: one
# paragraph, then an h3 with each demo venue's name and one paragraph, in the order of DEMO_VENUES
# (lib/marketing/landing-templates.js), which has their addresses. What GuestMail gives: an h3 and one paragraph per card, in the order of FEATURE_VISUALS
# (components/marketing/DemoLanding.jsx): scheduling, popup, segments, imports, reservations, attributed bookings,
# domain, deliverability, team. Agents: one paragraph, a list of "**Assistant** does one thing: `tool`", then the paragraphs
# on. The plans: one paragraph, {{plans}}, the list of what every plan has. The last call: its paragraphs.
# {{tokens}} are filled from the code: lib/marketing/content-render.js lists them.
# Every claim here is something the product does today, and every tool named is in lib/actions/registry.js.
title: "Email marketing for hotels and restaurants"
description: "GuestMail is email marketing for hotels and restaurants: a guest list with stays, campaigns from your Google reviews, and AI agents that run it."
slug: "home"
lang: en
date: 2026-11-21
updated: 2026-11-23
status: published
translationOf: "home"
faq:
  - q: "What is GuestMail?"
    a: "GuestMail is an email tool for hotels and restaurants. It keeps a guest list with stays and reservations, sends campaigns and newsletters, runs automations from a signup or a new booking, gives your venue a website with a signup form and a popup with your offer's code, and turns your Google Maps reviews into a campaign draft. Plans start at {{starter_price}} a month. {{sales_note}}"
  - q: "How much does GuestMail cost?"
    a: "GuestMail starts at {{starter_price}} a month for {{starter_emails}} emails a month and up to {{starter_contacts}} active contacts, billed every 3 months, so {{starter_quarter}} a quarter. Every plan has every feature. Guests who unsubscribed, bounced or went dormant stay on your list and don't count. {{sales_note}}"
  - q: "How does GuestMail decide which plan I need?"
    a: "Each GuestMail plan sets two numbers: the emails you can send in a month and the active contacts you can keep. Starter covers {{starter_emails}} emails and {{starter_contacts}} active contacts. Guests who unsubscribed, bounced or went dormant stay on your list without counting."
  - q: "How does GuestMail use my Google reviews?"
    a: "You connect your place on Google Maps once. GuestMail then reads your rating and the 5 reviews Google Maps finds most relevant, live, marks up to 3 worth quoting and drafts a campaign with them, each with its author and a link to the review. You read the draft and decide what goes out."
  - q: "Does GuestMail work with my PMS, booking engine or reservation system?"
    a: "GuestMail imports the CSV export of any of them: the guest, the dates of the stay or the reservation, the booking channel and the marketing consent. It also gives you a private URL that takes each new reservation as JSON, for a PMS, a booking engine or a tool like Zapier, Make or n8n to post to. It has no built-in connection to a specific PMS yet."
  - q: "How does GuestMail handle consent and unsubscribes?"
    a: "GuestMail asks you to confirm, on every import, that those people agreed to get your emails. New signups confirm by email before they join, on by default. Every email has an unsubscribe link that works in 1 click, and addresses that bounce or complain stop getting emails on their own."
  - q: "Can an AI agent run GuestMail?"
    a: "Yes, with a plan. What the GuestMail dashboard does also works from an AI agent through its MCP server, with {{tool_count}} tools, and from code through its REST API: read your reputation, pick the guests, draft a campaign, import guests, schedule a send. Sending, scheduling and turning on an automation are marked as irreversible and tell the agent to ask you first. Whether it asks is up to the AI client you use."
---

Ask your AI agent for a campaign: it reads your reviews, picks the guests and leaves a draft for you to approve. GuestMail is email marketing for hotels and restaurants, with a guest list that keeps every stay, automations and a website with your offer.

From {{starter_price}} a month for {{starter_emails}} emails, billed every quarter. {{sales_note}}

Try a demo that works: subscribe to Hotel Brisa Lenta or Tres Higueras, two made-up venues, and get their welcome email.

## GuestMail at work

Everything you see here, your AI agent can do too. [See how](/agents)

### Ask your AI

Ask in plain words. Your agent reads your reviews, picks the guests, writes the draft and sends you a test. GuestMail tells it to ask you before it schedules or sends.

### Write

An editor with designs for hotels and restaurants: a header with your name, a banner, rows of photos and a button. See it on a phone, then send it or pick the day and the time. [Writing, in the help center](/help/writing#designs)

### Guests

Each guest's page keeps their stays and reservations, with the booking channel, the room, the guests and the amount, next to what they opened and the segments they're in. [Contacts, in the help center](/help/contacts#contact-page)

### Reviews

Connect your place on Google Maps. GuestMail reads the 5 reviews Google finds most relevant, marks up to 3 worth quoting and drafts the campaign, each quote with its author and a link.

### Automations

Draw the path a guest takes: what starts it, like a signup, a tag, a click or a new booking from the connector, then emails, waits and a condition with a yes and a no branch. Start from a template, or let your agent build it with `create_automation` and turn it on with `turn_on_automation`.

### Website

Your venue gets its own website on GuestMail, with your offer, a signup form and a page for every campaign you send, which search engines can find. [Website, in the help center](/help/website)

## GuestMail email templates for hotels and restaurants

Pick a design and fill in your words. Each one opens in the editor as a draft, with photos you can swap.

Hotel Brisa Lenta and Tres Higueras are made-up venues, there to show the templates, and their prices and dates are examples.

## Try GuestMail as a guest

Subscribe and you'll get their welcome email, like any guest who signs up on their website. They're made-up venues GuestMail uses as demos, and that email is the only one they send. The demos are in Spanish.

### Hotel Brisa Lenta

A hotel on the Mediterranean coast.

### Tres Higueras

A restaurant with seasonal cooking.

## What GuestMail gives a hotel or a restaurant

### Scheduling

Pick the day, the time and who gets it, everyone or a segment. The campaign goes out on its own. [Sending, in the help center](/help/sending#when)

### A popup with your offer

One line of code on your website. Visitors leave their email and get your code, the one your booking engine takes, or one per person.

### Segments

Guests who stayed in the last 90 days, who booked through Booking.com, or who haven't come back in a year, with the count as you build it. [Segments, in the help center](/help/contacts#segments)

### Imports from your PMS

Drop the CSV export of your PMS or reservation system. Arrival, departure, booking channel and marketing consent are recognized on their own, and you map any column that isn't. [Importing, in the help center](/help/importing-contacts)

### Reservations as they happen

A private URL takes each new reservation as JSON from your PMS, your booking engine or a tool like Zapier, Make or n8n, and adds the guest with the stay.

### Bookings each campaign brought

When your stays carry their booking date, each sent campaign shows the bookings guests made within {{click_window_days}} days of clicking a link in it, with their amount. [Attributed bookings, in the help center](/help/sending#attributed)

### Your own domain

Send from your hotel's domain, with the DNS records to add and a check for each. Or start from a shared address. [Domains, in the help center](/help/sender-addresses#own-domain)

### Deliverability built in

Double opt-in, one-click unsubscribe, bounce and complaint handling, and a list cleanup for guests who stopped opening. [Deliverability, in the help center](/help/deliverability)

### Your team

Invite the people who write and send with you, each with their own sign-in, as an admin or a member. [Team members, in the help center](/help/team)

## Your AI agent can do everything you can in GuestMail

Connect GuestMail to ChatGPT, Claude or Grok Bot with your GuestMail account, or to Claude Code, Codex and Cursor with an API key. In ChatGPT, that's on Business, Enterprise and Edu workspaces. The agent works through the same {{tool_count}} actions as the dashboard, with the same checks and the same plan limits.

- **ChatGPT** reads your Google reviews: `get_reputation`
- **Claude** finds the guests who stayed in the last 6 months: `create_segment`
- **Grok Bot** drafts a campaign with your best reviews: `create_review_campaign`
- **Claude Code** schedules it for Sunday morning, once you say yes: `schedule_campaign`
- **Codex** tells you how it did: `get_campaign_report`
- **Cursor** loads last month's guests from your PMS export: `import_contacts`

Sending and scheduling are marked as irreversible, and GuestMail tells your agent to ask you first. Whether it asks is up to the AI client you use.

[What an AI agent can do with GuestMail](/agents) · [MCP setup](/docs/mcp) · [API reference](/docs/api)

## Every GuestMail feature, on every plan

Each plan sets the emails you can send in a month and the active contacts you can keep. Prices are per month and billed every quarter. Cancel anytime: your plan keeps working until the end of the quarter you paid for. {{sales_note}}

{{plans}}

- Campaigns
- Scheduling
- Segments
- Reviews from Google Maps
- Signup form and popup
- Welcome emails
- Imports
- Reservations connector
- Automations
- Attributed bookings
- Your own domain
- A website for your venue
- Stats
- Team
- AI agents and API

## Bring your guest list to GuestMail

Sign up, connect your place on Google Maps and write your first draft. With a plan, import your PMS export or connect your reservations and ask your agent for the first campaign.

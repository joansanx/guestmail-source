---
# The pricing page (components/marketing/PagesSite.jsx) draws what's before the first h2 around its table of plans
# (the paragraphs, {{plans}}, the list of what every plan has), then each h2 as a section of plain words.
# Every number comes from the code (lib/plans.js and the help center's plans article): {{tokens}} where the page can.
title: "GuestMail pricing: every feature on every plan"
description: "GuestMail costs from {{starter_price}} a month for {{starter_emails}} emails, billed every quarter. Every plan has every feature, AI agents and the API included."
slug: "pricing"
lang: en
date: 2026-11-21
updated: 2026-11-22
status: published
translationOf: "pricing"
faq:
  - q: "How does GuestMail bill: monthly, quarterly or yearly?"
    a: "GuestMail bills every 3 months, in advance, through Stripe. The prices on its pricing page are per month, so the Starter plan at {{starter_price}} a month is {{starter_quarter}} a quarter. Monthly and yearly billing are not on sale."
  - q: "Does GuestMail have a free plan or a free trial?"
    a: "No. GuestMail has no free plan and no free trial. Without a plan you can set up your venue, write and preview drafts, and add {{trial_contacts}} contacts a day by hand. Sending, imports, your own domain, API keys and AI assistants need a plan. {{sales_note}}"
  - q: "Which contacts count toward a GuestMail plan?"
    a: "Only active contacts count toward a GuestMail plan: people who get your campaigns. Contacts who haven't confirmed yet, dormant contacts and those who unsubscribed, bounced or complained stay on your list and don't count. Starter covers up to {{starter_contacts}} active contacts."
  - q: "What happens when I use up my GuestMail plan's emails?"
    a: "A send that needs more emails than your GuestMail plan has left this month waits until you upgrade or until your next month starts. Signups keep working and confirmation emails still go out. The count of {{starter_emails}} emails on Starter starts over every month, on the day your plan started."
  - q: "Are AI agents and the API included in every GuestMail plan?"
    a: "Yes. Every GuestMail plan includes the MCP server, with {{tool_count}} tools for an AI agent, and the REST API, at no extra cost. They need a paid plan to work, like sending does. Each API key gets {{requests_per_minute}} requests a minute."
  - q: "Can I cancel GuestMail at any time?"
    a: "Yes. You cancel GuestMail from your billing page, and the plan keeps working until the end of the 3 months you paid for. After that sending stops, and your list, your campaigns and your settings are kept for when you come back. Partial quarters are not refunded."
  - q: "In what currency does GuestMail charge?"
    a: "GuestMail charges in US dollars, through Stripe, every 3 months. Stripe shows the amount before you confirm, and GuestMail never sees or stores your card number."
---

GuestMail costs from {{starter_price}} a month for {{starter_emails}} emails and up to {{starter_contacts}} active contacts, billed every quarter. Each plan sets those two numbers, and every plan has every feature, AI agents and the API included.

Prices are per month, in US dollars, and paid 3 months at a time. Cancel anytime: your plan keeps working until the end of the quarter you paid for. {{sales_note}}

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

## How GuestMail counts emails and contacts

An email is every email GuestMail sends for you: campaigns, test emails, welcome and confirmation emails, and the last-chance email of the list cleanup. A campaign sent to 1,000 guests is 1,000 emails. The count starts over every month, on the day your plan started.

An active contact is someone who gets your campaigns. People who haven't confirmed yet, dormant contacts and those who unsubscribed, bounced or complained stay on your list and don't count.

## What happens at the limit of a GuestMail plan

Signups keep working, and confirmation emails still go out. A send that needs more emails than you have left this month waits until you upgrade or your next month starts. With more active contacts than your plan allows, sending waits until you upgrade.

## AI agents are part of every GuestMail plan

There is no add-on for AI. Every plan includes the MCP server, with {{tool_count}} tools, and the REST API, so ChatGPT, Claude, Grok Bot, Claude Code, Codex or Cursor can draft, schedule and report for you. They need a paid plan, like sending does.

[What an AI agent can do with GuestMail](/agents)

## Changing or canceling a GuestMail plan

Change your plan from the billing page at any time: Stripe shows what you'll pay before you confirm. An upgrade is charged at once for the rest of the period, and a downgrade starts at the end of the period you already paid.

When you cancel, your plan runs until the end of the quarter you paid for. Then sending stops, and your list, your campaigns and your settings are kept for when you come back. Partial quarters aren't refunded, and there is no free trial.

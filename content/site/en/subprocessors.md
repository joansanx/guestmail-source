---
# A draft for a lawyer to review before it is relied on. The table is {{providers}}: PROVIDERS in
# lib/marketing/legal.js, the one list for this page, the privacy policy and the data processing agreement.
# For the lawyer and for whoever deploys: check each row against what production runs, and Upstash's region.
# The description must not name an email provider (tests/public-site.test.mjs): the table does.
title: "Subprocessors"
description: "The companies that help GuestMail process personal data, what each one handles and where, with what goes to the AI model and how changes are told."
slug: "subprocessors"
lang: en
date: 2026-11-22
updated: 2026-11-23
status: published
translationOf: "subprocessors"
---

GuestMail's subprocessors are the companies that handle personal data for it: hosting, email delivery, payments and the content check. This page lists each one, what it handles and where it is. It is part of the [data processing agreement](/dpa).

## Who processes data for GuestMail

{{providers}}

## Subprocessors of GuestMail outside the European Economic Area

Transfers to providers in the United States rely on the EU-US Data Privacy Framework or on the standard contractual clauses approved by the European Commission.

The automated check and the content agent use Google's Gemini model through OpenRouter. What reaches them is the subject, the sender name and the text of your campaigns, and your brief. Email addresses and phone numbers in a campaign's text are replaced by placeholders before it leaves. OpenRouter only sends it to providers that don't collect it to store it or to train their models. Neither receives your contacts, any guest data or the names of your authors.

## What no GuestMail subprocessor receives

- GuestMail never sends your contact lists to a provider of AI. An AI assistant you connect yourself reads what you let it read, under its own provider's terms.
- Google receives the name or the ID of your venue to read its reviews, never a contact.
- Stripe handles your payment. GuestMail never sees or stores your card number.

## How GuestMail tells you about a change

GuestMail tells you by email before adding or replacing a subprocessor. If you object, you can close your account and export your contacts first. For any question, write to {{support_email}}.

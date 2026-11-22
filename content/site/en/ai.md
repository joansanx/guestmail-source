---
# A draft for a lawyer to review before it is relied on. Where the content check sends its text, and what it strips
# first, is lib/content-review.js: change this page in the same change as that file.
title: "How GuestMail uses AI"
description: "Where GuestMail uses AI, where it does not, what the content check sends to its model, and what your own AI assistant can do through the MCP server."
slug: "ai"
lang: en
date: 2026-11-21
updated: 2026-11-22
status: published
translationOf: "ai"
---

This page says plainly where GuestMail uses artificial intelligence, where it does not, and what an AI assistant you connect can do with your account.

## Where GuestMail uses AI: the content check

Before a campaign goes out, an automated check can read its subject, its sender name and its content to look for phishing, malware, scams and explicit content. The check runs on DeepSeek's models, reached through its API, with servers in China, a country without an adequacy decision of the European Commission. Email addresses and phone numbers in the text are replaced by placeholders before it leaves. The check never receives your contacts, any guest data or the names of your authors.

The check does not refuse a campaign on its own. When one looks clearly harmful it waits, and a person at GuestMail decides whether it is sent as you wrote it. The check can be wrong in both directions. If you think it held a campaign by mistake, write to {{support_email}}.

The check is part of how GuestMail protects every sender's reputation, so it cannot be switched off for one account.

## Your own AI assistant and GuestMail

GuestMail has an MCP server and a REST API. With them you can connect an AI assistant of your choice and let it work with your account: read your contacts, write campaigns, and send them. GuestMail does not choose, run or supervise that assistant. [What an AI agent can do with GuestMail](/agents) has the tools, the clients and the setup.

- The assistant works inside your account only, with the access you gave it.
- What it does is done in your name. Read what it writes before you let it send.
- You can revoke an API key or disconnect an app from your settings at any time.
- What your assistant does with the data it reads is covered by the terms of the company that provides it, not by GuestMail.

## Where GuestMail does not use AI

- Choosing which Google reviews to suggest for a campaign follows fixed rules, such as its rating, its date and what it talks about. No model is involved.
- Segments, plan limits and list cleanup follow rules you can read in the help center.
- GuestMail makes no automated decision about your guests that has legal effects on them.

## Your data and AI models

- GuestMail does not train AI models with your content or your contacts.
- GuestMail does not sell your data or your guests' data.
- The text sent to the content check and to the agent carries no contacts, no guest data and no author names.

## Your rights over GuestMail's use of AI

You can ask what the content check concluded about one of your campaigns and ask a person to review it. For anything about personal data, see the [privacy policy](/privacy).

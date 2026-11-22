---
# A draft for a lawyer to review before it is relied on. Checked against the code on 2026-11-22: the session cookie is
# Better Auth's (lib/auth.js, 7 days by its default), and the other four are lib/newsletters.js (NEWSLETTER_COOKIE),
# lib/sidebar.js (SIDEBAR_COOKIE), lib/time-zone.js (TIME_ZONE_COOKIE) and lib/i18n/locale.js (LOCALE_COOKIE, only set when
# a language is picked in the account menu), a year each. tests/site-content.test.mjs fails if one of those names changes
# and this page doesn't.
# To check on the live site before it is relied on: the cookies Cloudflare sets, and Better Auth's short-lived ones.
title: "Cookie policy"
description: "The cookies GuestMail sets: one that keeps you signed in and four that remember how you use the dashboard. No advertising and no analytics cookies."
slug: "cookies"
lang: en
date: 2026-11-22
updated: 2026-11-22
status: published
translationOf: "cookies"
---

GuestMail sets 5 cookies of its own, all in the dashboard: one that keeps you signed in and four that remember how you use it. It sets no advertising cookies and no analytics cookies, on this site or in the dashboard.

## The cookies GuestMail sets

| Cookie | What it is for | How long it lasts |
| --- | --- | --- |
| `better-auth.session_token` | Keeps you signed in. On a secure connection its name starts with `__Secure-` | 7 days, renewed while you use GuestMail |
| `newsletter` | Remembers which of your venues the dashboard has open | 1 year |
| `sidebar` | Remembers whether you collapsed the dashboard's menu | 1 year |
| `tz` | Keeps your browser's time zone, to show dates and times in your local time | 1 year |
| `locale` | Remembers the dashboard's language, only if you pick one in your account menu | 1 year |

While you sign in or connect an app, the sign-in system can set other short-lived cookies whose names start with `better-auth`, to finish that step.

## What GuestMail keeps in your browser without cookies

Your choice of light or dark theme, and the import notices you dismissed, are kept in your browser's local storage. They never leave your browser.

## How GuestMail counts visits to this site

Visits to theguestmail.com are counted without cookies, which is why the site shows no cookie banner.

## Cookies from other companies

- When you pay, you leave GuestMail for Stripe's own page, where Stripe sets the cookies it needs to take the payment.
- Cloudflare, which protects GuestMail from attacks, can set a security cookie of its own, such as `__cf_bm` or `cf_clearance`, when it checks that a visit is not automated.

## The emails and the websites of GuestMail's customers

An email sent with GuestMail can carry a small image and tracked links to count opens and clicks. Those are not cookies, and the [privacy policy](/privacy) covers them. A website a hotel or a restaurant runs on GuestMail remembers in your browser's local storage that you subscribed or closed its popup. What else it uses, such as its own analytics, is that venue's choice.

## How to remove GuestMail's cookies

You can delete or block cookies in your browser's settings. Without the session cookie you are signed out, and without the other four the dashboard forgets your venue, your menu, your time zone and your language until you choose them again.

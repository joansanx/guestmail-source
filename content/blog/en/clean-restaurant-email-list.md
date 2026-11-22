---
title: "How a restaurant cleans its email list without deleting guests"
description: "Why mailing guests who never open hurts delivery, the spam rate Gmail sets as a limit, and how a restaurant retires dormant contacts without deleting them."
slug: clean-restaurant-email-list
lang: en
date: 2026-11-22
updated: 2026-11-22
status: published
faq:
  - q: "When does a restaurant contact become dormant in GuestMail?"
    a: "A contact becomes cold after 6 ignored issues in a row and 180 days without a sign of life, and becomes dormant at your first send 14 days or more after the last-chance email if they did not click. Opens, clicks, signing up again and the confirmation click restart the count. Dormant contacts stay on the list and do not count toward the plan's subscribers."
  - q: "What spam rate does Gmail ask a restaurant sender to stay under?"
    a: "Google's Email sender guidelines ask senders to keep spam rates reported in Postmaster Tools below 0.3%. The Email sender guidelines FAQ recommends staying below 0.1% and preventing the rate from reaching 0.3% or higher, and says rates above 0.1% already hurt inbox delivery for bulk senders. Spam rate is calculated daily in Postmaster Tools."
  - q: "Does deleting restaurant contacts remove them from the GuestMail list for good?"
    a: "Delete contact removes them with their dates and engagement and cannot be undone. For someone who unsubscribed, bounced or complained, GuestMail keeps a scrambled trace of the address, so adding it again never emails it. Anyone else can be added again like a new contact. Marking a contact dormant instead stops issues without unsubscribing them."
  - q: "How many ignored issues can a restaurant set before a contact counts as cold?"
    a: "In the List cleanup section of the newsletter's settings you can set 2 to 100 ignored issues, counting from the first issue GuestMail sent them, and 30 to 3650 quiet days. The default is 6 ignored issues in a row and 180 days without a sign of life. A weekly newsletter can go lower on days."
  - q: "When does GuestMail pause a restaurant campaign over spam complaints?"
    a: "A campaign pauses by itself when more than 0.08% of its emails are marked as spam, with at least 2, or when more than 2.5% hard bounce (at least 5) or Gmail refuses more than 2% of them (at least 10). Emails already sent stay sent, and you can resume the campaign from its page to send the rest."
  - q: "What does a restaurant need to check before importing an old guest list?"
    a: "GuestMail asks you to confirm, on every import, that those people agreed to get your emails. The deliverability help suggests importing an old list as dormant and marking the readers you know as active. Google's Email sender guidelines say not to purchase email addresses and not to send to people who did not sign up."
  - q: "How many messages a day make a restaurant a bulk sender for Gmail?"
    a: "Google's Email sender guidelines FAQ defines a bulk sender as any sender that sends close to 5,000 messages or more to personal Gmail accounts within a 24-hour period, counting all messages from the same primary domain. Senders who meet that at least once are permanently considered bulk senders, and bulk status does not expire."
  - q: "What does the GuestMail last-chance email ask a restaurant's guests?"
    a: "It asks whether they still want your newsletter and follows its name. It carries a button, \"Yes, keep sending it\" until you write your own, and clicking it puts the contact back in your list as before. You can write your own subject, preview text and content in the same editor as your issues, but you keep its button."
sources:
  - title: "List cleanup · GuestMail help"
    url: "https://theguestmail.com/help/list-cleanup"
    checked: 2026-11-22
  - title: "Bounces, complaints and pauses · GuestMail help"
    url: "https://theguestmail.com/help/deliverability"
    checked: 2026-11-22
  - title: "Contacts · GuestMail help"
    url: "https://theguestmail.com/help/contacts"
    checked: 2026-11-22
  - title: "Email sender guidelines - Gmail Help"
    url: "https://support.google.com/a/answer/81126?hl=en"
    checked: 2026-11-22
  - title: "Email sender guidelines FAQ - Gmail Help"
    url: "https://support.google.com/a/answer/14229414?hl=en"
    checked: 2026-11-22
translationOf: limpiar-lista-correo-restaurante
---

This is for the people who run or market a restaurant and keep an email list of guests. After reading, you will know how to retire contacts who stopped opening without deleting them, and which checks to run before the next send.

> **Quick answer.** Cleaning an email list means stopping sends to contacts who no longer engage, and it can be done without deleting anyone: in GuestMail, contacts who ignore 6 issues in a row and stay quiet for 180 days get a last-chance email, and those who do not answer become dormant, staying on the list and out of the subscriber count. Google asks senders to keep the spam rate reported in Postmaster Tools below 0.3%, and its FAQ recommends keeping it under 0.1%, as the [Email sender guidelines FAQ](https://support.google.com/a/answer/14229414?hl=en) states.

## Key points

- A contact counts as cold in GuestMail after 6 ignored issues in a row and 180 days without a sign of life.
- Dormant contacts are never unsubscribed or deleted, and they do not count toward the plan's subscribers.
- Google asks senders to keep the spam rate reported in Postmaster Tools below 0.3%.
- Google's FAQ recommends keeping the user-reported spam rate below 0.1% and preventing it from reaching 0.3%.
- GuestMail pauses a campaign by itself when more than 0.08% of its emails are marked as spam, with at least 2.

## Why mailing guests who never open hurts delivery

A list full of readers who ignore your emails pushes your issues toward spam for everyone else, as the [list cleanup help](/help/list-cleanup) explains. The same page notes that those contacts also count toward your plan's subscribers.

Google states the same direction from the inbox side. Its [Email sender guidelines](https://support.google.com/a/answer/81126?hl=en) say that if messages from your domain are frequently reported as spam, future messages are more likely to be marked as spam, and that user spam reports can lower your domain's reputation over time. The same page recommends periodically sending messages to confirm that recipients want to stay subscribed, and considering unsubscribing recipients who do not open or read your messages.

A restaurant list often grows from reservations and signups, so it can hold many addresses that were useful once and have gone quiet since.

## What spam rate does Gmail set as the limit?

Google's [Email sender guidelines](https://support.google.com/a/answer/81126?hl=en) ask all senders who email Gmail accounts to keep spam rates reported in Postmaster Tools below 0.3%. The [Email sender guidelines FAQ](https://support.google.com/a/answer/14229414?hl=en) goes further: senders should keep their user-reported spam rate below 0.1% and prevent it from ever reaching 0.3% or higher. The FAQ adds that rates above 0.1% already have a negative impact on inbox delivery for bulk senders, and that from June 2024 bulk senders with a spam rate above 0.3% are ineligible for mitigation.

The FAQ defines a bulk sender as any sender that sends close to 5,000 messages or more to personal Gmail accounts within a 24-hour period, counting all messages from the same primary domain. Senders who meet that at least once are permanently considered bulk senders.

GuestMail applies its own thresholds to a send, as the [deliverability help](/help/deliverability) describes: a campaign pauses by itself when more than 0.08% of its emails are marked as spam, with at least 2, and the whole account is blocked past 0.3% complaints, with at least 3.

## How does a restaurant retire dormant contacts without deleting them?

In GuestMail, the list cleanup does this on its own, and the [list cleanup help](/help/list-cleanup) describes the sequence:

1. Cold contacts get a last-chance email instead of the issue. A contact is cold after 6 ignored issues in a row and 180 days without a sign of life. Opens, clicks, signing up again and the confirmation click are signs of life, and any of them starts the count over.
2. The last-chance email carries a button, "Yes, keep sending it" until you write your own. Clicking it puts the contact back in your list as before.
3. Until they answer, they get no issues. At your first send 14 days or more after the last-chance email, those who did not click become dormant.
4. Dormant contacts stay in your list: they are never unsubscribed or deleted, and they do not count toward your plan's subscribers.

The same page says list cleanup is on for new newsletters, and that in the List cleanup section of the newsletter's settings you can turn it off or change when a contact counts as cold: 2 to 100 ignored issues, counting from the first issue GuestMail sent them, and 30 to 3650 quiet days.

To bring one contact back, the [contacts help](/help/contacts) says Mark as active brings back a dormant contact, who then gets your next issue. To do it in bulk, select the contacts and use Status in the bar at the bottom of the screen: only dormant contacts become active there, and only active ones go dormant. Changing a status is for the newsletter's admins. The same page notes that Mark as dormant stops issues to an active contact without unsubscribing them.

## What can a restaurant do before the next send?

The [list cleanup help](/help/list-cleanup) says that when you send now, the send step counts what the cleanup will do: how many get the issue, how many get the last-chance email instead, how many are still waiting to answer one and how many become dormant. A scheduled issue runs the cleanup when it goes out, and the campaign's report then shows the last-chance emails apart from the issue.

The [deliverability help](/help/deliverability) lists what keeps bounces and complaints low: email only people who signed up for your newsletter and never a bought or scraped list, keep confirmed opt-in on, keep list cleanup on, and before importing an old list, import it as dormant and mark the readers you know as active. It also suggests sending from your own domain with a DMARC record and sending regularly.

Google's [Email sender guidelines](https://support.google.com/a/answer/81126?hl=en) require SPF or DKIM authentication for all senders, and for senders of 5,000 or more messages a day to Gmail accounts, SPF, DKIM and DMARC, with marketing messages supporting one-click unsubscribe. The [FAQ](https://support.google.com/a/answer/14229414?hl=en) recommends honoring unsubscribe requests within 48 hours. Which of these apply to a single restaurant depends on its volume and its sending setup, so check your own numbers and your provider's records before the next send.

## How does GuestMail handle bounces and complaints on a restaurant list?

The [deliverability help](/help/deliverability) describes the outcomes. A hard bounce means the address does not exist or cannot receive email: the contact becomes bounced, never gets another email, and GuestMail remembers the address for every sender for 180 days. A soft bounce, like a full mailbox, is temporary and changes nothing.

When a reader marks your email as spam, the contact becomes complained and never gets another email. Gmail only reports a spam rate for each sending domain, without naming anyone.

A campaign pauses by itself when more than 2.5% of its emails hard bounce (at least 5), more than 0.08% are marked as spam (at least 2) or Gmail refuses more than 2% of them (at least 10). Emails already sent stay sent, and you can resume the campaign from its page. Past 5% hard bounces (at least 10) or 0.3% complaints (at least 3), the whole account is blocked.

The [contacts help](/help/contacts) adds that bounced and complained contacts keep their status, and that no email goes out when you change a status.

## How this article was checked

The figures and requirements in this article were read on November 22, 2026 in the linked sources. What GuestMail does was checked the same day against its public documentation. The text was drafted with AI assistance from those sources. It passed an independent editorial review before publication.

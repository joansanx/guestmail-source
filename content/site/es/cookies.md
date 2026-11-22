---
# Borrador para que lo revise un abogado antes de darlo por bueno. Comprobado contra el código el 2026-11-22: la cookie
# de sesión es la de Better Auth (lib/auth.js, 7 días por defecto), y las otras cuatro son lib/newsletters.js
# (NEWSLETTER_COOKIE), lib/sidebar.js (SIDEBAR_COOKIE), lib/time-zone.js (TIME_ZONE_COOKIE) y lib/i18n/locale.js
# (LOCALE_COOKIE, que solo se pone al elegir idioma en el menú de la cuenta), de un año cada una.
# tests/site-content.test.mjs falla si uno de esos nombres cambia y esta página no.
# Por comprobar en la web publicada antes de darlo por bueno: las cookies que pone Cloudflare y las breves de Better Auth.
title: "Política de cookies"
description: "Las cookies que pone GuestMail: una que mantiene tu sesión y cuatro que recuerdan cómo usas el panel. Sin cookies publicitarias ni de analítica."
slug: "cookies"
lang: es
date: 2026-11-22
updated: 2026-11-22
status: published
translationOf: "cookies"
---

GuestMail pone 5 cookies propias, todas en el panel: una que mantiene tu sesión iniciada y cuatro que recuerdan cómo lo usas. No pone cookies publicitarias ni de analítica, ni en este sitio ni en el panel.

## Las cookies que pone GuestMail

| Cookie | Para qué sirve | Cuánto dura |
| --- | --- | --- |
| `better-auth.session_token` | Mantiene tu sesión iniciada. En una conexión segura su nombre empieza por `__Secure-` | 7 días, y se renueva mientras usas GuestMail |
| `newsletter` | Recuerda cuál de tus establecimientos tiene abierto el panel | 1 año |
| `sidebar` | Recuerda si plegaste el menú del panel | 1 año |
| `tz` | Guarda la zona horaria de tu navegador, para enseñar fechas y horas en tu hora local | 1 año |
| `locale` | Recuerda el idioma del panel, solo si lo eliges en el menú de tu cuenta | 1 año |

Mientras inicias sesión o conectas una aplicación, el sistema de acceso puede poner otras cookies de corta duración cuyo nombre empieza por `better-auth`, para completar ese paso.

## Qué guarda GuestMail en tu navegador sin cookies

Tu elección de tema claro u oscuro y los avisos de importación que cerraste se guardan en el almacenamiento local de tu navegador. Nunca salen de él.

## Cómo cuenta GuestMail las visitas a este sitio

Las visitas a theguestmail.com se cuentan sin cookies, y por eso el sitio no enseña un aviso de cookies.

## Cookies de otras empresas

- Cuando pagas, sales de GuestMail hacia la página de Stripe, donde Stripe pone las cookies que necesita para cobrar.
- Cloudflare, que protege a GuestMail de ataques, puede poner una cookie de seguridad propia, como `__cf_bm` o `cf_clearance`, cuando comprueba que una visita no es automática.

## Los emails y las webs de los clientes de GuestMail

Un email enviado con GuestMail puede llevar una imagen pequeña y enlaces con seguimiento para contar aperturas y clics. No son cookies, y los cubre la [política de privacidad](/es/privacy). Una web que un hotel o un restaurante tiene en GuestMail recuerda en el almacenamiento local de tu navegador que te apuntaste o que cerraste su popup. Lo demás que use, como su propia analítica, lo decide ese establecimiento.

## Cómo quitar las cookies de GuestMail

Puedes borrar o bloquear las cookies en los ajustes de tu navegador. Sin la cookie de sesión se cierra tu sesión, y sin las otras cuatro el panel olvida tu establecimiento, tu menú, tu zona horaria y tu idioma hasta que los elijas otra vez.

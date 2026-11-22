---
# Borrador para que lo revise un abogado antes de darlo por bueno. Cubre el artículo 10 de la LSSI: titular, NIF,
# domicilio y una forma de contacto. Esos datos salen del entorno (LEGAL_NAME, LEGAL_ADDRESS, LEGAL_TAX_ID) con los
# tokens {{legal_*}}: nunca se escriben aquí.
# Para el abogado: si el titular es una sociedad inscrita en el Registro Mercantil, sus datos registrales también van
# aquí (art. 10.1.b) y necesitarían una variable propia. Si basta un email como contacto lo decide él.
title: "Aviso legal"
description: "Quién presta GuestMail y theguestmail.com: nombre del titular, NIF, domicilio y contacto, con la ley aplicable y dónde están sus condiciones."
slug: "legal-notice"
lang: es
date: 2026-11-22
updated: 2026-11-22
status: published
translationOf: "legal-notice"
---

Este aviso legal identifica a quien presta theguestmail.com y el servicio GuestMail, como pide el artículo 10 de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI).

## Quién presta GuestMail

- Titular: {{legal_name}}
- NIF: {{legal_tax_id}}
- Domicilio: {{legal_address}}
- Contacto: {{support_email}}

## Qué ofrece GuestMail

GuestMail es un software de email marketing para hoteles y restaurantes, que se ofrece en theguestmail.com a empresas y profesionales. No se ofrece a consumidores.

## Los precios de GuestMail

Los precios de los planes de GuestMail están en la [página de precios](/es/pricing), en dólares estadounidenses. No incluyen impuestos, que se añaden donde la ley lo exige.

## Condiciones que se aplican a GuestMail

- Los [términos del servicio](/es/terms) son el contrato para usar GuestMail.
- La [política de privacidad](/es/privacy) dice qué datos personales trata GuestMail y para qué.
- El [contrato de encargo del tratamiento](/es/dpa) cubre los datos de tus huéspedes y clientes.
- La página de [subencargados](/es/subprocessors) lista quién ayuda a GuestMail a tratar datos.
- La [política de cookies](/es/cookies) lista las cookies que pone GuestMail.
- La [política de uso aceptable](/es/acceptable-use) dice qué se puede enviar con GuestMail.
- [Cómo usa GuestMail la IA](/es/ai) dice dónde usa la IA y dónde no.

## El software de GuestMail

GuestMail está construido sobre MailCheap, software libre bajo la licencia GNU Affero General Public License, versión 3. El código fuente de la versión que ejecuta este servicio está en <{{source_url}}> bajo la misma licencia. Lo que un cliente guarda en GuestMail, como sus contactos y sus campañas, es suyo.

## Ley y tribunales

Este sitio y el servicio GuestMail se rigen por la ley española. Cualquier disputa corresponde a los juzgados y tribunales de Barcelona, España.

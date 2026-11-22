---
# Borrador para que lo revise un abogado antes de darlo por bueno. A dónde envía su texto la revisión de contenido, y
# qué le quita antes, está en lib/content-review.js: esta página se cambia en el mismo cambio que ese fichero.
title: "Cómo usa GuestMail la IA"
description: "Dónde usa GuestMail la IA, dónde no, qué envía a su modelo la revisión de contenido y qué puede hacer tu propio asistente de IA por el servidor MCP."
slug: "ai"
lang: es
date: 2026-11-22
updated: 2026-11-22
status: published
translationOf: "ai"
---

Esta página dice con claridad dónde usa GuestMail la inteligencia artificial, dónde no, y qué puede hacer con tu cuenta un asistente de IA que conectes.

## Dónde usa GuestMail la IA: la revisión de contenido

Antes de que salga una campaña, una revisión automática puede leer su asunto, su nombre de remitente y su contenido para buscar phishing, malware, estafas y contenido explícito. La revisión funciona con los modelos de DeepSeek, a través de su API, con servidores en China, un país sin decisión de adecuación de la Comisión Europea. Los emails y los teléfonos que haya en el texto se sustituyen por marcas antes de que salga. La revisión nunca recibe tus contactos, ningún dato de huéspedes ni los nombres de tus autores.

La revisión no rechaza una campaña por sí sola. Cuando una parece claramente dañina se queda en espera, y una persona de GuestMail decide si se envía tal como la escribiste. La revisión puede equivocarse en los dos sentidos. Si crees que retuvo una campaña por error, escribe a {{support_email}}.

La revisión es parte de cómo GuestMail protege la reputación de todos los remitentes, así que no se puede desactivar para una sola cuenta.

## Tu propio asistente de IA y GuestMail

GuestMail tiene un servidor MCP y una API REST. Con ellos puedes conectar el asistente de IA que elijas y dejar que trabaje con tu cuenta: leer tus contactos, escribir campañas y enviarlas. GuestMail no elige, ejecuta ni supervisa ese asistente. [Qué puede hacer un agente de IA con GuestMail](/es/agents) explica las herramientas, los clientes y la configuración.

- El asistente trabaja solo dentro de tu cuenta, con el acceso que le diste.
- Lo que hace se hace en tu nombre. Lee lo que escribe antes de dejarle enviar.
- Puedes revocar una clave de API o desconectar una aplicación desde tus ajustes cuando quieras.
- Lo que tu asistente haga con los datos que lee se rige por las condiciones de la empresa que lo ofrece, no por GuestMail.

## Dónde no usa GuestMail la IA

- Elegir qué reseñas de Google sugerir para una campaña sigue reglas fijas, como su nota, su fecha y de qué habla. No interviene ningún modelo.
- Los segmentos, los límites del plan y la limpieza de la lista siguen reglas que puedes leer en el centro de ayuda.
- GuestMail no toma ninguna decisión automatizada sobre tus huéspedes que tenga efectos jurídicos sobre ellos.

## Tus datos y los modelos de IA

- GuestMail no entrena modelos de IA con tu contenido ni con tus contactos.
- GuestMail no vende tus datos ni los de tus huéspedes.
- El texto que se envía a la revisión de contenido y al agente no lleva contactos, datos de huéspedes ni nombres de autores.

## Tus derechos sobre el uso de la IA en GuestMail

Puedes preguntar qué concluyó la revisión de contenido sobre una de tus campañas y pedir que la revise una persona. Para cualquier asunto sobre datos personales, consulta la [política de privacidad](/es/privacy).

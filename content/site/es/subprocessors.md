---
# Borrador para que lo revise un abogado antes de darlo por bueno. La tabla es {{providers}}: PROVIDERS en
# lib/marketing/legal.js, la única lista para esta página, la política de privacidad y el contrato de encargo.
# Para el abogado y para quien despliega: comprobar cada fila contra lo que corre en producción, y la región de Upstash.
# La descripción no puede nombrar a un proveedor de email (tests/public-site.test.mjs): la tabla sí.
title: "Subencargados del tratamiento"
description: "Las empresas que ayudan a GuestMail a tratar datos personales, qué trata cada una y dónde, qué llega al modelo de IA y cómo se avisan los cambios."
slug: "subprocessors"
lang: es
date: 2026-11-22
updated: 2026-11-23
status: published
translationOf: "subprocessors"
---

Los subencargados de GuestMail son las empresas que tratan datos personales por su cuenta: alojamiento, envío de emails, pagos y revisión de contenido. Esta página lista cada una, qué trata y dónde está. Forma parte del [contrato de encargo del tratamiento](/es/dpa).

## Quién trata datos por cuenta de GuestMail

{{providers}}

## Subencargados de GuestMail fuera del Espacio Económico Europeo

Las transferencias a proveedores de Estados Unidos se apoyan en el Marco de Privacidad de Datos UE-EE. UU. o en las cláusulas contractuales tipo aprobadas por la Comisión Europea.

La revisión automática y el agente de contenido usan el modelo Gemini de Google a través de OpenRouter. Lo que les llega es el asunto, el nombre del remitente y el texto de tus campañas, y tu brief. Los emails y los teléfonos que haya en el texto de una campaña se sustituyen por marcas antes de que salga. OpenRouter solo lo envía a proveedores que no recogen esos datos para guardarlos ni para entrenar sus modelos. Ninguno de los dos recibe tus contactos, ningún dato de huéspedes ni los nombres de tus autores.

## Qué no recibe ningún subencargado de GuestMail

- GuestMail nunca envía tus listas de contactos a un proveedor de IA. Un asistente de IA que conectes tú lee lo que tú le dejes leer, con las condiciones de su propio proveedor.
- Google recibe el nombre o el identificador de tu establecimiento para leer sus reseñas, nunca un contacto.
- Stripe gestiona tu pago. GuestMail nunca ve ni guarda el número de tu tarjeta.

## Cómo te avisa GuestMail de un cambio

GuestMail te avisa por email antes de añadir o sustituir un subencargado. Si te opones, puedes cerrar tu cuenta y exportar antes tus contactos. Para cualquier duda, escribe a {{support_email}}.

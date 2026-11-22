---
# La página de precios (components/marketing/PagesSite.jsx) pinta lo que va antes del primer h2 alrededor de su tabla
# de planes (los párrafos, {{plans}} y la lista de lo que trae cada plan) y después cada h2 como una sección de texto.
# Todas las cifras salen del código (lib/plans.js y el artículo de planes de la ayuda): {{tokens}} donde se puede.
title: "Precios de GuestMail: todas las funciones en todos los planes"
description: "GuestMail cuesta desde {{starter_price}} al mes por {{starter_emails}} emails, con cobro trimestral. Todos los planes traen todo, también agentes de IA y API."
slug: "pricing"
lang: es
date: 2026-11-22
updated: 2026-11-22
status: published
translationOf: "pricing"
faq:
  - q: "¿GuestMail se cobra por mes, por trimestre o por año?"
    a: "GuestMail se cobra cada 3 meses, por adelantado, a través de Stripe. Los precios de su página son por mes, así que el plan Starter de {{starter_price}} al mes son {{starter_quarter}} por trimestre. No se vende con cobro mensual ni anual."
  - q: "¿GuestMail tiene plan gratuito o periodo de prueba?"
    a: "No. GuestMail no tiene plan gratuito ni periodo de prueba. Sin plan puedes dar de alta tu establecimiento, escribir borradores y verlos, y añadir {{trial_contacts}} contactos al día a mano. Enviar, importar, usar tu dominio, crear claves de API y conectar asistentes de IA necesitan un plan. {{sales_note}}"
  - q: "¿Qué contactos cuentan en un plan de GuestMail?"
    a: "En un plan de GuestMail solo cuentan los contactos activos: quienes reciben tus campañas. Los que aún no han confirmado, los inactivos y quienes se dieron de baja, rebotaron o marcaron como spam siguen en tu lista y no cuentan. Starter cubre hasta {{starter_contacts}} contactos activos."
  - q: "¿Qué pasa si gasto los emails de mi plan de GuestMail?"
    a: "Un envío que necesita más emails de los que le quedan este mes a tu plan de GuestMail espera hasta que subas de plan o empiece tu mes siguiente. Las altas siguen funcionando y los emails de confirmación siguen saliendo. La cuenta de {{starter_emails}} emails de Starter vuelve a cero cada mes, el día en que empezó tu plan."
  - q: "¿Los agentes de IA y la API entran en todos los planes de GuestMail?"
    a: "Sí. Todos los planes de GuestMail incluyen el servidor MCP, con {{tool_count}} herramientas para un agente de IA, y la API REST, sin coste añadido. Necesitan un plan de pago para funcionar, igual que enviar. Cada clave de API tiene {{requests_per_minute}} peticiones por minuto."
  - q: "¿Puedo cancelar GuestMail cuando quiera?"
    a: "Sí. GuestMail se cancela desde tu página de facturación y el plan sigue funcionando hasta el final de los 3 meses que pagaste. Después se paran los envíos, y tu lista, tus campañas y tu configuración se guardan por si vuelves. Los trimestres a medias no se devuelven."
  - q: "¿En qué moneda cobra GuestMail?"
    a: "GuestMail cobra en dólares estadounidenses, a través de Stripe, cada 3 meses. Stripe enseña el importe antes de que confirmes, y GuestMail nunca ve ni guarda el número de tu tarjeta."
---

GuestMail cuesta desde {{starter_price}} al mes por {{starter_emails}} emails y hasta {{starter_contacts}} contactos activos, con cobro por trimestre. Cada plan fija esos dos números, y todos los planes traen todas las funciones, también los agentes de IA y la API.

Los precios son por mes, en dólares estadounidenses, y se pagan de 3 en 3 meses. Cancela cuando quieras: tu plan sigue funcionando hasta el final del trimestre que pagaste. {{sales_note}}

{{plans}}

- Campañas
- Programación
- Segmentos
- Reseñas de Google Maps
- Formulario de alta y popup
- Emails de bienvenida
- Importaciones
- Conector de reservas
- Emails automáticos para hoteles
- Tu propio dominio
- Una página web por campaña
- Estadísticas
- Equipo
- Agentes de IA y API

## Cómo cuenta GuestMail los emails y los contactos

Un email es cada email que GuestMail envía por ti: campañas, emails de prueba, emails de bienvenida y de confirmación, y el email de última oportunidad de la limpieza de la lista. Una campaña enviada a 1.000 huéspedes son 1.000 emails. La cuenta vuelve a cero cada mes, el día en que empezó tu plan.

Un contacto activo es alguien que recibe tus campañas. Quienes aún no han confirmado, los inactivos y quienes se dieron de baja, rebotaron o marcaron como spam siguen en tu lista y no cuentan.

## Qué pasa al llegar al límite de un plan de GuestMail

Las altas siguen funcionando y los emails de confirmación siguen saliendo. Un envío que necesita más emails de los que te quedan este mes espera hasta que subas de plan o empiece tu mes siguiente. Con más contactos activos de los que admite tu plan, los envíos esperan hasta que subas de plan.

## Los agentes de IA entran en todos los planes de GuestMail

No hay un extra de IA. Todos los planes incluyen el servidor MCP, con {{tool_count}} herramientas, y la API REST, para que ChatGPT, Claude, Grok Bot, Claude Code, Codex o Cursor redacten, programen y te cuenten resultados. Necesitan un plan de pago, igual que enviar.

[Qué puede hacer un agente de IA con GuestMail](/es/agents)

## Cambiar o cancelar un plan de GuestMail

Cambia de plan desde la página de facturación cuando quieras: Stripe enseña lo que vas a pagar antes de que confirmes. Una subida se cobra en el momento por lo que queda del periodo, y una bajada empieza al terminar el periodo que ya pagaste.

Cuando cancelas, tu plan sigue hasta el final del trimestre que pagaste. Después se paran los envíos, y tu lista, tus campañas y tu configuración se guardan por si vuelves. Los trimestres a medias no se devuelven, y no hay periodo de prueba.

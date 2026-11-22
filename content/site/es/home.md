---
# La portada (components/marketing/PagesSite.jsx) lee este fichero con una forma fija: dos párrafos (la entrada y la
# línea del precio) y seis secciones en este orden. La demo: un párrafo y luego un h3 y un párrafo por pestaña, en el
# orden de DEMO_TABS (lib/marketing/landing-demo.js): preguntar, escribir, huéspedes, reseñas, automatizaciones y web.
# Qué da GuestMail: un h3 y un párrafo por tarjeta, en el orden de FEATURE_VISUALS (components/marketing/DemoLanding.jsx):
# programación, popup, segmentos, importación, reservas, reservas atribuidas, dominio, entregabilidad y equipo. Agentes: un
# párrafo, una lista de "**Asistente** hace una cosa: `herramienta`" y los párrafos que siguen. Planes: un párrafo,
# {{plans}} y la lista de lo que trae cada plan. El cierre: sus párrafos.
# Los {{tokens}} salen del código: lib/marketing/content-render.js los lista.
# Todo lo que se afirma aquí lo hace hoy el producto, y cada herramienta nombrada está en lib/actions/registry.js.
title: "Email marketing para hoteles y restaurantes"
description: "GuestMail es email marketing para hoteles y restaurantes: lista de huéspedes con estancias, campañas con tus reseñas de Google y agentes de IA."
slug: "home"
lang: es
date: 2026-11-22
updated: 2026-11-22
status: published
translationOf: "home"
faq:
  - q: "¿Qué es GuestMail?"
    a: "GuestMail es una herramienta de email para hoteles y restaurantes. Guarda la lista de huéspedes con sus estancias y reservas, envía campañas y newsletters, lanza automatizaciones cuando alguien se apunta o entra una reserva nueva, da a tu establecimiento una web con un formulario y un popup con el código de tu oferta, y convierte tus reseñas de Google Maps en el borrador de una campaña. Los planes empiezan en {{starter_price}} al mes. {{sales_note}}"
  - q: "¿Cuánto cuesta GuestMail?"
    a: "GuestMail cuesta desde {{starter_price}} al mes, con {{starter_emails}} emails mensuales y hasta {{starter_contacts}} contactos activos, y se cobra cada 3 meses, es decir {{starter_quarter}} por trimestre. Todos los planes traen todas las funciones. Quien se dio de baja, rebotó o quedó inactivo sigue en tu lista y no cuenta. {{sales_note}}"
  - q: "¿Cómo sé qué plan de GuestMail necesito?"
    a: "Cada plan de GuestMail fija dos números: los emails que puedes enviar al mes y los contactos activos que puedes tener. Starter cubre {{starter_emails}} emails y {{starter_contacts}} contactos activos. Quien se dio de baja, rebotó o quedó inactivo sigue en tu lista sin contar."
  - q: "¿Cómo usa GuestMail mis reseñas de Google?"
    a: "Conectas una vez tu ficha de Google Maps. GuestMail lee en vivo tu nota y las 5 reseñas que Google Maps considera más relevantes, marca hasta 3 que merece la pena citar y redacta con ellas el borrador de una campaña, cada cita con su autor y un enlace a la reseña. Tú lees el borrador y decides qué se envía."
  - q: "¿GuestMail funciona con mi PMS, mi motor de reservas o el programa de reservas de mi restaurante?"
    a: "GuestMail importa el CSV que exporta cualquiera de ellos: el huésped, las fechas de la estancia o de la reserva, el canal y el consentimiento comercial. También te da una URL privada que recibe cada reserva nueva en JSON, para que la envíe un PMS, un motor de reservas o una herramienta como Zapier, Make o n8n. Todavía no tiene una conexión propia con un PMS concreto."
  - q: "¿Cómo gestiona GuestMail el consentimiento y las bajas?"
    a: "GuestMail te pide confirmar, en cada importación, que esas personas aceptaron recibir tus emails. La doble confirmación viene activada de serie: quien se apunta por el formulario confirma por email antes de entrar en la lista. Cada email lleva un enlace de baja que funciona en 1 clic, y las direcciones que rebotan y quien marca tus emails como spam dejan de recibir emails sin que hagas nada."
  - q: "¿Puede un agente de IA manejar GuestMail?"
    a: "Sí, con un plan. Lo que hace el panel de GuestMail también lo hace un agente de IA por su servidor MCP, con {{tool_count}} herramientas, y tu propio código por su API REST: leer tu reputación, elegir a los huéspedes, redactar una campaña, importar huéspedes o programar un envío. Enviar, programar y encender una automatización están marcados como irreversibles y le dicen al agente que te pregunte antes. Que pregunte depende del cliente de IA que uses."
  - q: "¿GuestMail está en español?"
    a: "Sí. El panel de GuestMail está en español y en inglés: cada persona elige el idioma en el menú de su cuenta y, mientras no lo elige, manda el de su navegador. Lo que ven tus huéspedes sale en el idioma que elijas para tu establecimiento, como la web que GuestMail te aloja con su formulario y el aviso legal de tus formularios. Las campañas las escribes tú en el idioma que quieras. El centro de ayuda y la documentación de la API están en inglés."
---

Pídele una campaña a tu agente de IA: lee tus reseñas, elige a los huéspedes y te deja un borrador para que lo apruebes. GuestMail es email marketing para hoteles y restaurantes, con una lista de huéspedes que guarda cada estancia, automatizaciones y una web con tu oferta.

Desde {{starter_price}} al mes por {{starter_emails}} emails, con cobro por trimestre. {{sales_note}}

## GuestMail en acción

Todo lo que ves aquí también lo puede hacer tu agente de IA. [Mira cómo](/es/agents)

### Pregunta a tu IA

Pídelo con tus palabras. Tu agente lee tus reseñas, elige a los huéspedes, escribe el borrador y te manda una prueba. GuestMail le dice que te pregunte antes de programar o enviar.

### Escribir

Un editor con diseños para hoteles y restaurantes: una cabecera con tu nombre, un banner, filas de fotos y un botón. Míralo en el móvil y envíalo en el momento o elige día y hora. [Escribir, en el centro de ayuda (en inglés)](/help/writing#designs)

### Huéspedes

La ficha de cada huésped guarda sus estancias y reservas, con el canal, la habitación, el número de personas y el importe, junto a lo que abrió y los segmentos en los que está. [Contactos, en el centro de ayuda (en inglés)](/help/contacts#contact-page)

### Reseñas

Conecta tu ficha de Google Maps. GuestMail lee las 5 reseñas que Google considera más relevantes, marca hasta 3 que merece la pena citar y redacta la campaña, cada cita con su autor y su enlace.

### Automatizaciones

Dibuja el camino de cada huésped: qué lo pone en marcha, como apuntarse, una etiqueta, un clic o una reserva nueva del conector, y después correos, esperas y una condición con una rama para el sí y otra para el no. Empieza desde una plantilla, o deja que tu agente monte la automatización con `create_automation` y la encienda con `turn_on_automation`.

### Web

Tu establecimiento tiene su propia web en GuestMail, con tu oferta, un formulario de alta y una página por cada campaña que envías, que los buscadores pueden encontrar. [Web, en el centro de ayuda (en inglés)](/help/website)

## Qué le da GuestMail a un hotel o a un restaurante

### Programación

Elige el día, la hora y a quién va, a todos o a un segmento. La campaña sale sola. [Envíos, en el centro de ayuda (en inglés)](/help/sending#when)

### Un popup con tu oferta

Una línea de código en tu web. El visitante deja su email y recibe tu código, el que acepta tu motor de reservas, o uno distinto por persona.

### Segmentos

Huéspedes que se alojaron en los últimos 90 días, que reservaron por Booking.com o que no han vuelto en un año, con la cuenta a la vista mientras los creas. [Segmentos, en el centro de ayuda (en inglés)](/help/contacts#segments)

### Importación desde tu PMS

Arrastra el CSV que exporta tu PMS o tu sistema de reservas. La llegada, la salida, el canal y el consentimiento comercial se reconocen solos, y tú asignas las columnas que no reconoce. [Importar, en el centro de ayuda (en inglés)](/help/importing-contacts)

### Cada reserva, al momento

Una URL privada recibe cada reserva nueva en JSON desde tu PMS, tu motor de reservas o una herramienta como Zapier, Make o n8n, y añade al huésped con su estancia.

### Las reservas que trajo cada campaña

Cuando tus estancias llevan su fecha de reserva, cada campaña enviada muestra las reservas que hicieron los huéspedes en los {{click_window_days}} días siguientes a pulsar uno de sus enlaces, con su importe. [Reservas atribuidas, en el centro de ayuda (en inglés)](/help/sending#attributed)

### Tu propio dominio

Envía desde el dominio de tu hotel, con los registros DNS que hay que añadir y una comprobación de cada uno. O empieza desde una dirección compartida. [Dominios, en el centro de ayuda (en inglés)](/help/sender-addresses#own-domain)

### Entregabilidad de serie

Doble confirmación, baja en un clic, gestión de rebotes y quejas, y una limpieza de la lista para quien dejó de abrir. [Entregabilidad, en el centro de ayuda (en inglés)](/help/deliverability)

### Tu equipo

Invita a quienes escriben y envían contigo, cada uno con su propio acceso, como admin o como miembro. [Equipo, en el centro de ayuda (en inglés)](/help/team)

## Tu agente de IA hace en GuestMail todo lo que haces tú

Conecta GuestMail a ChatGPT, Claude o Grok Bot con tu cuenta de GuestMail, o a Claude Code, Codex y Cursor con una clave de API. En ChatGPT, eso es en los espacios de trabajo Business, Enterprise y Edu. El agente trabaja con las mismas {{tool_count}} acciones del panel, con las mismas comprobaciones y los mismos límites del plan.

- **ChatGPT** lee tus reseñas de Google: `get_reputation`
- **Claude** encuentra a los huéspedes que se alojaron en los últimos 6 meses: `create_segment`
- **Grok Bot** redacta una campaña con tus mejores reseñas: `create_review_campaign`
- **Claude Code** la programa para el domingo por la mañana, cuando le dices que sí: `schedule_campaign`
- **Codex** te cuenta cómo ha ido: `get_campaign_report`
- **Cursor** carga los huéspedes del mes pasado desde el CSV de tu PMS: `import_contacts`

Enviar y programar están marcados como irreversibles, y GuestMail le dice a tu agente que te pregunte antes. Que pregunte depende del cliente de IA que uses.

[Qué puede hacer un agente de IA con GuestMail](/es/agents) · [Configurar el MCP (en inglés)](/docs/mcp) · [Referencia de la API (en inglés)](/docs/api)

## Todas las funciones de GuestMail, en todos los planes

Cada plan fija los emails que puedes enviar al mes y los contactos activos que puedes tener. Los precios son por mes y se cobran cada trimestre. Cancela cuando quieras: tu plan sigue funcionando hasta el final del trimestre que pagaste. {{sales_note}}

{{plans}}

- Campañas
- Programación
- Segmentos
- Reseñas de Google Maps
- Formulario de alta y popup
- Emails de bienvenida
- Importaciones
- Conector de reservas
- Automatizaciones
- Reservas atribuidas
- Tu propio dominio
- Una web para tu establecimiento
- Estadísticas
- Equipo
- Agentes de IA y API

## Trae tu lista de huéspedes a GuestMail

Date de alta, conecta tu ficha de Google Maps y escribe tu primer borrador. Con un plan, importa el CSV de tu PMS o conecta tus reservas y pídele a tu agente la primera campaña.

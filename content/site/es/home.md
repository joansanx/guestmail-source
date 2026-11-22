---
# La portada (components/marketing/PagesSite.jsx) lee este fichero con una forma fija: dos párrafos (la entrada y la
# línea del precio) y tres secciones en este orden: qué da GuestMail (un h3 y un párrafo cada una), agentes (un
# párrafo, las herramientas en lista y los enlaces) y planes (un párrafo, {{plans}} y la lista de lo que trae cada
# plan). Los {{tokens}} salen del código: lib/marketing/content-render.js los lista.
# Todo lo que se afirma aquí lo hace hoy el producto.
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
    a: "GuestMail es una herramienta de email para hoteles y restaurantes. Guarda la lista de huéspedes con sus estancias y reservas, envía campañas y newsletters, pone en tu web un formulario y un popup con el código de tu oferta, y convierte tus reseñas de Google Maps en el borrador de una campaña. Los planes empiezan en {{starter_price}} al mes."
  - q: "¿Cuánto cuesta GuestMail?"
    a: "GuestMail cuesta desde {{starter_price}} al mes por {{starter_emails}} emails al mes y hasta {{starter_contacts}} contactos activos, con cobro cada 3 meses, es decir {{starter_quarter}} por trimestre. Todos los planes traen todas las funciones. Quien se dio de baja, rebotó o quedó inactivo sigue en tu lista y no cuenta."
  - q: "¿Cómo sé qué plan de GuestMail necesito?"
    a: "Cada plan de GuestMail fija dos números: los emails que puedes enviar al mes y los contactos activos que puedes tener. Starter cubre {{starter_emails}} emails y {{starter_contacts}} contactos activos. Quien se dio de baja, rebotó o quedó inactivo sigue en tu lista sin contar."
  - q: "¿Cómo usa GuestMail mis reseñas de Google?"
    a: "Conectas una vez tu ficha de Google Maps. GuestMail lee en vivo tu nota y las 5 reseñas que Google Maps considera más relevantes, marca hasta 3 que merece la pena citar y redacta con ellas el borrador de una campaña, cada cita con su autor y un enlace a la reseña. Tú lees el borrador y decides qué se envía."
  - q: "¿GuestMail funciona con mi PMS, mi motor de reservas o mi sistema de reservas?"
    a: "GuestMail importa el CSV que exporta cualquiera de ellos: el huésped, las fechas de la estancia o de la reserva, el canal y el consentimiento comercial. También te da una URL privada que recibe cada reserva nueva en JSON, para que la envíe un PMS, un motor de reservas o una herramienta como Zapier, Make o n8n. Todavía no tiene una conexión propia con un PMS concreto."
  - q: "¿Cómo gestiona GuestMail el consentimiento y las bajas?"
    a: "GuestMail te pide confirmar, en cada importación, que esas personas aceptaron recibir tus emails. Quien se apunta por el formulario confirma por email antes de entrar en la lista, opción activada de serie. Cada email lleva un enlace de baja que funciona en 1 clic, y las direcciones que rebotan o marcan como spam dejan de recibir emails sin que hagas nada."
  - q: "¿Puede un agente de IA manejar GuestMail?"
    a: "Sí. Lo que hace el panel de GuestMail también lo hace un agente de IA por su servidor MCP, con {{tool_count}} herramientas, y tu propio código por su API REST: leer tu reputación, redactar una campaña, importar huéspedes o programar un envío. Enviar y programar están marcados como irreversibles y le dicen al agente que te pregunte antes. Que pregunte depende del cliente de IA que uses."
  - q: "¿GuestMail está en español?"
    a: "El panel de GuestMail está hoy en inglés. Lo que ven tus huéspedes sale en español o en inglés, el idioma que elijas para tu establecimiento: la web que GuestMail te aloja con su formulario, el aviso legal de tus formularios y los 4 emails automáticos para hoteles. Las campañas las escribes tú en el idioma que quieras."
---

GuestMail es un software de email marketing para hoteles y restaurantes: la lista de huéspedes con sus estancias y reservas, newsletters, campañas hechas con tus reseñas de Google y un popup que entrega el código de tu reserva directa. También lo puede manejar tu agente de IA, con las mismas {{tool_count}} acciones del panel.

Desde {{starter_price}} al mes por {{starter_emails}} emails, con cobro por trimestre. {{sales_note}}

## Qué le da GuestMail a un hotel o a un restaurante

### Campañas y programación

Escribe en un editor con imágenes y botones, mira cómo queda en el móvil y envía en el momento o elige día y hora.

### De las reseñas a la campaña

Conecta tu ficha de Google Maps. GuestMail lee las 5 reseñas que Google considera más relevantes, marca hasta 3 que merece la pena citar y redacta la campaña, cada cita con su autor y su enlace.

### Un popup con tu oferta

Una línea de código en tu web. El visitante deja su email y recibe tu código, el que acepta tu motor de reservas, o uno distinto por persona.

### Una lista de huéspedes con estancias

La ficha de cada huésped guarda sus estancias o reservas y el canal por el que reservó, junto a lo que abrió y los enlaces que pulsó. Los segmentos, la API y tu agente de IA también lo leen.

### Segmentos

Huéspedes que se alojaron en los últimos 90 días, huéspedes que reservaron por Booking.com, huéspedes que no han vuelto en un año.

### Importación desde tu PMS

Arrastra el CSV que exporta tu PMS o tu sistema de reservas. La llegada, la salida, el canal y el consentimiento comercial se reconocen solos, y tú asignas las columnas que no reconoce.

### Reservas según entran

Una URL privada recibe cada reserva nueva en JSON desde tu PMS, tu motor de reservas o una herramienta como Zapier, Make o n8n, y añade al huésped con su estancia.

### Emails automáticos para hoteles

Cuatro emails que salen solos cuando los enciendes: antes de la llegada, después de la estancia, por el cumpleaños y para quien lleva 12 meses sin volver. Cada huésped recibe cada uno una sola vez.

### Tu propio dominio

Envía desde el dominio de tu hotel, con los registros DNS que hay que añadir y una comprobación de cada uno. O empieza desde una dirección compartida.

### Entregabilidad de serie

Doble confirmación, baja en un clic, gestión de rebotes y quejas, y una limpieza de la lista para quien dejó de abrir.

### Una página web por campaña

Cada campaña que envías puede ser además una página en un sitio que GuestMail aloja para ti, en tu propio subdominio si lo añades, y que los buscadores encuentran.

### Tu equipo

Invita a quienes escriben y envían contigo, cada uno con su propio acceso.

## Tu agente de IA puede manejar GuestMail

Conecta GuestMail a ChatGPT, Claude o Grok Bot con tu inicio de sesión, o a Claude Code, Codex y Cursor con una clave de API. El agente trabaja con las mismas {{tool_count}} acciones del panel, con las mismas comprobaciones y los mismos límites del plan.

- `get_reputation` lee tu nota y las reseñas que merece la pena citar
- `create_review_campaign` redacta una campaña con ellas
- `import_contacts` carga los huéspedes del mes pasado desde el CSV de tu PMS
- `create_segment` guarda a quién va, por ejemplo quien se alojó en los últimos 90 días
- `schedule_campaign` la deja programada para el domingo por la mañana
- `send_campaign` la envía, y le dice al agente que te pregunte antes

[Qué puede hacer un agente de IA con GuestMail](/es/agents) · [Configurar el MCP (en inglés)](/docs/mcp) · [Referencia de la API (en inglés)](/docs/api)

## Todas las funciones de GuestMail, en todos los planes

Cada plan fija los emails que puedes enviar al mes y los contactos activos que puedes tener. Los precios son por mes y se cobran cada trimestre. Cancela cuando quieras: tu plan sigue funcionando hasta el final del trimestre que pagaste.

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

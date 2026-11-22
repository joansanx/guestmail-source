---
title: "Limpiar la lista de correo de un restaurante sin borrar contactos"
description: "Por qué insistir con quien no abre perjudica la entrega, qué tasa de spam fija Gmail y cómo pasar a dormidos los contactos fríos de un restaurante."
slug: limpiar-lista-correo-restaurante
lang: es
date: 2026-11-22
updated: 2026-11-22
status: published
faq:
  - q: "¿Qué tasa de spam pide Gmail a un restaurante que envía correos?"
    a: "Google pide mantener la tasa de spam denunciado por los usuarios por debajo del 0,1 % y evitar que alcance o supere el 0,3 %. La tasa se calcula a diario y se consulta en Postmaster Tools. Por encima del 0,1 % ya influye de forma negativa en la entrega de los remitentes masivos, y desde junio del 2024 los remitentes masivos que superan el 0,3 % no pueden solicitar mitigaciones."
  - q: "¿Cuándo pasa un contacto de un restaurante a dormido en GuestMail?"
    a: "Pasa a dormido cuando no pulsa el botón del correo de última oportunidad y se hace un envío 14 días o más después de ese correo. Antes, el contacto tiene que haberse vuelto frío: 6 correos ignorados seguidos y 180 días sin señales de vida. Los dormidos siguen en la lista y no cuentan para el plan."
  - q: "¿Se borra o se da de baja el contacto dormido de un restaurante?"
    a: "No. Los contactos dormidos nunca se dan de baja ni se borran, y se pueden marcar como activos desde la página de contactos. Tampoco cuentan para los contactos activos del plan. Un contacto que se dio de baja es distinto: solo vuelve si se suscribe otra vez o si se le reactiva tras confirmar que lo pidió."
  - q: "¿Qué límites de rebotes y quejas pausan un envío de restaurante en GuestMail?"
    a: "Una campaña se pausa sola cuando más del 2,5 % de sus correos rebotan de forma dura, con al menos 5, cuando más del 0,08 % se marca como spam, con al menos 2, o cuando Gmail rechaza más del 2 %, con al menos 10. La cuenta entera se bloquea por encima del 5 % de rebotes duros o del 0,3 % de quejas."
  - q: "¿Cuántos correos ignorados hacen falta para que un contacto de restaurante sea frío?"
    a: "La limpieza de lista de GuestMail marca un contacto como frío tras 6 correos ignorados seguidos y 180 días sin señales de vida. Las aperturas, los clics, una nueva suscripción y el clic de confirmación reinician la cuenta. El umbral se puede ajustar entre 2 y 100 correos ignorados y entre 30 y 3650 días de silencio."
  - q: "¿Cuánto cuesta el plan de GuestMail para la lista de un restaurante?"
    a: "El plan Starter parte de {{starter_price}} al mes para {{starter_emails}} correos y {{starter_contacts}} contactos activos, facturado por trimestre. Los contactos que se dieron de baja, rebotaron o están dormidos siguen en la lista sin contar para ese límite. Todos los planes incluyen todas las funciones."
  - q: "¿Qué debe comprobar un restaurante antes de importar su lista antigua en GuestMail?"
    a: "Antes de importar, GuestMail pide confirmar que esas personas aceptaron recibir los correos. Para una lista antigua, la ayuda de deliverability recomienda importarla como dormida y marcar como activos solo a los lectores que se conocen. Las altas nuevas confirman por email antes de entrar, y esa confirmación viene activada por defecto."
  - q: "¿Cómo se devuelve a la lista activa un contacto dormido de un restaurante?"
    a: "Se abre la página del contacto o su menú en la lista de contactos y se elige la opción que lo marca como activo, y entonces recibe el siguiente envío. También se puede hacer en bloque: se seleccionan varios contactos y se usa el cambio de estado de la barra inferior, donde solo los dormidos pasan a activos."
sources:
  - title: "Pricing · GuestMail"
    url: "https://theguestmail.com/pricing"
    checked: 2026-11-22
  - title: "List cleanup · GuestMail help"
    url: "https://theguestmail.com/help/list-cleanup"
    checked: 2026-11-22
  - title: "Bounces, complaints and pauses · GuestMail help"
    url: "https://theguestmail.com/help/deliverability"
    checked: 2026-11-22
  - title: "Contacts · GuestMail help"
    url: "https://theguestmail.com/help/contacts"
    checked: 2026-11-22
  - title: "Directrices para remitentes de correos - Ayuda de Gmail"
    url: "https://support.google.com/a/answer/81126?hl=es"
    checked: 2026-11-22
  - title: "Preguntas frecuentes sobre las directrices para remitentes de correos - Ayuda de Gmail"
    url: "https://support.google.com/a/answer/14229414?hl=es"
    checked: 2026-11-22
translationOf: clean-restaurant-email-list
---

Esta guía es para quien lleva el correo de un restaurante y quiere limpiar la lista sin perder a nadie. Al terminar sabrá qué límite de spam pide Gmail y cómo dejar dormidos a los contactos que no abren.

> **Respuesta rápida.** Google pide a los remitentes que mantengan la tasa de spam denunciado por los usuarios por debajo del 0,1 % y que no alcance ni supere el 0,3 %, según las [preguntas frecuentes sobre las directrices para remitentes](https://support.google.com/a/answer/14229414?hl=es). En GuestMail, un contacto pasa a dormido cuando no responde al correo de última oportunidad, y los dormidos siguen en la lista sin contar para el plan, como explica la [ayuda de limpieza de lista](/help/list-cleanup).

## En resumen

- Google calcula la tasa de spam a diario y la publica en Postmaster Tools, según sus [preguntas frecuentes sobre las directrices para remitentes](https://support.google.com/a/answer/14229414?hl=es).
- En GuestMail un contacto es frío tras 6 correos ignorados seguidos y 180 días sin señales de vida, y recibe un correo de última oportunidad en lugar del envío.
- Quien no pulsa el botón del correo de última oportunidad pasa a dormido en el primer envío que se haga 14 días o más después de ese correo.
- Los contactos dormidos nunca se dan de baja ni se borran, y no cuentan para los contactos activos del plan.
- Según la [página de precios](/pricing), el plan Starter de GuestMail parte de {{starter_price}} al mes para {{starter_emails}} correos y {{starter_contacts}} contactos activos, facturado por trimestre.

## Por qué escribir a quien no abre perjudica la entrega

Un lector que ignora los correos sigue recibiéndolos, y los buzones lo notan: una lista llena de lectores que no abren empuja los envíos hacia el spam para el resto, según la [ayuda de limpieza de lista](/help/list-cleanup).

Google lo plantea desde el otro lado: si los mensajes de un dominio se marcan como spam con frecuencia, es más probable que sus futuros mensajes se consideren spam, y con el tiempo esas marcas pueden perjudicar la reputación del dominio, según las [directrices para remitentes de correos](https://support.google.com/a/answer/81126?hl=es).

La misma página de Google recomienda enviar solo a quienes aceptan recibir los mensajes, confirmar las direcciones antes de suscribirlas, escribir con periodicidad para confirmar que quieren seguir recibiendo los mensajes, y menciona que se puede dar de baja a quienes no abren o no leen. Ofrecer una salida sencilla también ayuda a mejorar las tasas de apertura y los porcentajes de clics, siempre según esas directrices.

## Qué tasa de spam fija Gmail como límite

Google pide mantener la tasa de spam denunciado por los usuarios por debajo del 0,1 % y evitar que alcance o supere el 0,3 %, según sus [preguntas frecuentes sobre las directrices para remitentes](https://support.google.com/a/answer/14229414?hl=es). La tasa se calcula a diario y se consulta en Postmaster Tools.

Las mismas preguntas frecuentes añaden tres condiciones:

- Por encima del 0,1 % la tasa ya influye de forma negativa en la entrega a la bandeja de entrada de los remitentes masivos.
- Desde junio del 2024, los remitentes masivos que superen el 0,3 % no pueden solicitar mitigaciones.
- Las mitigaciones solo se pueden pedir si la tasa se mantiene por debajo del 0,3 % durante 7 días consecutivos.

Las [directrices para remitentes de correos](https://support.google.com/a/answer/81126?hl=es) fijan además el umbral de remitente masivo en más de 5000 mensajes al día a cuentas de Gmail. Las preguntas frecuentes precisan que se considera remitente masivo quien envía aproximadamente 5000 mensajes o más a cuentas personales de Gmail en 24 horas, que cuentan todos los mensajes del mismo dominio principal y que esa condición no caduca.

## Cómo se retiran los contactos dormidos en GuestMail sin borrarlos

La limpieza de lista de GuestMail se apoya en tres pasos que ya vienen activados en las newsletters nuevas:

1. Un contacto pasa a frío tras 6 correos ignorados seguidos y 180 días sin señales de vida. Las aperturas, los clics, una nueva suscripción y el clic de confirmación cuentan como señal de vida y reinician la cuenta, como detalla la [ayuda de limpieza de lista](/help/list-cleanup).
2. Ese contacto recibe un correo de última oportunidad en lugar del envío, con un botón para seguir recibiendo la newsletter. Puede cambiarse el asunto, el texto de previsualización y el contenido en la página de limpieza de lista, pero hay que conservar el botón.
3. Quien no responde pasa a dormido en el primer envío que se haga 14 días o más después de ese correo. Los dormidos siguen en la lista, no se dan de baja ni se borran, y no cuentan para los contactos activos del plan.

Para devolver a alguien a la lista activa, la [ayuda de contactos](/help/contacts) describe la vía: abrir la página del contacto o su menú en la lista y elegir la opción que lo marca como activo. También se puede hacer en bloque: seleccionar varios contactos y usar el cambio de estado de la barra inferior, donde solo los dormidos pasan a activos y solo los activos pasan a dormidos.

El momento en que un contacto se considera frío se ajusta en la sección de limpieza de lista de los ajustes de la newsletter: de 2 a 100 correos ignorados y de 30 a 3650 días de silencio. Ahí mismo se puede desactivar la limpieza. Para una lista antigua, la [ayuda de deliverability](/help/deliverability) recomienda importarla como dormida y marcar como activos a los lectores que se conocen.

## Qué mirar antes de dar el envío por bueno

Antes de lanzar la campaña, el paso de envío cuenta cuántos reciben el correo, cuántos reciben el de última oportunidad, cuántos esperan respuesta y cuántos pasan a dormidos, según la [ayuda de limpieza de lista](/help/list-cleanup). El informe de la campaña muestra después los correos de última oportunidad separados del envío.

La [ayuda de deliverability](/help/deliverability) reúne los límites que conviene vigilar:

- Una campaña se pausa sola cuando más del 2,5 % de sus correos rebotan de forma dura (al menos 5), más del 0,08 % se marca como spam (al menos 2) o Gmail rechaza más del 2 % (al menos 10).
- La cuenta entera se bloquea por encima del 5 % de rebotes duros (al menos 10) o del 0,3 % de quejas (al menos 3), y también si un envío llega a una trampa de spam.
- Un contacto que rebota de forma dura o se queja no vuelve a recibir correos.

Antes de importar, GuestMail pide confirmar que esas personas aceptaron recibir los correos, y las altas nuevas confirman por email antes de entrar, según la [página de precios](/pricing). Si el restaurante envía desde su propio dominio, la [ayuda de deliverability](/help/deliverability) indica comprobar en Gmail que SPF, DKIM y DMARC dan PASS en el original del mensaje de prueba. Qué registros DNS hacen falta en cada proveedor de dominio depende de la configuración de cada uno y conviene revisarlo con quien la gestiona.

## Cómo se ha comprobado este artículo

Las cifras y los requisitos de este artículo se leyeron el 22 de noviembre de 2026 en las fuentes enlazadas. Lo que hace GuestMail se comprobó ese mismo día en su documentación pública. El texto se redactó con ayuda de IA a partir de esas fuentes. Antes de publicarse pasó una revisión editorial independiente.

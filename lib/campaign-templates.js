// guestmail: ready campaigns for hotels and restaurants, in English and Spanish, built to bring revenue: upgrades,
// add-ons, direct bookings, promotions and loyalty. A template becomes a draft (lib/actions/templates.js) with the venue's
// name and booking link filled in. Square brackets are for the owner to fill: a price, a date, a dish. Nothing is
// invented: a template never states a price or a perk the venue didn't choose. {{first_name|...}} is the reader's name.
export const TEMPLATE_GOALS = {
	upsell: { en: "Upsell", es: "Venta adicional" },
	"cross-sell": { en: "Cross-sell", es: "Venta cruzada" },
	direct: { en: "Direct booking", es: "Reserva directa" },
	promotion: { en: "Promotion", es: "Promoción" },
	loyalty: { en: "Loyalty", es: "Fidelización" },
};

export const TEMPLATE_LANGUAGES = ["en", "es"];

export const CAMPAIGN_TEMPLATES = [
	{
		id: "pre-arrival-upgrade",
		kind: "hotel",
		goal: "upsell",
		en: {
			title: "Before arrival: upgrade and early check-in",
			when: "5 days before arrival",
			subject: "Your stay at {{venue}} starts in a few days",
			previewText: "A bigger room, an earlier arrival or a later goodbye",
			markdown: `Hi {{first_name|there}},

We're getting your room ready. Before you arrive, three ways to make more of your stay at {{venue}}:

**A room with more space.** Move up to a [room type] for [price] more per night.

**Arrive early, leave late.** Check in from [time] or check out at [time], for [price] each.

**Breakfast waiting for you.** Add breakfast for [price] per person and start the day without plans.

[Add it to my booking]({{book}})

Just reply to this email if you'd like any of them. See you soon,

The {{venue}} team`,
		},
		es: {
			title: "Antes de la llegada: mejora y entrada temprana",
			when: "5 días antes de la llegada",
			subject: "Tu estancia en {{venue}} empieza en unos días",
			previewText: "Una habitación mejor, llegar antes o irte más tarde",
			markdown: `Hola {{first_name|de nuevo}},

Ya estamos preparando tu habitación. Antes de que llegues, tres maneras de aprovechar más tu estancia en {{venue}}:

**Una habitación con más espacio.** Pasa a una [tipo de habitación] por [precio] más por noche.

**Llega antes, vete más tarde.** Entrada desde las [hora] o salida a las [hora], por [precio] cada una.

**El desayuno, ya reservado.** Añádelo por [precio] por persona y empieza el día sin planes.

[Añadir a mi reserva]({{book}})

Si quieres alguna, responde a este correo. Nos vemos pronto,

El equipo de {{venue}}`,
		},
	},
	{
		id: "pre-arrival-extras",
		kind: "hotel",
		goal: "cross-sell",
		en: {
			title: "Before arrival: dinner, spa and experiences",
			when: "3 days before arrival",
			subject: "Book your table at {{venue}} before you arrive",
			previewText: "The evenings fill up fast. Save yours now",
			markdown: `Hi {{first_name|there}},

The best tables and treatments go first, so here's what you can book now for your stay at {{venue}}:

**Dinner at [restaurant name].** [One line about the menu or the chef]. Tables from [time].

**[Spa or treatment].** [Duration] for [price], booked for the time that suits you.

**[An experience in the area].** [What it is], with [partner or guide].

[Book my extras]({{book}})

We'll have everything ready when you arrive.

The {{venue}} team`,
		},
		es: {
			title: "Antes de la llegada: cena, spa y experiencias",
			when: "3 días antes de la llegada",
			subject: "Reserva tu mesa en {{venue}} antes de llegar",
			previewText: "Las noches se llenan rápido. Asegura la tuya",
			markdown: `Hola {{first_name|de nuevo}},

Las mejores mesas y tratamientos son los primeros en volar, así que esto es lo que puedes reservar ya para tu estancia en {{venue}}:

**Cena en [nombre del restaurante].** [Una línea sobre la carta o el chef]. Mesas desde las [hora].

**[Spa o tratamiento].** [Duración] por [precio], a la hora que mejor te venga.

**[Una experiencia en la zona].** [Qué es], con [socio o guía].

[Reservar mis extras]({{book}})

Lo tendremos todo listo cuando llegues.

El equipo de {{venue}}`,
		},
	},
	{
		id: "direct-booking-return",
		kind: "hotel",
		goal: "direct",
		en: {
			title: "Come back for less, booking direct",
			when: "3 to 6 months after a stay",
			subject: "Come back to {{venue}}, it's better booked direct",
			previewText: "[Perk] when you book on our website",
			markdown: `Hi {{first_name|there}},

It's been a while since your stay at {{venue}}, and we'd love to have you back.

When you book on our own website you get more than on any booking site:

- **The best price, guaranteed.**
- **[Perk one]**, like a welcome drink or breakfast.
- **[Perk two]**, like a late check-out or a free upgrade when there's room.

Use the code **[CODE]** for [discount] off your next stay, until [date].

[Book my next stay]({{book}})

See you again soon,

The {{venue}} team`,
		},
		es: {
			title: "Vuelve por menos, reservando directo",
			when: "De 3 a 6 meses después de la estancia",
			subject: "Vuelve a {{venue}}, mejor reservando directo",
			previewText: "[Ventaja] si reservas en nuestra web",
			markdown: `Hola {{first_name|de nuevo}},

Ha pasado un tiempo desde tu estancia en {{venue}} y nos encantaría volver a verte.

Si reservas en nuestra propia web, tienes más que en cualquier buscador:

- **El mejor precio, garantizado.**
- **[Ventaja uno]**, como una bebida de bienvenida o el desayuno.
- **[Ventaja dos]**, como salida tardía o mejora de habitación si hay disponibilidad.

Usa el código **[CÓDIGO]** para un [descuento] en tu próxima estancia, hasta el [fecha].

[Reservar mi próxima estancia]({{book}})

Hasta pronto,

El equipo de {{venue}}`,
		},
	},
	{
		id: "last-minute",
		kind: "hotel",
		goal: "promotion",
		en: {
			title: "Last-minute rooms",
			when: "When occupancy is low for the next days",
			subject: "Free this weekend? We still have rooms at {{venue}}",
			previewText: "[Discount] off for stays from [date] to [date]",
			markdown: `Hi {{first_name|there}},

We still have a few rooms for [dates], and we'd rather they went to someone who already knows us.

**[Discount] off** your stay if you book before [date], directly on our website.

[See the rooms]({{book}})

A short break at {{venue}}, [one line about what's on in the area those days].

The {{venue}} team`,
		},
		es: {
			title: "Habitaciones de última hora",
			when: "Cuando la ocupación de los próximos días es baja",
			subject: "¿Libre este fin de semana? Aún hay habitaciones en {{venue}}",
			previewText: "[Descuento] para estancias del [fecha] al [fecha]",
			markdown: `Hola {{first_name|de nuevo}},

Nos quedan algunas habitaciones para [fechas], y preferimos que sean para alguien que ya nos conoce.

**[Descuento]** en tu estancia si reservas antes del [fecha], directamente en nuestra web.

[Ver las habitaciones]({{book}})

Una escapada a {{venue}}, [una línea sobre lo que pasa en la zona esos días].

El equipo de {{venue}}`,
		},
	},
	{
		id: "seasonal-package",
		kind: "hotel",
		goal: "promotion",
		en: {
			title: "Seasonal getaway package",
			when: "4 to 8 weeks before a season or holiday",
			subject: "[Season] at {{venue}}: our getaway is ready",
			previewText: "[Nights], [what's included], from [price]",
			markdown: `Hi {{first_name|there}},

We've put together a getaway for [season or holiday]:

- **[Number] nights** in a [room type]
- **[Included one]**, like breakfast or a dinner for two
- **[Included two]**, like a spa session or a local experience

From **[price]** for two, for stays between [date] and [date].

[Book the getaway]({{book}})

[One line about why this season is special where we are.]

The {{venue}} team`,
		},
		es: {
			title: "Paquete de escapada de temporada",
			when: "De 4 a 8 semanas antes de una temporada o festivo",
			subject: "[Temporada] en {{venue}}: tu escapada está lista",
			previewText: "[Noches], [qué incluye], desde [precio]",
			markdown: `Hola {{first_name|de nuevo}},

Hemos preparado una escapada para [temporada o festivo]:

- **[Número] noches** en [tipo de habitación]
- **[Incluido uno]**, como el desayuno o una cena para dos
- **[Incluido dos]**, como una sesión de spa o una experiencia en la zona

Desde **[precio]** para dos, para estancias entre el [fecha] y el [fecha].

[Reservar la escapada]({{book}})

[Una línea sobre por qué esta temporada es especial aquí.]

El equipo de {{venue}}`,
		},
	},
	{
		id: "repeat-guest",
		kind: "hotel",
		goal: "loyalty",
		en: {
			title: "For guests who come back",
			when: "To guests with 2 or more stays",
			subject: "A thank you for coming back to {{venue}}",
			previewText: "Something only for guests who know us",
			markdown: `Hi {{first_name|there}},

You've stayed with us more than once, and that means a lot to a place like {{venue}}.

For your next stay, booked directly with us:

- **[Perk]**, like a room upgrade when there's one free
- **[Perk]**, like late check-out until [time]
- **[Perk]**, like a welcome gift in your room

Just mention the code **[CODE]** when you book.

[Book my next stay]({{book}})

Thank you for choosing us again,

The {{venue}} team`,
		},
		es: {
			title: "Para los huéspedes que repiten",
			when: "A huéspedes con 2 o más estancias",
			subject: "Gracias por volver a {{venue}}",
			previewText: "Algo solo para quien ya nos conoce",
			markdown: `Hola {{first_name|de nuevo}},

Has estado con nosotros más de una vez, y eso significa mucho para un sitio como {{venue}}.

Para tu próxima estancia, reservando directamente con nosotros:

- **[Ventaja]**, como una mejora de habitación si hay alguna libre
- **[Ventaja]**, como salida tardía hasta las [hora]
- **[Ventaja]**, como un detalle de bienvenida en tu habitación

Solo menciona el código **[CÓDIGO]** al reservar.

[Reservar mi próxima estancia]({{book}})

Gracias por elegirnos otra vez,

El equipo de {{venue}}`,
		},
	},
	{
		id: "post-stay",
		kind: "hotel",
		goal: "loyalty",
		en: {
			title: "After the stay: thanks, review and a reason to return",
			when: "1 or 2 days after departure",
			subject: "Thank you for staying at {{venue}}",
			previewText: "Two minutes of your time, and a code for next time",
			markdown: `Hi {{first_name|there}},

Thank you for staying at {{venue}}. We hope you're home safe and already missing [something guests love about the place].

**Would you tell others how it went?** A short review helps travelers find us, and it helps us more than anything.

[Leave a review]([review link])

**For your next visit:** [discount] off when you book directly with the code **[CODE]**, valid until [date].

[Book again]({{book}})

The {{venue}} team`,
		},
		es: {
			title: "Después de la estancia: gracias, reseña y motivo para volver",
			when: "1 o 2 días después de la salida",
			subject: "Gracias por alojarte en {{venue}}",
			previewText: "Dos minutos de tu tiempo y un código para la próxima vez",
			markdown: `Hola {{first_name|de nuevo}},

Gracias por alojarte en {{venue}}. Esperamos que hayas llegado bien a casa y que ya eches de menos [algo que los huéspedes adoran del sitio].

**¿Nos cuentas qué tal?** Una reseña breve ayuda a otros viajeros a encontrarnos, y a nosotros más que nada.

[Dejar una reseña]([enlace a la reseña])

**Para tu próxima visita:** [descuento] si reservas directamente con el código **[CÓDIGO]**, válido hasta el [fecha].

[Volver a reservar]({{book}})

El equipo de {{venue}}`,
		},
	},
	{
		id: "celebration",
		kind: "hotel",
		goal: "upsell",
		en: {
			title: "Celebrate with us: birthdays and anniversaries",
			when: "4 weeks before a birthday or anniversary you know of",
			subject: "Celebrate your [occasion] at {{venue}}",
			previewText: "We take care of the details",
			markdown: `Hi {{first_name|there}},

A [birthday or anniversary] is coming up, and we'd love to help you celebrate it.

Our celebration stay includes:

- **[Room type]** with [detail], like flowers or cava waiting for you
- **[Dinner, cake or experience]**
- **[Late check-out]** to make the morning last

From **[price]** for two.

[Plan my celebration]({{book}})

The {{venue}} team`,
		},
		es: {
			title: "Celébralo con nosotros: cumpleaños y aniversarios",
			when: "4 semanas antes de un cumpleaños o aniversario que conozcas",
			subject: "Celebra tu [ocasión] en {{venue}}",
			previewText: "Nosotros nos ocupamos de los detalles",
			markdown: `Hola {{first_name|de nuevo}},

Se acerca tu [cumpleaños o aniversario], y nos encantaría ayudarte a celebrarlo.

Nuestra estancia de celebración incluye:

- **[Tipo de habitación]** con [detalle], como flores o cava esperándote
- **[Cena, tarta o experiencia]**
- **[Salida tardía]** para alargar la mañana

Desde **[precio]** para dos.

[Organizar mi celebración]({{book}})

El equipo de {{venue}}`,
		},
	},
	{
		id: "weekday-menu",
		kind: "restaurant",
		goal: "promotion",
		en: {
			title: "Weekday menu",
			when: "Monday or Tuesday morning",
			subject: "This week's lunch menu at {{venue}}",
			previewText: "[Courses] for [price], Monday to Friday",
			markdown: `Hi {{first_name|there}},

This week at {{venue}}, our lunch menu:

- **To start:** [dish]
- **Main:** [dish] or [dish]
- **Dessert:** [dish]

**[Price]** with [drink, bread or coffee], from Monday to Friday, [time] to [time].

[Book a table]({{book}})

See you at lunch,

The {{venue}} team`,
		},
		es: {
			title: "Menú de mediodía entre semana",
			when: "Lunes o martes por la mañana",
			subject: "El menú de esta semana en {{venue}}",
			previewText: "[Platos] por [precio], de lunes a viernes",
			markdown: `Hola {{first_name|de nuevo}},

Esta semana en {{venue}}, nuestro menú de mediodía:

- **Para empezar:** [plato]
- **Principal:** [plato] o [plato]
- **Postre:** [plato]

**[Precio]** con [bebida, pan o café], de lunes a viernes, de [hora] a [hora].

[Reservar mesa]({{book}})

Nos vemos a mediodía,

El equipo de {{venue}}`,
		},
	},
	{
		id: "tasting-menu",
		kind: "restaurant",
		goal: "upsell",
		en: {
			title: "New tasting menu",
			when: "When the menu changes",
			subject: "Our new tasting menu at {{venue}}",
			previewText: "[Courses], [season] produce, with or without pairing",
			markdown: `Hi {{first_name|there}},

Our new tasting menu is here: [number] courses built around [season or produce].

[One or two lines about the dish you're proudest of.]

**[Price]** per person, and **[price]** with the wine pairing.

Tables are limited, so book early.

[Book the tasting menu]({{book}})

The {{venue}} team`,
		},
		es: {
			title: "Nuevo menú degustación",
			when: "Cuando cambia la carta",
			subject: "Nuestro nuevo menú degustación en {{venue}}",
			previewText: "[Pases], producto de [temporada], con o sin maridaje",
			markdown: `Hola {{first_name|de nuevo}},

Ya está aquí nuestro nuevo menú degustación: [número] pases alrededor de [temporada o producto].

[Una o dos líneas sobre el plato del que estáis más orgullosos.]

**[Precio]** por persona, y **[precio]** con el maridaje.

Las mesas son pocas, así que mejor reservar pronto.

[Reservar el menú degustación]({{book}})

El equipo de {{venue}}`,
		},
	},
	{
		id: "private-events",
		kind: "restaurant",
		goal: "cross-sell",
		en: {
			title: "Groups and private events",
			when: "6 to 8 weeks before the holidays or the event season",
			subject: "Your next celebration, at {{venue}}",
			previewText: "Menus for groups of [number] to [number]",
			markdown: `Hi {{first_name|there}},

Planning a [company dinner, birthday or celebration]? At {{venue}} we have:

- **[Space]** for up to [number] people
- **Group menus** from [price] per person
- **[Extra]**, like a welcome drink or a personalized menu

Tell us the date and how many you are, and we'll send you a proposal.

[Ask for a proposal]({{book}})

The {{venue}} team`,
		},
		es: {
			title: "Grupos y eventos privados",
			when: "De 6 a 8 semanas antes de las fiestas o la temporada de eventos",
			subject: "Tu próxima celebración, en {{venue}}",
			previewText: "Menús para grupos de [número] a [número]",
			markdown: `Hola {{first_name|de nuevo}},

¿Preparas una [cena de empresa, cumpleaños o celebración]? En {{venue}} tenemos:

- **[Espacio]** para hasta [número] personas
- **Menús de grupo** desde [precio] por persona
- **[Extra]**, como una bebida de bienvenida o una carta personalizada

Dinos la fecha y cuántos sois, y te enviamos una propuesta.

[Pedir una propuesta]({{book}})

El equipo de {{venue}}`,
		},
	},
	{
		id: "regulars",
		kind: "restaurant",
		goal: "loyalty",
		en: {
			title: "For our regulars",
			when: "Once a quarter",
			subject: "Something for our regulars at {{venue}}",
			previewText: "[Perk] on your next visit",
			markdown: `Hi {{first_name|there}},

You come back, and we notice. Thank you.

On your next visit to {{venue}}, **[perk]**, like a glass of cava or dessert on us. Show this email or mention the code **[CODE]**, until [date].

[Book a table]({{book}})

The {{venue}} team`,
		},
		es: {
			title: "Para nuestros clientes habituales",
			when: "Una vez al trimestre",
			subject: "Algo para nuestros habituales en {{venue}}",
			previewText: "[Detalle] en tu próxima visita",
			markdown: `Hola {{first_name|de nuevo}},

Vuelves, y lo notamos. Gracias.

En tu próxima visita a {{venue}}, **[detalle]**, como una copa de cava o el postre invita la casa. Enseña este correo o di el código **[CÓDIGO]**, hasta el [fecha].

[Reservar mesa]({{book}})

El equipo de {{venue}}`,
		},
	},
	{
		id: "business-offer",
		kind: "other",
		goal: "promotion",
		en: {
			title: "A limited offer for your customers",
			when: "Once a month, or before a busy season",
			subject: "Something for you this week at {{venue}}",
			previewText: "[Discount] until [date], only for our customers",
			markdown: `Hi {{first_name|there}},

This week we have something for the people who already know us:

**[Discount or offer]** on [product or service], until [date].

Use the code **[CODE]** or just mention this email.

[See the offer]({{book}})

Thank you for being with us,

The {{venue}} team`,
		},
		es: {
			title: "Una oferta limitada para tus clientes",
			when: "Una vez al mes, o antes de una temporada fuerte",
			subject: "Algo para ti esta semana en {{venue}}",
			previewText: "[Descuento] hasta el [fecha], solo para clientes",
			markdown: `Hola {{first_name|de nuevo}},

Esta semana tenemos algo para quienes ya nos conocen:

**[Descuento u oferta]** en [producto o servicio], hasta el [fecha].

Usa el código **[CÓDIGO]** o menciona este correo.

[Ver la oferta]({{book}})

Gracias por estar ahí,

El equipo de {{venue}}`,
		},
	},
	{
		id: "business-news",
		kind: "other",
		goal: "cross-sell",
		en: {
			title: "What's new: a product or service",
			when: "When you launch something",
			subject: "New at {{venue}}: [what it is]",
			previewText: "[One line on why it's worth a look]",
			markdown: `Hi {{first_name|there}},

We've just launched **[product or service]**.

[Two or three lines: what it is, who it's for, what problem it solves.]

- **[Benefit one]**
- **[Benefit two]**
- **[Price or how to get it]**

[Find out more]({{book}})

The {{venue}} team`,
		},
		es: {
			title: "Novedad: un producto o servicio",
			when: "Cuando lances algo",
			subject: "Nuevo en {{venue}}: [qué es]",
			previewText: "[Una línea sobre por qué merece la pena]",
			markdown: `Hola {{first_name|de nuevo}},

Acabamos de lanzar **[producto o servicio]**.

[Dos o tres líneas: qué es, para quién es, qué resuelve.]

- **[Ventaja uno]**
- **[Ventaja dos]**
- **[Precio o cómo conseguirlo]**

[Saber más]({{book}})

El equipo de {{venue}}`,
		},
	},
	{
		id: "business-thanks",
		kind: "other",
		goal: "loyalty",
		en: {
			title: "Thank you to loyal customers",
			when: "Once a quarter, to people who bought more than once",
			subject: "A thank you from {{venue}}",
			previewText: "[Perk] for coming back",
			markdown: `Hi {{first_name|there}},

You keep choosing us, and we notice. Thank you.

As a thank you, **[perk]** on your next [order, visit or booking], with the code **[CODE]**, until [date].

[Use my thank you]({{book}})

The {{venue}} team`,
		},
		es: {
			title: "Gracias a los clientes fieles",
			when: "Una vez al trimestre, a quien compró más de una vez",
			subject: "Un gracias de parte de {{venue}}",
			previewText: "[Detalle] por volver",
			markdown: `Hola {{first_name|de nuevo}},

Sigues eligiéndonos, y lo notamos. Gracias.

Como agradecimiento, **[detalle]** en tu próximo [pedido, visita o reserva], con el código **[CÓDIGO]**, hasta el [fecha].

[Usar mi regalo]({{book}})

El equipo de {{venue}}`,
		},
	},
];

// A template as a draft for one venue: its name and its booking link in place, the rest for the owner to fill. Without a
// booking link, the button turns into bold text with a note to add it: a link to nowhere would show as raw Markdown.
export function fillTemplate(template, language, { venue, bookingUrl }) {
	const text = template[language] ?? template.en;
	const note = language === "es" ? "[añade tu enlace de reservas]" : "[add your booking link]";
	const fill = (value) =>
		value
			.replaceAll("{{venue}}", venue)
			.replace(/\[([^\]]+)\]\(\{\{book\}\}\)/g, (_, label) => (bookingUrl ? `[${label}](${bookingUrl})` : `**${label}** ${note}`))
			.replaceAll("{{book}}", bookingUrl || note);
	return { subject: fill(text.subject), previewText: fill(text.previewText), markdown: fill(text.markdown) };
}

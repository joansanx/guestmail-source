// guestmail: the automations an owner starts from (create_automation's template), in English and Spanish, the venue's
// language picked like the hotel's automatic emails (lib/venue-legal.js getVenueLanguage). Each email is filled like a
// campaign template (lib/campaign-templates.js fillTemplate): {{venue}} and {{book}} become the venue's name and booking
// link, and the [square brackets] are for the owner to fill in. An automation doesn't turn on with one left in its
// emails. Nothing here states a fact about the venue: a perk, a price or a place is always a bracket.
const blank = {
	id: "blank",
	en: { name: "New automation" },
	es: { name: "Nueva automatización" },
	trigger: { type: "join" },
	steps: [],
};

const welcome = {
	id: "welcome",
	en: { name: "Welcome series" },
	es: { name: "Serie de bienvenida" },
	trigger: { type: "join" },
	steps: [
		{
			id: "welcome",
			type: "email",
			en: {
				subject: "Welcome to {{venue}}",
				previewText: "Glad you're here",
				markdown: `Hi {{first_name|there}},

Thanks for joining the {{venue}} list. From now on you'll be among the first to hear about [what you'll send: offers, events, news].

A little about us: [one or two lines about what makes your place special].

[Book with us]({{book}})

See you soon,

The {{venue}} team`,
			},
			es: {
				subject: "Te damos la bienvenida a {{venue}}",
				previewText: "Nos alegra tenerte aquí",
				markdown: `Hola {{first_name|y gracias por apuntarte}},

Ya formas parte de la lista de {{venue}}. A partir de ahora serás de los primeros en enterarte de [lo que vas a enviar: ofertas, eventos, novedades].

Un poco sobre nosotros: [una o dos líneas sobre lo que hace especial tu casa].

[Reserva con nosotros]({{book}})

Hasta pronto,

El equipo de {{venue}}`,
			},
		},
		{ id: "wait-1", type: "wait", amount: 2, unit: "days" },
		{
			id: "favourites",
			type: "email",
			en: {
				subject: "What our guests love at {{venue}}",
				previewText: "Three things not to miss",
				markdown: `Hi {{first_name|there}},

Three things our guests come back for:

**[First favourite].** [A line about it.]

**[Second favourite].** [A line about it.]

**[Third favourite].** [A line about it.]

[Plan your visit]({{book}})

The {{venue}} team`,
			},
			es: {
				subject: "Lo que más gusta de {{venue}}",
				previewText: "Tres cosas que no te puedes perder",
				markdown: `Hola {{first_name|de nuevo}},

Tres cosas por las que nuestros clientes vuelven:

**[Primera favorita].** [Una línea sobre ella.]

**[Segunda favorita].** [Una línea sobre ella.]

**[Tercera favorita].** [Una línea sobre ella.]

[Planea tu visita]({{book}})

El equipo de {{venue}}`,
			},
		},
		{ id: "wait-2", type: "wait", amount: 3, unit: "days" },
		{ id: "opened", type: "condition", check: "opened", email: "favourites" },
		{
			id: "book-direct",
			type: "email",
			parent: "opened",
			branch: "yes",
			en: {
				subject: "A reason to book direct with {{venue}}",
				previewText: "Only for people on our list",
				markdown: `Hi {{first_name|there}},

When you book directly with us, you get [your direct booking perk, like a better rate, breakfast or late check-out].

[Book direct]({{book}})

Any question, just reply to this email.

The {{venue}} team`,
			},
			es: {
				subject: "Un motivo para reservar directo en {{venue}}",
				previewText: "Solo para quien está en nuestra lista",
				markdown: `Hola {{first_name|de nuevo}},

Cuando reservas directamente con nosotros, tienes [tu ventaja por reservar directo, como mejor precio, desayuno o salida tardía].

[Reservar directo]({{book}})

Si tienes cualquier pregunta, responde a este correo.

El equipo de {{venue}}`,
			},
		},
		{
			id: "still-there",
			type: "email",
			parent: "opened",
			branch: "no",
			en: {
				subject: "Still thinking about {{venue}}?",
				previewText: "We kept something for you",
				markdown: `Hi {{first_name|there}},

We'd love to see you at {{venue}}. [One line with a reason to come: a season, an event, a new menu.]

[See what's on]({{book}})

The {{venue}} team`,
			},
			es: {
				subject: "¿Sigues pensando en {{venue}}?",
				previewText: "Te guardamos algo",
				markdown: `Hola {{first_name|de nuevo}},

Nos encantaría verte en {{venue}}. [Una línea con un motivo para venir: una temporada, un evento, una carta nueva.]

[Ver qué hay]({{book}})

El equipo de {{venue}}`,
			},
		},
	],
};

const leadMagnet = {
	id: "lead_magnet",
	en: { name: "Lead magnet" },
	es: { name: "Imán: envía la guía" },
	trigger: { type: "join" },
	steps: [
		{
			id: "guide",
			type: "email",
			en: {
				subject: "Your guide to [destination]",
				previewText: "As promised, here it is",
				markdown: `Hi {{first_name|there}},

Here's the guide you asked for: [Download the guide]([link to the guide])

Inside: [what's in it, in one line].

Enjoy it,

The {{venue}} team`,
			},
			es: {
				subject: "Tu guía de [destino]",
				previewText: "Lo prometido, aquí la tienes",
				markdown: `Hola {{first_name|y gracias por apuntarte}},

Aquí tienes la guía que pediste: [Descargar la guía]([enlace a la guía])

Dentro encontrarás [lo que incluye, en una línea].

Que la disfrutes,

El equipo de {{venue}}`,
			},
		},
		{ id: "wait", type: "wait", amount: 3, unit: "days" },
		{
			id: "follow-up",
			type: "email",
			en: {
				subject: "Did the guide help?",
				previewText: "And a place to stay while you're there",
				markdown: `Hi {{first_name|there}},

We hope the guide helps you plan [your trip]. When you're ready, book directly with {{venue}} for [your direct booking perk].

[Book direct]({{book}})

The {{venue}} team`,
			},
			es: {
				subject: "¿Te ha servido la guía?",
				previewText: "Y un sitio donde quedarte cuando vengas",
				markdown: `Hola {{first_name|de nuevo}},

Esperamos que la guía te ayude a planear [tu viaje]. Cuando quieras, reserva directamente en {{venue}} y tendrás [tu ventaja por reservar directo].

[Reservar directo]({{book}})

El equipo de {{venue}}`,
			},
		},
	],
};

function lesson(number, en, es) {
	return {
		id: `lesson-${number}`,
		type: "email",
		en: {
			subject: `Lesson ${number} of 3: [${en}]`,
			previewText: "[One line on what this lesson gives them]",
			markdown: `Hi {{first_name|there}},

[What this lesson teaches, in a few short paragraphs.]

${number === 3 ? "That's the course. When you want to put it into practice, we're here: [Book with us]({{book}})" : "Tomorrow: [the next lesson's topic]."}

The {{venue}} team`,
		},
		es: {
			subject: `Lección ${number} de 3: [${es}]`,
			previewText: "[Una línea sobre lo que les da esta lección]",
			markdown: `Hola {{first_name|de nuevo}},

[Lo que enseña esta lección, en unos pocos párrafos cortos.]

${number === 3 ? "Hasta aquí el curso. Cuando quieras ponerlo en práctica, aquí estamos: [Reserva con nosotros]({{book}})" : "Mañana: [el tema de la próxima lección]."}

El equipo de {{venue}}`,
		},
	};
}

const course = {
	id: "course",
	en: { name: "Email course" },
	es: { name: "Curso por correo" },
	trigger: { type: "tag", tag: "course" },
	steps: [
		lesson(1, "first topic", "primer tema"),
		{ id: "wait-1", type: "wait", amount: 1, unit: "days" },
		lesson(2, "second topic", "segundo tema"),
		{ id: "wait-2", type: "wait", amount: 1, unit: "days" },
		lesson(3, "third topic", "tercer tema"),
	],
};

export const AUTOMATION_TEMPLATES = [welcome, leadMagnet, course, blank];
export const AUTOMATION_TEMPLATE_IDS = AUTOMATION_TEMPLATES.map(({ id }) => id);

export function getAutomationTemplate(id) {
	return AUTOMATION_TEMPLATES.find((template) => template.id === id) ?? null;
}

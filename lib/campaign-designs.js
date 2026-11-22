import { isButtonLink } from "./buttons.js";
import { findStockPhoto, getStockImage } from "./stock-photos.js";

// guestmail: designed emails for hotels and restaurants, in English and Spanish: a header with the venue's name, a banner,
// rows of photos and a button, laid out with the editor's own blocks (lib/layout-blocks.js), so a draft made from one
// opens in the editor like any other. The photos are GuestMail's own (lib/stock-photos.js), there to be swapped. As in
// the text templates (lib/campaign-templates.js), whose words these reuse, square brackets are for the owner to fill and
// nothing is invented: a design never states a price, a date or a perk the venue didn't choose. Both languages share a
// design's blocks, so they can't drift apart.

// The editor's HTML, written as the editor writes it (tests/campaign-designs.test.mjs opens and saves each one).
const h1 = (text) => `<h1>${text}</h1>`;
const p = (text) => `<p>${text}</p>`;
const list = (items) => `<ul>${items.map((item) => `<li><p>${item}</p></li>`).join("")}</ul>`;
const box = (...blocks) => `<div data-callout="">${blocks.join("")}</div>`;
const button = (label) => `<div data-button=""><a href="{{book}}">${label}</a></div>`;
const HEADER = '<div data-header=""><p>{{venue}}</p></div>';
const DIVIDER = "<hr>";
// columns: [photo id, title, text] each.
const row = (image, columns) =>
	`<div data-columns="${columns.length}">${columns.map(([id, title, text]) => `<div data-column="">${image(id)}<p><strong>${title}</strong></p><p>${text}</p></div>`).join("")}</div>`;

// What each design is made of, for a gallery or an agent to tell them apart without reading the HTML.
const BLOCKS = { header: "header", banner: "banner", photos2: "2 photos", photos3: "3 photos", box: "box", button: "button", divider: "divider" };

export const CAMPAIGN_DESIGNS = [
	{
		id: "design-hotel-news",
		kind: "hotel",
		goal: "loyalty",
		blocks: [BLOCKS.header, BLOCKS.banner, BLOCKS.photos3, BLOCKS.button, BLOCKS.divider],
		build: (t, image) => [
			HEADER,
			image("pool-garden"),
			h1(t.headline),
			p(t.hello),
			p(t.intro),
			row(image, [
				["room-suite-sofa", t.oneTitle, t.line],
				["breakfast-terrace", t.twoTitle, t.line],
				["spa-treatment-room", t.threeTitle, t.line],
			]),
			button(t.cta),
			DIVIDER,
			p(t.bye),
			p(t.team),
		],
		en: {
			title: "News with three photos",
			when: "Once a month, or when something changes",
			subject: "What's new at {{venue}}",
			previewText: "[Three reasons to come back]",
			headline: "What's new at {{venue}}",
			hello: "Hi {{first_name|there}},",
			intro: "[Two lines on what has changed since their last stay: a season, a renovation, a new service.]",
			oneTitle: "[A room or a space]",
			twoTitle: "[Something to eat or drink]",
			threeTitle: "[An experience]",
			line: "[One line about it.]",
			cta: "Book your stay",
			bye: "See you soon,",
			team: "The {{venue}} team",
		},
		es: {
			title: "Novedades con tres fotos",
			when: "Una vez al mes, o cuando haya novedades",
			subject: "Novedades en {{venue}}",
			previewText: "[Tres motivos para volver]",
			headline: "Novedades en {{venue}}",
			hello: "Hola {{first_name|de nuevo}},",
			intro: "[Dos líneas sobre lo que ha cambiado desde su última estancia: una temporada, una reforma, un servicio nuevo.]",
			oneTitle: "[Una habitación o un espacio]",
			twoTitle: "[Algo para comer o beber]",
			threeTitle: "[Una experiencia]",
			line: "[Una línea sobre ello.]",
			cta: "Reservar mi estancia",
			bye: "Nos vemos pronto,",
			team: "El equipo de {{venue}}",
		},
	},
	{
		id: "design-hotel-season-offer",
		kind: "hotel",
		goal: "promotion",
		blocks: [BLOCKS.header, BLOCKS.banner, BLOCKS.box, BLOCKS.button, BLOCKS.photos2],
		build: (t, image) => [
			HEADER,
			image("beach-golden"),
			h1(t.headline),
			p(t.hello),
			p(t.intro),
			box(list([t.nights, t.includedOne, t.includedTwo]), p(t.price)),
			button(t.cta),
			row(image, [
				["room-white-linen", t.oneTitle, t.line],
				["dinner-candles", t.twoTitle, t.line],
			]),
			p(t.why),
			p(t.team),
		],
		en: {
			title: "Seasonal offer",
			when: "4 to 8 weeks before a season or holiday",
			subject: "[Season] at {{venue}}: our getaway is ready",
			previewText: "[Nights], [what's included], from [price]",
			headline: "[Season] at {{venue}}",
			hello: "Hi {{first_name|there}},",
			intro: "We've put together a getaway for [season or holiday]:",
			nights: "<strong>[Number] nights</strong> in a [room type]",
			includedOne: "<strong>[Included one]</strong>, like breakfast or a dinner for two",
			includedTwo: "<strong>[Included two]</strong>, like a spa session or a local experience",
			price: "From <strong>[price]</strong> for two, for stays between [date] and [date].",
			cta: "Book the getaway",
			oneTitle: "[The room]",
			twoTitle: "[What's included]",
			line: "[One line about it.]",
			why: "[One line about why this season is special where we are.]",
			team: "The {{venue}} team",
		},
		es: {
			title: "Oferta de temporada",
			when: "De 4 a 8 semanas antes de una temporada o festivo",
			subject: "[Temporada] en {{venue}}: tu escapada está lista",
			previewText: "[Noches], [qué incluye], desde [precio]",
			headline: "[Temporada] en {{venue}}",
			hello: "Hola {{first_name|de nuevo}},",
			intro: "Hemos preparado una escapada para [temporada o festivo]:",
			nights: "<strong>[Número] noches</strong> en [tipo de habitación]",
			includedOne: "<strong>[Incluido uno]</strong>, como el desayuno o una cena para dos",
			includedTwo: "<strong>[Incluido dos]</strong>, como una sesión de spa o una experiencia en la zona",
			price: "Desde <strong>[precio]</strong> para dos, para estancias entre el [fecha] y el [fecha].",
			cta: "Reservar la escapada",
			oneTitle: "[La habitación]",
			twoTitle: "[Qué incluye]",
			line: "[Una línea sobre ello.]",
			why: "[Una línea sobre por qué esta temporada es especial aquí.]",
			team: "El equipo de {{venue}}",
		},
	},
	{
		id: "design-hotel-pre-arrival",
		kind: "hotel",
		goal: "upsell",
		blocks: [BLOCKS.header, BLOCKS.banner, BLOCKS.photos3, BLOCKS.button],
		build: (t, image) => [
			HEADER,
			image("room-bright"),
			h1(t.headline),
			p(t.hello),
			p(t.intro),
			row(image, [
				["room-suite-sofa", t.oneTitle, t.oneText],
				["reception-bell", t.twoTitle, t.twoText],
				["breakfast-spread", t.threeTitle, t.threeText],
			]),
			button(t.cta),
			p(t.bye),
			p(t.team),
		],
		en: {
			title: "Before the arrival",
			when: "5 days before arrival",
			subject: "Your stay at {{venue}} starts in a few days",
			previewText: "A bigger room, an earlier arrival or a later goodbye",
			headline: "Your stay starts in a few days",
			hello: "Hi {{first_name|there}},",
			intro: "We're getting your room ready. Before you arrive, three ways to make more of your stay at {{venue}}:",
			oneTitle: "A room with more space",
			oneText: "Move up to a [room type] for [price] more per night.",
			twoTitle: "Arrive early, leave late",
			twoText: "Check in from [time] or check out at [time], for [price] each.",
			threeTitle: "Breakfast waiting for you",
			threeText: "Add breakfast for [price] per person and start the day without plans.",
			cta: "Add it to my booking",
			bye: "Just reply to this email if you'd like any of them. See you soon,",
			team: "The {{venue}} team",
		},
		es: {
			title: "Antes de la llegada",
			when: "5 días antes de la llegada",
			subject: "Tu estancia en {{venue}} empieza en unos días",
			previewText: "Una habitación mejor, llegar antes o irte más tarde",
			headline: "Tu estancia empieza en unos días",
			hello: "Hola {{first_name|de nuevo}},",
			intro: "Ya estamos preparando tu habitación. Antes de que llegues, tres maneras de aprovechar más tu estancia en {{venue}}:",
			oneTitle: "Una habitación con más espacio",
			oneText: "Pasa a una [tipo de habitación] por [precio] más por noche.",
			twoTitle: "Llega antes, vete más tarde",
			twoText: "Entrada desde las [hora] o salida a las [hora], por [precio] cada una.",
			threeTitle: "El desayuno, ya reservado",
			threeText: "Añádelo por [precio] por persona y empieza el día sin planes.",
			cta: "Añadir a mi reserva",
			bye: "Si quieres alguna, responde a este correo. Nos vemos pronto,",
			team: "El equipo de {{venue}}",
		},
	},
	{
		id: "design-hotel-event",
		kind: "hotel",
		goal: "promotion",
		blocks: [BLOCKS.header, BLOCKS.banner, BLOCKS.box, BLOCKS.button, BLOCKS.photos2],
		build: (t, image) => [
			HEADER,
			image("dinner-long-table"),
			h1(t.headline),
			p(t.hello),
			p(t.intro),
			box(p(t.date), p(t.place), p(t.price)),
			button(t.cta),
			row(image, [
				["champagne", t.oneTitle, t.oneText],
				["terrace-rooftop", t.twoTitle, t.twoText],
			]),
			p(t.team),
		],
		en: {
			title: "An event at the hotel",
			when: "2 to 3 weeks before the date",
			subject: "[Event name] at {{venue}}, [date]",
			previewText: "[One line on what will happen that day]",
			headline: "[Event name]",
			hello: "Hi {{first_name|there}},",
			intro: "[Two lines: what it is, who it's for and why it's worth the evening.]",
			date: "<strong>When:</strong> [day and date], [time]",
			place: "<strong>Where:</strong> [room, terrace or garden] at {{venue}}",
			price: "<strong>Price:</strong> [price] per person, with [what it includes]",
			cta: "Save my place",
			oneTitle: "[A detail of the evening]",
			oneText: "[One line about it.]",
			twoTitle: "[Stay the night]",
			twoText: "[The room rate for that night, if you offer one.]",
			team: "The {{venue}} team",
		},
		es: {
			title: "Un evento en el hotel",
			when: "De 2 a 3 semanas antes de la fecha",
			subject: "[Nombre del evento] en {{venue}}, [fecha]",
			previewText: "[Una línea sobre lo que pasará ese día]",
			headline: "[Nombre del evento]",
			hello: "Hola {{first_name|de nuevo}},",
			intro: "[Dos líneas: qué es, para quién es y por qué merece la noche.]",
			date: "<strong>Cuándo:</strong> [día y fecha], [hora]",
			place: "<strong>Dónde:</strong> [salón, terraza o jardín] de {{venue}}",
			price: "<strong>Precio:</strong> [precio] por persona, con [qué incluye]",
			cta: "Reservar mi plaza",
			oneTitle: "[Un detalle de la noche]",
			oneText: "[Una línea sobre ello.]",
			twoTitle: "[Quédate a dormir]",
			twoText: "[La tarifa de habitación para esa noche, si la ofrecéis.]",
			team: "El equipo de {{venue}}",
		},
	},
	{
		id: "design-restaurant-new-menu",
		kind: "restaurant",
		goal: "upsell",
		blocks: [BLOCKS.header, BLOCKS.banner, BLOCKS.photos3, BLOCKS.button],
		build: (t, image) => [
			HEADER,
			image("dish-plated"),
			h1(t.headline),
			p(t.hello),
			p(t.intro),
			row(image, [
				["dish-fish", t.dish, t.line],
				["pasta-plate", t.dish, t.line],
				["tapas-table", t.dish, t.line],
			]),
			button(t.cta),
			p(t.team),
		],
		en: {
			title: "New menu",
			when: "When the menu changes",
			subject: "The new menu at {{venue}}",
			previewText: "[Season] produce and [number] new dishes",
			headline: "Our new menu is here",
			hello: "Hi {{first_name|there}},",
			intro: "[Two lines about what changes: the season, the produce, the idea behind it.]",
			dish: "[Dish name]",
			line: "[What it is, in one line.]",
			cta: "Book a table",
			team: "The {{venue}} team",
		},
		es: {
			title: "Carta nueva",
			when: "Cuando cambia la carta",
			subject: "La carta nueva de {{venue}}",
			previewText: "Producto de [temporada] y [número] platos nuevos",
			headline: "Ya está aquí la carta nueva",
			hello: "Hola {{first_name|de nuevo}},",
			intro: "[Dos líneas sobre lo que cambia: la temporada, el producto, la idea que hay detrás.]",
			dish: "[Nombre del plato]",
			line: "[Qué es, en una línea.]",
			cta: "Reservar mesa",
			team: "El equipo de {{venue}}",
		},
	},
	{
		id: "design-restaurant-daily-menu",
		kind: "restaurant",
		goal: "promotion",
		blocks: [BLOCKS.header, BLOCKS.banner, BLOCKS.box, BLOCKS.button, BLOCKS.photos2],
		build: (t, image) => [
			HEADER,
			image("dining-room-classic"),
			h1(t.headline),
			p(t.hello),
			p(t.intro),
			box(list([t.starter, t.main, t.dessert]), p(t.price)),
			button(t.cta),
			row(image, [
				["bread-basket", t.oneTitle, t.line],
				["coffee-espresso", t.twoTitle, t.line],
			]),
			p(t.bye),
			p(t.team),
		],
		en: {
			title: "Menu of the day",
			when: "Monday or Tuesday morning",
			subject: "This week's lunch menu at {{venue}}",
			previewText: "[Courses] for [price], Monday to Friday",
			headline: "This week's lunch menu",
			hello: "Hi {{first_name|there}},",
			intro: "This week at {{venue}}, our lunch menu:",
			starter: "<strong>To start:</strong> [dish]",
			main: "<strong>Main:</strong> [dish] or [dish]",
			dessert: "<strong>Dessert:</strong> [dish]",
			price: "<strong>[Price]</strong> with [drink, bread or coffee], from Monday to Friday, [time] to [time].",
			cta: "Book a table",
			oneTitle: "[A dish of the week]",
			twoTitle: "[The coffee or the dessert]",
			line: "[One line about it.]",
			bye: "See you at lunch,",
			team: "The {{venue}} team",
		},
		es: {
			title: "Menú del día",
			when: "Lunes o martes por la mañana",
			subject: "El menú de esta semana en {{venue}}",
			previewText: "[Platos] por [precio], de lunes a viernes",
			headline: "El menú de esta semana",
			hello: "Hola {{first_name|de nuevo}},",
			intro: "Esta semana en {{venue}}, nuestro menú de mediodía:",
			starter: "<strong>Para empezar:</strong> [plato]",
			main: "<strong>Principal:</strong> [plato] o [plato]",
			dessert: "<strong>Postre:</strong> [plato]",
			price: "<strong>[Precio]</strong> con [bebida, pan o café], de lunes a viernes, de [hora] a [hora].",
			cta: "Reservar mesa",
			oneTitle: "[Un plato de la semana]",
			twoTitle: "[El café o el postre]",
			line: "[Una línea sobre ello.]",
			bye: "Nos vemos a mediodía,",
			team: "El equipo de {{venue}}",
		},
	},
	{
		id: "design-restaurant-event",
		kind: "restaurant",
		goal: "promotion",
		blocks: [BLOCKS.header, BLOCKS.banner, BLOCKS.box, BLOCKS.button, BLOCKS.photos2],
		build: (t, image) => [
			HEADER,
			image("wine-barrels"),
			h1(t.headline),
			p(t.hello),
			p(t.intro),
			box(p(t.date), p(t.menu), p(t.price)),
			button(t.cta),
			row(image, [
				["wine-glasses", t.oneTitle, t.line],
				["tapas-spread", t.twoTitle, t.line],
			]),
			p(t.team),
		],
		en: {
			title: "An evening at the restaurant",
			when: "2 to 3 weeks before the date",
			subject: "[Event name] at {{venue}}, [date]",
			previewText: "[One line on what will be served that evening]",
			headline: "[Event name]",
			hello: "Hi {{first_name|there}},",
			intro: "[Two lines: what the evening is, who cooks or pours, and why it's worth it.]",
			date: "<strong>When:</strong> [day and date], [time]",
			menu: "<strong>The menu:</strong> [number] courses, with [wines or drinks]",
			price: "<strong>Price:</strong> [price] per person",
			cta: "Reserve my seat",
			oneTitle: "[The wines or the guest]",
			twoTitle: "[The menu]",
			line: "[One line about it.]",
			team: "The {{venue}} team",
		},
		es: {
			title: "Una noche especial en el restaurante",
			when: "De 2 a 3 semanas antes de la fecha",
			subject: "[Nombre del evento] en {{venue}}, [fecha]",
			previewText: "[Una línea sobre lo que se servirá esa noche]",
			headline: "[Nombre del evento]",
			hello: "Hola {{first_name|de nuevo}},",
			intro: "[Dos líneas: qué es la noche, quién cocina o sirve los vinos y por qué merece la pena.]",
			date: "<strong>Cuándo:</strong> [día y fecha], [hora]",
			menu: "<strong>El menú:</strong> [número] pases, con [vinos o bebidas]",
			price: "<strong>Precio:</strong> [precio] por persona",
			cta: "Reservar mi sitio",
			oneTitle: "[Los vinos o el invitado]",
			twoTitle: "[El menú]",
			line: "[Una línea sobre ello.]",
			team: "El equipo de {{venue}}",
		},
	},
	{
		id: "design-business-news",
		kind: "other",
		goal: "cross-sell",
		blocks: [BLOCKS.header, BLOCKS.banner, BLOCKS.photos2, BLOCKS.button],
		build: (t, image) => [
			HEADER,
			image("flowers-tulips"),
			h1(t.headline),
			p(t.hello),
			p(t.launch),
			p(t.intro),
			row(image, [
				["coffee-espresso", t.oneTitle, t.line],
				["mountain-lake", t.twoTitle, t.line],
			]),
			p(t.price),
			button(t.cta),
			p(t.team),
		],
		en: {
			title: "What's new, with photos",
			when: "When you launch something",
			subject: "New at {{venue}}: [what it is]",
			previewText: "[One line on why it's worth a look]",
			headline: "[What's new]",
			hello: "Hi {{first_name|there}},",
			launch: "We've just launched <strong>[product or service]</strong>.",
			intro: "[Two or three lines: what it is, who it's for, what problem it solves.]",
			oneTitle: "[Benefit one]",
			twoTitle: "[Benefit two]",
			line: "[One line about it.]",
			price: "<strong>[Price or how to get it]</strong>",
			cta: "Find out more",
			team: "The {{venue}} team",
		},
		es: {
			title: "Novedad, con fotos",
			when: "Cuando lances algo",
			subject: "Nuevo en {{venue}}: [qué es]",
			previewText: "[Una línea sobre por qué merece la pena]",
			headline: "[La novedad]",
			hello: "Hola {{first_name|de nuevo}},",
			launch: "Acabamos de lanzar <strong>[producto o servicio]</strong>.",
			intro: "[Dos o tres líneas: qué es, para quién es, qué resuelve.]",
			oneTitle: "[Ventaja uno]",
			twoTitle: "[Ventaja dos]",
			line: "[Una línea sobre ello.]",
			price: "<strong>[Precio o cómo conseguirlo]</strong>",
			cta: "Saber más",
			team: "El equipo de {{venue}}",
		},
	},
];

function escapeHtml(value) {
	return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function findDesign(id) {
	return CAMPAIGN_DESIGNS.find((design) => design.id === id) ?? null;
}

// The designs a venue of this kind picks from: its own and those for any business. Any other business, or one that
// hasn't said what it is, sees them all, those for any business first.
export function listDesigns(kind) {
	const own = CAMPAIGN_DESIGNS.filter((design) => design.kind === kind);
	const general = CAMPAIGN_DESIGNS.filter((design) => design.kind === "other");
	if (kind === "hotel" || kind === "restaurant") return [...own, ...general];
	return [...general, ...CAMPAIGN_DESIGNS.filter((design) => design.kind !== "other")];
}

// A design as a draft for one venue, { subject, previewText, html }, in the editor's HTML: its name in the header and its
// booking link on the button, the rest for the owner to fill. Without a booking link the button has none, which the
// editor asks for before the campaign can go out. baseUrl: where the photos load from (getStockPhotoUrl).
export function fillDesign(design, language, { venue, bookingUrl, baseUrl }) {
	const text = design[language];
	if (!text) throw new Error(`${design.id} has no "${language}" text`);
	const image = (id) => {
		const photo = findStockPhoto(id);
		if (!photo) throw new Error(`${design.id} uses a photo that isn't in the catalog: ${id}`);
		const { src, alt, width, height } = getStockImage(photo, { baseUrl, language });
		return `<img src="${escapeHtml(src)}" alt="${alt}" width="${width}" height="${height}">`;
	};
	const link = isButtonLink(bookingUrl) ? ` href="${escapeHtml(bookingUrl).replaceAll('"', "&quot;")}"` : "";
	const html = design
		.build(text, image)
		.join("")
		.replaceAll(' href="{{book}}"', link)
		.replaceAll("{{venue}}", escapeHtml(venue));
	const plain = (value) => value.replaceAll("{{venue}}", venue);
	return { subject: plain(text.subject), previewText: plain(text.previewText), html };
}

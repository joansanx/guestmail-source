import { CAMPAIGN_DESIGNS } from "@/lib/campaign-designs";
import { getDesignPreview } from "@/lib/design-gallery";
import { DEMO_VENUES } from "./demo-venues.js";

// guestmail: the landing's two demos and its gallery of designs. Hotel Brisa Lenta and Tres Higueras are made-up venues
// GuestMail runs as demo websites a visitor can subscribe to, their addresses in lib/marketing/demo-venues.js. The gallery shows
// each hotel and restaurant design (lib/campaign-designs.js) as one of them would send it, its [brackets] filled with
// their words, so a visitor sees a finished email and never a placeholder. Their names are the demos' h3s in
// content/site/<lang>/home.md too, which PageLanding checks against these.
export { DEMO_VENUES };

// The reader each email greets, in place of the {{first_name|...}} a send fills.
const READER = "Laura";
const FIRST_NAME = /\{\{first_name\|[^}]*\}\}/g;

// Each design's words for the gallery, over its own: what it leaves in brackets, in both languages. An array is a word
// the design reads once per column, like each photo's line, given in the columns' order.
const FILLS = {
	"design-hotel-news": {
		en: {
			previewText: "A new suite, breakfast on the terrace and a spa room",
			intro: "Since your last stay we've redone three sea-view rooms, and breakfast is served on the terrace until 12.",
			oneTitle: "The sea-view suite",
			twoTitle: "Breakfast on the terrace",
			threeTitle: "The spa room",
			line: ["A sofa at the foot of the bed and the sea from the window.", "Fruit, juice and fresh bread, from 8 to 12.", "Massages by appointment, Tuesday to Sunday."],
		},
		es: {
			subject: "Novedades en el Hotel Brisa Lenta",
			headline: "Novedades en el Hotel Brisa Lenta",
			team: "El equipo del Hotel Brisa Lenta",
			previewText: "Una suite nueva, desayuno en la terraza y una cabina de spa",
			intro: "Desde tu última estancia hemos renovado tres habitaciones con vistas al mar, y el desayuno se sirve en la terraza hasta las 12.",
			oneTitle: "La suite con vistas al mar",
			twoTitle: "Desayuno en la terraza",
			threeTitle: "La cabina de spa",
			line: ["Un sofá a los pies de la cama y el mar desde la ventana.", "Fruta, zumo y pan del día, de 8 a 12.", "Masajes con cita previa, de martes a domingo."],
		},
	},
	"design-hotel-season-offer": {
		en: {
			subject: "Autumn at {{venue}}: our getaway is ready",
			previewText: "2 nights, breakfast and a dinner for two, from €290",
			headline: "Autumn at {{venue}}",
			intro: "We've put together a getaway for the autumn weekends:",
			nights: "<strong>2 nights</strong> in a double room with a sea view",
			includedOne: "<strong>Breakfast every morning</strong>, on the terrace when the sun is out",
			includedTwo: "<strong>A dinner for two</strong> on the first night",
			price: "From <strong>€290</strong> for two, for stays between October 1 and November 30.",
			oneTitle: "The room",
			twoTitle: "The dinner",
			line: ["White linen, a wide bed and the sound of the sea.", "Three courses by candlelight, with a glass of wine."],
			why: "In autumn the beach is quiet and the evenings are mild.",
		},
		es: {
			subject: "Otoño en el Hotel Brisa Lenta: tu escapada está lista",
			team: "El equipo del Hotel Brisa Lenta",
			previewText: "2 noches, desayuno y una cena para dos, desde 290 €",
			headline: "Otoño en el Hotel Brisa Lenta",
			intro: "Hemos preparado una escapada para los fines de semana de otoño:",
			nights: "<strong>2 noches</strong> en habitación doble con vistas al mar",
			includedOne: "<strong>El desayuno de cada mañana</strong>, en la terraza si hace sol",
			includedTwo: "<strong>Una cena para dos</strong> la primera noche",
			price: "Desde <strong>290 €</strong> para dos, para estancias entre el 1 de octubre y el 30 de noviembre.",
			oneTitle: "La habitación",
			twoTitle: "La cena",
			line: ["Sábanas blancas, una cama amplia y el sonido del mar.", "Tres platos a la luz de las velas, con una copa de vino."],
			why: "En otoño la playa está tranquila y las noches son suaves.",
		},
	},
	"design-hotel-pre-arrival": {
		en: {
			oneText: "Move up to a suite with a sofa for €40 more per night.",
			twoText: "Check in from 11 am or check out at 3 pm, for €20 each.",
			threeText: "Add breakfast for €14 per person and start the day without plans.",
		},
		es: {
			subject: "Tu estancia en el Hotel Brisa Lenta empieza en unos días",
			intro: "Ya estamos preparando tu habitación. Antes de que llegues, tres maneras de aprovechar más tu estancia en el Hotel Brisa Lenta:",
			team: "El equipo del Hotel Brisa Lenta",
			oneText: "Pasa a una suite con sofá por 40 € más por noche.",
			twoText: "Entrada desde las 11:00 o salida a las 15:00, por 20 € cada una.",
			threeText: "Añádelo por 14 € por persona y empieza el día sin planes.",
		},
	},
	"design-hotel-event": {
		en: {
			subject: "Dinner in the garden at {{venue}}, July 12",
			previewText: "One long table, a set menu and live guitar",
			headline: "Dinner in the garden",
			intro: "One long table under the pines, a set menu from our kitchen and live guitar. For guests and friends of the house, and worth staying for the whole evening.",
			date: "<strong>When:</strong> July 12, 8:30 pm",
			place: "<strong>Where:</strong> the garden at {{venue}}",
			price: "<strong>Price:</strong> €65 per person, with wine and dessert",
			oneTitle: "A glass of cava to start",
			oneText: "Served as you arrive, while the sun goes down.",
			twoTitle: "Stay the night",
			twoText: "Rooms that night from €140, breakfast included.",
		},
		es: {
			subject: "Cena en el jardín del Hotel Brisa Lenta, 12 de julio",
			team: "El equipo del Hotel Brisa Lenta",
			previewText: "Una mesa larga, un menú cerrado y guitarra en directo",
			headline: "Cena en el jardín",
			intro: "Una mesa larga bajo los pinos, un menú cerrado de nuestra cocina y guitarra en directo. Para huéspedes y amigos de la casa, y merece quedarse toda la noche.",
			date: "<strong>Cuándo:</strong> 12 de julio, 20:30",
			place: "<strong>Dónde:</strong> el jardín del Hotel Brisa Lenta",
			price: "<strong>Precio:</strong> 65 € por persona, con vino y postre",
			oneTitle: "Una copa de cava para empezar",
			oneText: "Al llegar, mientras se pone el sol.",
			twoTitle: "Quédate a dormir",
			twoText: "Habitaciones esa noche desde 140 €, con desayuno.",
		},
	},
	"design-restaurant-new-menu": {
		en: {
			previewText: "Winter produce and 6 new dishes",
			intro: "Winter brings citrus, artichokes and the last of the mushrooms. Six new dishes, made with what the market brings each week.",
			dish: ["Sea bream with sprouts", "Fresh pasta with mushrooms", "Small plates to share"],
			line: ["A roasted fillet with crispy skin and a light sauce.", "Made in the house every morning, with wild mushrooms.", "Five small plates for the table, new each week."],
		},
		es: {
			previewText: "Producto de invierno y 6 platos nuevos",
			intro: "El invierno trae cítricos, alcachofas y las últimas setas. Seis platos nuevos, con lo que trae el mercado cada semana.",
			dish: ["Dorada con brotes", "Pasta fresca con setas", "Platos para compartir"],
			line: ["Lomo asado con la piel crujiente y una salsa ligera.", "Hecha en casa cada mañana, con setas de temporada.", "Cinco platos pequeños para el centro, nuevos cada semana."],
		},
	},
	"design-restaurant-daily-menu": {
		en: {
			previewText: "Three courses for €16, Monday to Friday",
			starter: "<strong>To start:</strong> Squash soup",
			main: "<strong>Main:</strong> Fish of the day or roast free-range chicken",
			dessert: "<strong>Dessert:</strong> House flan",
			price: "<strong>€16</strong> with bread, a drink and coffee, from Monday to Friday, 1 pm to 4 pm.",
			oneTitle: "Bread from the oven",
			twoTitle: "Coffee to finish",
			line: ["Baked in the house every morning.", "Espresso or with milk, part of the menu."],
		},
		es: {
			previewText: "Tres platos por 16 €, de lunes a viernes",
			starter: "<strong>Para empezar:</strong> Crema de calabaza",
			main: "<strong>Principal:</strong> Pescado del día o pollo de corral asado",
			dessert: "<strong>Postre:</strong> Flan de la casa",
			price: "<strong>16 €</strong> con pan, bebida y café, de lunes a viernes, de 13:00 a 16:00.",
			oneTitle: "Pan recién horneado",
			twoTitle: "Café para terminar",
			line: ["Lo horneamos en casa cada mañana.", "Solo o con leche, incluido en el menú."],
		},
	},
	"design-restaurant-event": {
		en: {
			subject: "Wine night at {{venue}}, Thursday, October 28",
			previewText: "Four wines from small cellars, each with its own dish",
			headline: "Wine night",
			intro: "On the last Thursday of every month we close the menu and open four wines from small cellars, poured by the people who make them, each with a dish made for it. There are 24 seats at the long table in the dining room.",
			date: "<strong>When:</strong> Thursday, October 28, 8:30 pm",
			menu: "<strong>The menu:</strong> 4 courses, with 4 wines",
			price: "<strong>Price:</strong> €55 per person",
			oneTitle: "The winemakers",
			twoTitle: "The menu",
			line: ["They tell the story of each bottle at the table.", "Small plates made to go with each wine."],
		},
		es: {
			subject: "Noche de vinos en {{venue}}, jueves 28 de octubre",
			previewText: "Cuatro vinos de bodegas pequeñas, cada uno con su plato",
			headline: "Noche de vinos",
			intro: "El último jueves de cada mes cerramos la carta y abrimos cuatro vinos de bodegas pequeñas, servidos por quienes los hacen, cada uno con un plato pensado para él. Son 24 plazas en la mesa larga del comedor.",
			date: "<strong>Cuándo:</strong> jueves 28 de octubre, 20:30",
			menu: "<strong>El menú:</strong> 4 pases, con 4 vinos",
			price: "<strong>Precio:</strong> 55 € por persona",
			oneTitle: "Las bodegas",
			twoTitle: "El menú",
			line: ["Cuentan la historia de cada botella en la mesa.", "Platos pequeños pensados para cada vino."],
		},
	},
};

// A design's words where an array hands out its values in the order the design reads them.
function inOrder(text) {
	const reads = {};
	return new Proxy(text, {
		get(target, key) {
			const value = target[key];
			if (!Array.isArray(value)) return value;
			reads[key] = (reads[key] ?? -1) + 1;
			return value[reads[key] % value.length];
		},
	});
}

// The gallery in one language: a hotel's designs from Hotel Brisa Lenta, a restaurant's from Tres Higueras, each
// { id, kind, title, when, preview } with its email in small (lib/design-gallery.js). A hotel or restaurant design
// without words here stops the build, rather than show a visitor its brackets.
export function listLandingTemplates(lang) {
	return DEMO_VENUES.flatMap((venue) =>
		CAMPAIGN_DESIGNS.filter((design) => design.kind === venue.kind).map((design) => {
			const fill = FILLS[design.id]?.[lang];
			if (!fill) throw new Error(`${design.id} has no ${lang} words for the landing's gallery (lib/marketing/landing-templates.js)`);
			const words = Object.fromEntries(Object.entries({ ...design[lang], ...fill }).map(([key, value]) => [key, typeof value === "string" ? value.replace(FIRST_NAME, READER) : value]));
			const preview = getDesignPreview({ ...design, [lang]: inOrder(words) }, lang, { name: venue.name, venue: { kind: venue.kind } });
			return { id: design.id, kind: design.kind, title: design[lang].title, when: design[lang].when, preview };
		})
	);
}

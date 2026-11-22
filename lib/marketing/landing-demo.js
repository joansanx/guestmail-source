import { CLICK_WINDOW_DAYS } from "../booking-attribution-rules.js";
import { getLandingCopy } from "../landing.js";
import { buildReviewCampaign } from "../reputation-rules.js";
import { findStockPhoto } from "../stock-photos.js";

// guestmail: the made-up hotel the landing's demo shows (components/marketing/DemoLanding.jsx), in each language. Its
// tabs follow the h3s of the demo section of content/site/<lang>/home.md, in DEMO_TABS' order. The dashboard's own words
// are copied from its screens and from the panel's Spanish dictionary (lib/i18n/es), and where the product writes the
// words itself (a review campaign's subject, the venue website's offer and form), they come from the same functions, so
// the demo can't promise words the product doesn't write. Every tool named here is in lib/actions/registry.js
// (tests/site-content.test.mjs checks it).
export const DEMO_TABS = ["ask", "write", "guests", "reviews", "automations", "website"];

const HOTEL = { name: "Hotel Marelva", rating: 4.7, reviewCount: 1234 };
const photo = (id, lang) => ({ id, src: `/stock/${id}.jpg`, thumb: `/stock/thumbs/${id}.jpg`, alt: findStockPhoto(id).alt[lang] });

function getReviewCampaign(lang) {
	const place = { name: HOTEL.name, rating: HOTEL.rating, reviewCount: HOTEL.reviewCount, mapsUrl: "https://maps.google.com" };
	return buildReviewCampaign({ place, reviews: [], kind: "hotel", bookingUrl: "https://example.com", language: lang });
}

function getWebsite(lang, description, offerText) {
	return getLandingCopy({
		venue: { kind: "hotel" },
		postalAddress: "Calle del Mar 12, 46011 Valencia, Spain",
		agent: { language: lang },
		description,
		signupForm: { offerText },
	});
}

const DEMO = {
	en: {
		hotel: HOTEL,
		nav: { overview: "Overview", campaigns: "Campaigns", automations: "Automations", contacts: "Contacts", reputation: "Reputation", templates: "Templates", integrations: "Integrations", settings: "Settings" },
		ask: {
			title: "Your AI assistant",
			connected: "GuestMail connected",
			request: "Write a campaign for the guests who stayed with us in the last 6 months and haven't booked again. Quote our best Google reviews.",
			steps: [
				{ tool: "get_reputation", result: "4.7 out of 5 from 1,234 reviews on Google Maps. 3 worth quoting." },
				{ tool: "create_segment", result: "Visited in the last 180 days and nothing booked: 412 guests." },
				{ tool: "create_review_campaign", result: `Draft “${getReviewCampaign("en").subject}”, with 3 quotes, a link to each review and a Book direct button.` },
				{ tool: "send_test_email", result: "Test sent to your inbox." },
			],
			question: "The draft is ready and the test is in your inbox. Shall I schedule it for Sunday at 9:00 AM, for the 412 guests?",
			answer: "Yes, go ahead.",
			final: { tool: "schedule_campaign", result: "Scheduled for Sunday, 9:00 AM. 412 guests." },
			placeholder: "Ask anything",
		},
		write: {
			steps: ["Write", "Review", "Send"],
			next: "Next: review",
			subject: { label: "Subject", value: "What's new at Hotel Marelva" },
			preview: { label: "Preview text", value: "Three reasons to come back this spring" },
			views: ["Desktop", "Mobile"],
			design: "Design: News with three photos",
			banner: photo("pool-garden", "en"),
			headline: "What's new at Hotel Marelva",
			hello: "Hi Ana,",
			intro: "The terrace opens again in March, the suites have new linen and the spa now stays open until 10 PM.",
			columns: [
				{ photo: photo("room-suite-sofa", "en"), title: "The suites", text: "A sofa by the window." },
				{ photo: photo("breakfast-terrace", "en"), title: "Breakfast outside", text: "On the terrace until 11." },
				{ photo: photo("spa-treatment-room", "en"), title: "The spa", text: "Open until 10 PM." },
			],
			button: "Book your stay",
			placeholder: "Write, or press / for commands",
		},
		guests: {
			breadcrumb: "Contacts",
			email: "ana.garcia@example.com",
			name: "Ana",
			status: "Active",
			vip: "VIP",
			activity: [
				{ label: "Emails received", value: "7" },
				{ label: "Last opened", value: "Nov 3" },
				{ label: "Last click", value: "Nov 3" },
			],
			staysTitle: "Stays and reservations",
			stays: [
				{ dates: "Aug 12, 2026 to Aug 16, 2026", detail: "Stay · booking.com · Double with terrace · 2 adults · 640" },
				{ dates: "Apr 3, 2026 to Apr 5, 2026", detail: "Stay · direct · Double · 2 adults · 310" },
				{ dates: "Dec 29, 2025 to Jan 2, 2026", detail: "Stay · direct · Junior suite · 2 adults, 2 children · 890" },
			],
			aboutTitle: "About",
			about: [
				{ label: "Country", value: "Spain" },
				{ label: "Language", value: "Spanish" },
				{ label: "Birthday", value: "Mar 14" },
				{ label: "Total spent", value: "1,840" },
				{ label: "Source", value: "Import" },
			],
			tagsTitle: "Tags",
			tags: ["marketing-ok", "spa"],
			segmentsTitle: "Segments",
			segments: ["Visited in the last 180 days and nothing booked", "Booked through booking.com"],
		},
		reviews: {
			venue: "Hotel Marelva, Valencia",
			rating: "4.7",
			count: "1,234 reviews on Google Maps",
			recommended: "Recommended",
			read: "Read on Google Maps",
			source: "Reviews from Google Maps, the most relevant first, read live.",
			button: "Draft a campaign with 3",
			items: [
				{ author: "Lucía M.", rating: 5, when: "2 weeks ago", reason: "5 stars · mentions staff, breakfast and views", chosen: true, text: "Breakfast on the terrace was the best part of our week, and the staff knew our names from the first morning." },
				{ author: "Tom B.", rating: 5, when: "a month ago", reason: "5 stars · mentions room", chosen: true, text: "A quiet room with a great bed, ten minutes on foot from the old town. We already want to come back in spring." },
				{ author: "Claire D.", rating: 4, when: "2 months ago", reason: "4 stars · mentions pool", chosen: true, text: "The spa was a treat after a day at the beach. The pool gets busy in August, so go early." },
				{ author: "Marc P.", rating: 4, when: "3 months ago", chosen: false, text: "Good value and a friendly welcome. Parking nearby is tight." },
				{ author: "Sven K.", rating: 3, when: "4 months ago", chosen: false, text: "Friendly staff, but our room was small for the price." },
			],
		},
		automations: {
			name: "After booking",
			on: "On",
			templates: { label: "Templates", items: ["Welcome series", "Lead magnet", "Email course"] },
			trigger: { label: "When", value: "A new booking comes in through the connector" },
			first: { label: "Email 1 · right away", value: "Thanks for booking with us" },
			wait: "Wait 1 day",
			condition: { label: "If", value: "They opened email 1" },
			yes: { label: "Yes", step: "Email 2", value: "Add breakfast on the terrace" },
			no: { label: "No", step: "Email 2", value: "In case you missed it" },
			agent: { label: "Your agent", tools: ["create_automation", "turn_on_automation"] },
		},
		website: {
			host: "marelva.theguestmail.com",
			copy: getWebsite("en", "A small hotel by the sea in Valencia, with a terrace, a spa and breakfast until 11.", "10% off your next direct booking"),
			latest: "Latest",
			issues: [
				{ title: "What's new at Hotel Marelva", date: "Nov 8", photo: photo("pool-garden", "en") },
				{ title: "Autumn at the spa", date: "Oct 18", photo: photo("spa-towels", "en") },
				{ title: "Breakfast on the terrace is back", date: "Sep 27", photo: photo("breakfast-terrace", "en") },
			],
		},
		// The small screens of the feature cards, in the order of the features section's h3s (FEATURE_VISUALS).
		features: {
			schedule: { date: { label: "Date", value: "Nov 29" }, time: { label: "Time", value: "9:00 AM" }, to: { label: "To", value: "Visited in the last 180 days and nothing booked · 412" }, button: "Schedule" },
			popup: { code: "GUEST10-7K2P9Q" },
			segment: { rows: [["Last visit", "in the last", "180 days"], ["Stay", "has nothing booked"]], count: "412 guests" },
			import: { file: "pms-export.csv", rows: "1,286 rows", map: [["check_in", "Stay or reservation: arrival"], ["canal", "Stay or reservation: booking channel"], ["newsletter_optin", "Tag marketing-ok, when they agreed"]], result: "1,240 imported · 46 left out" },
			connector: { path: "/api/hooks/reservations/•••", body: { email: "ana.garcia@example.com", arrival: "2026-08-12", departure: "2026-08-16", channel: "booking.com" }, added: "ana.garcia@example.com", stay: "Stay · Aug 12 to Aug 16 · booking.com" },
			attributed: { title: "Attributed bookings", figures: [["3", "bookings"], ["1,920", "total amount"]], note: `Booked by guests within ${CLICK_WINDOW_DAYS} days of clicking a link in it` },
			domain: { from: "From", senders: [["hello@marelva.theguest.email", "Shared"], ["hello@hotelmarelva.example", "Verified"]], records: ["DKIM", "Return path", "DMARC"] },
			deliverability: { items: ["DKIM, SPF and DMARC", "Double opt-in", "One-click unsubscribe", "Bounces and complaints handled", "List cleanup"] },
			team: { members: [["Laura", "laura@hotelmarelva.example", "Owner"], ["Pau", "pau@hotelmarelva.example", "Admin"], ["Marta", "marta@hotelmarelva.example", "Member"]] },
		},
	},
	es: {
		hotel: HOTEL,
		nav: { overview: "Resumen", campaigns: "Campañas", automations: "Automatizaciones", contacts: "Contactos", reputation: "Reputación", templates: "Plantillas", integrations: "Integraciones", settings: "Ajustes" },
		ask: {
			title: "Tu asistente de IA",
			connected: "GuestMail conectado",
			request: "Prepara una campaña para los huéspedes que se alojaron con nosotros en los últimos 6 meses y no han vuelto a reservar. Cita nuestras mejores reseñas de Google.",
			steps: [
				{ tool: "get_reputation", result: "4,7 sobre 5 en 1.234 reseñas de Google Maps. 3 que merece la pena citar." },
				{ tool: "create_segment", result: "Nos visitó en los últimos 180 días y no tiene nada reservado: 412 huéspedes." },
				{ tool: "create_review_campaign", result: `Borrador «${getReviewCampaign("es").subject}», con 3 citas, el enlace a cada reseña y un botón de Reserva directa.` },
				{ tool: "send_test_email", result: "Prueba enviada a tu bandeja de entrada." },
			],
			question: "El borrador está listo y tienes la prueba en tu bandeja. ¿La programo para el domingo a las 9:00, para los 412 huéspedes?",
			answer: "Sí, adelante.",
			final: { tool: "schedule_campaign", result: "Programada para el domingo a las 9:00. 412 huéspedes." },
			placeholder: "Pregunta lo que quieras",
		},
		write: {
			steps: ["Escribir", "Revisar", "Enviar"],
			next: "Siguiente: revisar",
			subject: { label: "Asunto", value: "Novedades en el Hotel Marelva" },
			preview: { label: "Texto de vista previa", value: "Tres motivos para volver en primavera" },
			views: ["Ordenador", "Móvil"],
			design: "Diseño: Novedades con tres fotos",
			banner: photo("pool-garden", "es"),
			headline: "Novedades en el Hotel Marelva",
			hello: "Hola, Ana:",
			intro: "La terraza vuelve a abrir en marzo, las suites estrenan ropa de cama y el spa abre ahora hasta las 22:00.",
			columns: [
				{ photo: photo("room-suite-sofa", "es"), title: "Las suites", text: "Con un sofá junto a la ventana." },
				{ photo: photo("breakfast-terrace", "es"), title: "Desayuno fuera", text: "En la terraza hasta las 11." },
				{ photo: photo("spa-treatment-room", "es"), title: "El spa", text: "Abierto hasta las 22:00." },
			],
			button: "Reserva tu estancia",
			placeholder: "Escribe, o pulsa / para ver los comandos",
		},
		guests: {
			breadcrumb: "Contactos",
			email: "ana.garcia@example.com",
			name: "Ana",
			status: "Activo",
			vip: "VIP",
			activity: [
				{ label: "Correos recibidos", value: "7" },
				{ label: "Última apertura", value: "3 nov" },
				{ label: "Último clic", value: "3 nov" },
			],
			staysTitle: "Estancias y reservas",
			stays: [
				{ dates: "Del 12 al 16 de agosto de 2026", detail: "Estancia · booking.com · Doble con terraza · 2 adultos · 640" },
				{ dates: "Del 3 al 5 de abril de 2026", detail: "Estancia · directa · Doble · 2 adultos · 310" },
				{ dates: "Del 29 de diciembre de 2025 al 2 de enero de 2026", detail: "Estancia · directa · Junior suite · 2 adultos, 2 niños · 890" },
			],
			aboutTitle: "Datos",
			about: [
				{ label: "País", value: "España" },
				{ label: "Idioma", value: "Español" },
				{ label: "Cumpleaños", value: "14 mar" },
				{ label: "Gasto total", value: "1.840" },
				{ label: "Origen", value: "Importación" },
			],
			tagsTitle: "Etiquetas",
			tags: ["marketing-ok", "spa"],
			segmentsTitle: "Segmentos",
			segments: ["Nos visitó en los últimos 180 días y no tiene nada reservado", "Reservó por booking.com"],
		},
		reviews: {
			venue: "Hotel Marelva, Valencia",
			rating: "4,7",
			count: "1.234 reseñas en Google Maps",
			recommended: "Recomendada",
			read: "Leer en Google Maps",
			source: "Reseñas de Google Maps, las más relevantes primero, leídas en directo.",
			button: "Preparar una campaña con 3",
			items: [
				{ author: "Lucía M.", rating: 5, when: "hace 2 semanas", reason: "5 estrellas · menciona el trato, el desayuno y las vistas", chosen: true, text: "El desayuno en la terraza fue lo mejor de la semana, y el personal se sabía nuestros nombres desde la primera mañana." },
				{ author: "Tom B.", rating: 5, when: "hace un mes", reason: "5 estrellas · menciona la habitación", chosen: true, text: "Habitación tranquila, una cama estupenda y a diez minutos a pie del casco antiguo. Ya queremos volver en primavera." },
				{ author: "Claire D.", rating: 4, when: "hace 2 meses", reason: "4 estrellas · menciona la piscina", chosen: true, text: "El spa fue un lujo después de un día de playa. En agosto la piscina se llena, mejor ir temprano." },
				{ author: "Marc P.", rating: 4, when: "hace 3 meses", chosen: false, text: "Buena relación calidad precio y un recibimiento amable. Aparcar cerca es complicado." },
				{ author: "Sven K.", rating: 3, when: "hace 4 meses", chosen: false, text: "Personal amable, pero la habitación era pequeña para lo que cuesta." },
			],
		},
		automations: {
			name: "Tras la reserva",
			on: "Encendida",
			templates: { label: "Plantillas", items: ["Serie de bienvenida", "Imán: envía la guía", "Curso por correo"] },
			trigger: { label: "Cuando", value: "Entra una reserva nueva por el conector" },
			first: { label: "Correo 1 · al momento", value: "Gracias por tu reserva" },
			wait: "Esperar 1 día",
			condition: { label: "Si", value: "Abrió el correo 1" },
			yes: { label: "Sí", step: "Correo 2", value: "Añade el desayuno en la terraza" },
			no: { label: "No", step: "Correo 2", value: "Por si se te pasó" },
			agent: { label: "Tu agente", tools: ["create_automation", "turn_on_automation"] },
		},
		website: {
			host: "marelva.theguestmail.com",
			copy: getWebsite("es", "Un hotel pequeño junto al mar en Valencia, con terraza, spa y desayuno hasta las 11.", "10% de descuento en tu próxima reserva directa"),
			latest: "Lo último",
			issues: [
				{ title: "Novedades en el Hotel Marelva", date: "8 nov", photo: photo("pool-garden", "es") },
				{ title: "El otoño en el spa", date: "18 oct", photo: photo("spa-towels", "es") },
				{ title: "Vuelve el desayuno en la terraza", date: "27 sep", photo: photo("breakfast-terrace", "es") },
			],
		},
		features: {
			schedule: { date: { label: "Fecha", value: "29 nov" }, time: { label: "Hora", value: "9:00" }, to: { label: "Para", value: "Nos visitó en los últimos 180 días y no tiene nada reservado · 412" }, button: "Programar" },
			popup: { code: "GUEST10-7K2P9Q" },
			segment: { rows: [["Última visita", "en los últimos", "180 días"], ["Estancia", "sin nada reservado"]], count: "412 huéspedes" },
			import: { file: "export-pms.csv", rows: "1.286 filas", map: [["check_in", "Estancia o reserva: llegada"], ["canal", "Estancia o reserva: canal de reserva"], ["newsletter_optin", "Etiqueta marketing-ok, cuando aceptó"]], result: "1.240 importados · 46 fuera" },
			connector: { path: "/api/hooks/reservations/•••", body: { email: "ana.garcia@example.com", arrival: "2026-08-12", departure: "2026-08-16", channel: "booking.com" }, added: "ana.garcia@example.com", stay: "Estancia · del 12 al 16 de agosto · booking.com" },
			attributed: { title: "Reservas atribuidas", figures: [["3", "reservas"], ["1.920", "importe total"]], note: `Las hicieron huéspedes en los ${CLICK_WINDOW_DAYS} días siguientes a pulsar un enlace del correo` },
			domain: { from: "Desde", senders: [["hello@marelva.theguest.email", "Compartida"], ["hello@hotelmarelva.example", "Verificada"]], records: ["DKIM", "Ruta de retorno", "DMARC"] },
			deliverability: { items: ["DKIM, SPF y DMARC", "Confirmación doble", "Baja en un clic", "Rebotes y quejas gestionados", "Limpieza de la lista"] },
			team: { members: [["Laura", "laura@hotelmarelva.example", "Propietario"], ["Pau", "pau@hotelmarelva.example", "Admin"], ["Marta", "marta@hotelmarelva.example", "Miembro"]] },
		},
	},
};

export function getDemo(lang) {
	const demo = DEMO[lang];
	if (!demo) throw new Error(`The landing's demo has no ${lang} version (lib/marketing/landing-demo.js)`);
	return demo;
}

// Every tool the demo shows, for the test that holds them to the registry.
export function listDemoTools(lang) {
	const { ask, automations } = getDemo(lang);
	return [...ask.steps, ask.final].map(({ tool }) => tool).concat(automations.agent.tools);
}

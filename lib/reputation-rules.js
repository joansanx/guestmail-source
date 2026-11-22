// guestmail: what a hotel or a restaurant does with its reviews. No network and no database: lib/google-places.js reads
// the place, and these rules pick the reviews worth quoting and write the campaign that quotes them.

// guestmail: other is any business or creator that isn't a hotel or a restaurant: a shop, a clinic, a school, a brand.
export const VENUE_KINDS = ["hotel", "restaurant", "other"];
export const MAX_REVIEW_PICKS = 3;
export const REPUTATION_LANGUAGES = ["en", "es"];
const EXCERPT_LENGTH = 280;
const DAY_MS = 24 * 60 * 60 * 1000;

// What guests praise, by kind of venue: a review that names one says something a reader can picture.
const TOPICS = {
	hotel: {
		staff: ["staff", "reception", "personal", "recepción", "recepcion", "trato", "atención", "atencion", "amable", "friendly", "helpful"],
		breakfast: ["breakfast", "desayuno"],
		location: ["location", "located", "walking distance", "ubicación", "ubicacion", "céntrico", "centrico"],
		room: ["room", "bed", "suite", "habitación", "habitacion", "cama"],
		cleanliness: ["clean", "spotless", "limpio", "limpia", "limpieza"],
		views: ["view", "terrace", "rooftop", "vistas", "terraza"],
		pool: ["pool", "spa", "piscina"],
	},
	restaurant: {
		food: ["food", "dish", "delicious", "tasty", "menu", "comida", "plato", "delicioso", "rico", "menú"],
		service: ["service", "waiter", "staff", "friendly", "servicio", "camarero", "trato", "atención", "atencion", "amable"],
		atmosphere: ["atmosphere", "cozy", "decor", "terrace", "ambiente", "acogedor", "terraza"],
		value: ["price", "value", "worth", "precio"],
		drinks: ["wine", "cocktail", "dessert", "vino", "cóctel", "coctel", "postre"],
	},
	other: {
		service: ["service", "staff", "friendly", "helpful", "servicio", "trato", "atención", "atencion", "amable"],
		quality: ["quality", "great", "excellent", "professional", "calidad", "excelente", "profesional"],
		value: ["price", "value", "worth", "precio"],
		speed: ["fast", "quick", "on time", "rápido", "rapido", "puntual"],
		place: ["shop", "store", "place", "location", "tienda", "local", "ubicación", "ubicacion"],
	},
};

// ponytail: words that usually come with a complaint, counted as text. A review that praises the stay "but" something
// drops in the ranking; it reads no meaning, so the owner still reads the draft. Upgrade: score each sentence.
const RESERVATIONS = ["but ", "however", "unfortunately", "disappoint", "only issue", "dated", "pero ", "aunque", "sin embargo", "lástima", "decepcion"];

function countReservations(text) {
	const lower = text.toLowerCase();
	return RESERVATIONS.filter((word) => lower.includes(word)).length;
}

function findTopics(text, kind) {
	const lower = text.toLowerCase();
	return Object.entries(TOPICS[kind] ?? TOPICS.hotel)
		.filter(([, words]) => words.some((word) => lower.includes(word)))
		.map(([topic]) => topic);
}

// Full marks first, then a length someone reads (not three words, not a wall), then how recent it is and whether it
// names something a reader can picture.
function scoreReview({ rating, text, publishedAt }, topics, now) {
	const ageDays = publishedAt ? (now - new Date(publishedAt)) / DAY_MS : Infinity;
	const lengthScore = text.length >= 80 && text.length <= 400 ? 15 : text.length < 40 ? -20 : 0;
	const ageScore = ageDays <= 365 ? 10 : ageDays <= 730 ? 5 : 0;
	return rating * 10 + lengthScore + ageScore + Math.min(topics.length, 3) * 4 - Math.min(countReservations(text), 3) * 8;
}

function joinWords(words) {
	return words.length < 2 ? words.join("") : `${words.slice(0, -1).join(", ")} and ${words.at(-1)}`;
}

// The reviews worth quoting, best first: 4 stars or more with text, and each next one says something the picks before
// didn't when another does. reason tells whoever chooses why. Deterministic: the same reviews give the same picks.
export function pickReviews(reviews, { kind = "hotel", count = MAX_REVIEW_PICKS, now = new Date() } = {}) {
	const candidates = reviews
		.filter(({ rating, text }) => rating >= 4 && String(text ?? "").trim().length > 0)
		.map((review) => {
			const topics = findTopics(review.text, kind);
			return { review, topics, score: scoreReview(review, topics, now) };
		});
	const picks = [];
	const covered = new Set();
	while (picks.length < count && candidates.length > 0) {
		const value = ({ score, topics }) => score + topics.filter((topic) => !covered.has(topic)).length * 6;
		const best = candidates.reduce((top, candidate) => (value(candidate) > value(top) ? candidate : top));
		candidates.splice(candidates.indexOf(best), 1);
		best.topics.forEach((topic) => covered.add(topic));
		const mentions = best.topics.length > 0 ? ` · mentions ${joinWords(best.topics.slice(0, 3))}` : "";
		picks.push({ id: best.review.id, reason: `${best.review.rating} stars${mentions}` });
	}
	return picks;
}

// One paragraph, cut at the end of a sentence when there is one in reach.
export function excerptReview(text, max = EXCERPT_LENGTH) {
	const flat = String(text ?? "").replace(/\s+/g, " ").trim();
	if (flat.length <= max) return flat;
	const cut = flat.slice(0, max);
	const sentenceEnd = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
	return sentenceEnd > max / 2 ? cut.slice(0, sentenceEnd + 1) : `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

// A guest's words go into Markdown as text: nothing they typed becomes formatting or a link.
function escapeMarkdown(text) {
	return text.replace(/[\\`*_[\]<>#|~]/g, "\\$&");
}

const COPY = {
	en: {
		guests: { hotel: "guests", restaurant: "guests", other: "customers" },
		subject: (name) => `What guests say about ${name}`,
		preview: (rating, count, guests) => `Rated ${rating} out of 5 by ${count} ${guests} on Google`,
		heading: (guests) => `What our ${guests} say`,
		rated: (rating, count) => `**${rating} out of 5** from ${count} reviews on Google Maps.`,
		on: "on Google Maps",
		book: { hotel: "Book direct", restaurant: "Book a table", other: "Visit our website" },
		source: "Reviews from Google Maps, the most relevant first.",
		all: "Read all our reviews",
	},
	es: {
		guests: { hotel: "huéspedes", restaurant: "clientes", other: "clientes" },
		subject: (name) => `Lo que dicen de ${name}`,
		preview: (rating, count, guests) => `${rating} sobre 5 según ${count} ${guests} en Google`,
		heading: (guests) => `Lo que dicen nuestros ${guests}`,
		rated: (rating, count) => `**${rating} sobre 5** en ${count} reseñas de Google Maps.`,
		on: "en Google Maps",
		book: { hotel: "Reserva directa", restaurant: "Reserva tu mesa", other: "Visita nuestra web" },
		source: "Reseñas de Google Maps, las más relevantes primero.",
		all: "Lee todas nuestras reseñas",
	},
};

// The draft a hotel or a restaurant sends about its reviews, in Markdown: its rating, the quotes with who wrote each
// and a link to it on Google Maps, and where to book. The owner reads it and edits it before anything goes out.
export function buildReviewCampaign({ place, reviews, kind = "hotel", bookingUrl, language = "en" }) {
	const copy = COPY[language] ?? COPY.en;
	const locale = language === "es" ? "es-ES" : "en-US";
	const guests = copy.guests[kind] ?? copy.guests.hotel;
	const rating = place.rating.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
	const count = place.reviewCount.toLocaleString(locale);
	const quotes = reviews.map(
		({ text, author, url }) => `> “${escapeMarkdown(excerptReview(text))}”\n>\n> ${escapeMarkdown(author)}, [${copy.on}](${url})`
	);
	const markdown = [
		`# ${copy.heading(guests)}`,
		copy.rated(rating, count),
		...quotes,
		...(bookingUrl ? [`[${copy.book[kind] ?? copy.book.hotel}](${bookingUrl})`] : []),
		`${copy.source} [${copy.all}](${place.mapsUrl})`,
	].join("\n\n");
	return { subject: copy.subject(place.name), previewText: copy.preview(rating, count, guests), markdown };
}

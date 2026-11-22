import { briefAbout, guessCity } from "./landing.js";
import { getVenueLanguage } from "./venue-legal.js";

// guestmail: what a venue's website tells search engines and answer engines about the business behind it
// (lib/archive-seo.js): a description made of sentences, and the business as schema.org knows it. Only what the venue
// stored is said. Nothing of Google's but a place's ID may be kept (lib/google-places.js), so there is no rating and no
// review here. A newsletter without a venue gets none of this and keeps its own description and its Blog.
const TYPES = { hotel: "Hotel", restaurant: "Restaurant", other: "LocalBusiness" };
// What search engines show of a description, and where one starts to say enough.
const DESCRIPTION_LENGTH = { min: 120, max: 155 };
const COPY = {
	en: {
		locale: "en_US",
		at: { hotel: "is a hotel at", restaurant: "is a restaurant at", other: "is at" },
		in: { hotel: "is a hotel in", restaurant: "is a restaurant in", other: "is in" },
		kind: { hotel: "is a hotel", restaurant: "is a restaurant" },
		offer: "Offer for new subscribers:",
		subscribe: (name) => `Subscribe to get offers and news from ${name} by email`,
	},
	es: {
		locale: "es_ES",
		at: { hotel: "es un hotel en", restaurant: "es un restaurante en", other: "está en" },
		in: { hotel: "es un hotel de", restaurant: "es un restaurante de", other: "está en" },
		kind: { hotel: "es un hotel", restaurant: "es un restaurante" },
		offer: "Oferta para nuevos suscriptores:",
		subscribe: (name) => `Suscríbete para recibir por email las ofertas y novedades de ${name}`,
	},
};

export function isVenue(newsletter) {
	return Boolean(TYPES[newsletter?.venue?.kind]);
}

// Open Graph's locale for the language the venue writes in.
export function getSiteLocale(newsletter) {
	return COPY[getVenueLanguage(newsletter)].locale;
}

// A field's text on one line: an address's lines become its parts, a paragraph's lines its words.
function oneLine(text, joiner = " ") {
	return String(text ?? "")
		.split("\n")
		.map((line) => line.trim().replace(/\s+/g, " "))
		.filter(Boolean)
		.join(joiner);
}

function getAddress(newsletter) {
	return oneLine(newsletter.postalAddress?.replace(/,\s*$/gm, ""), ", ");
}

function toSentence(text) {
	return /[.!?…]$/.test(text) ? text : `${text.replace(/[,;:]$/, "")}.`;
}

// What the owner wrote about the venue: their description, else the "who we are" of their brief, which is what the
// landing shows (lib/landing.js). Null for less than a sentence, like a single word left in the field.
// ponytail: three words make a sentence here. A language check if owners write ones that aren't.
function getAbout(newsletter) {
	return [oneLine(newsletter.description), briefAbout(newsletter.agent?.brief) ?? ""].find((text) => text.split(" ").length >= 3) ?? null;
}

// Up to its first full stop when what comes before it reads as a sentence, else all of it.
function firstSentence(text) {
	const first = /^.*?[.!?](?=\s|$)/.exec(text)?.[0];
	return first && first.split(" ").length >= 3 ? first : toSentence(text);
}

// As many of the sentences as fit, in their order, each one whole.
function fit(sentences) {
	return sentences.filter(Boolean).reduce((text, sentence) => {
		const longer = text ? `${text} ${sentence}` : sentence;
		return longer.length <= DESCRIPTION_LENGTH.max ? longer : text;
	}, "");
}

// A venue's description for search results and link previews: what it is and where, the first sentence of what its
// owner wrote about it, its offer and what subscribing brings. Whole sentences, never cut. It opens with the full
// address when that leaves room to say enough, else with the city the landing shows (lib/landing.js guessCity).
// Shorter than 120 characters when its whole sentences don't add up to more.
export function getVenueDescription(newsletter) {
	const copy = COPY[getVenueLanguage(newsletter)];
	const { kind } = newsletter.venue;
	const name = newsletter.name;
	const about = getAbout(newsletter);
	const address = getAddress(newsletter);
	const city = guessCity(newsletter.postalAddress);
	const offer = oneLine(newsletter.signupForm?.offerText);
	const rest = [about && firstSentence(about), offer && toSentence(`${copy.offer} ${offer}`), toSentence(copy.subscribe(name))];
	const openings = [address && `${name} ${copy.at[kind]} ${address}`, city ? `${name} ${copy.in[kind]} ${city}` : copy.kind[kind] && `${name} ${copy.kind[kind]}`]
		.filter(Boolean)
		.map(toSentence)
		.filter((opening) => opening.length <= DESCRIPTION_LENGTH.max);
	const texts = [...openings.map((opening) => fit([opening, ...rest])), fit(rest)];
	return texts.find((text) => text.length >= DESCRIPTION_LENGTH.min) ?? texts.find(Boolean) ?? "";
}

// The venue's own node, the same on every page of its website: url is where that website lives.
export function getVenueRef(newsletter, url) {
	return { "@type": TYPES[newsletter.venue.kind], "@id": `${url}#venue`, name: newsletter.name, url };
}

// The business behind the website: its kind, name, postal address as the owner wrote it, and where to book when the
// owner gave a link. sameAs: the venue's own website and the profiles its owner listed. hasMap: its place on Google
// Maps, an address built from the place's ID and the venue's own name.
// ponytail: the address is one line of free text, so it goes whole in streetAddress. Street, postal code, city and
// country as fields of their own on the venue would make a full PostalAddress.
export function getVenueJsonLd(newsletter, { url, image }) {
	const { placeId, bookingUrl, website } = newsletter.venue;
	const about = getAbout(newsletter);
	const address = getAddress(newsletter);
	const sameAs = [website, ...(newsletter.socialLinks ?? [])].filter(Boolean);
	return {
		"@context": "https://schema.org",
		...getVenueRef(newsletter, url),
		...(about && { description: about }),
		...(image && { image }),
		...(address && { address: { "@type": "PostalAddress", streetAddress: address } }),
		...(placeId && { hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(newsletter.name)}&query_place_id=${encodeURIComponent(placeId)}` }),
		...(sameAs.length > 0 && { sameAs }),
		...(bookingUrl && { potentialAction: { "@type": "ReserveAction", target: bookingUrl } }),
	};
}

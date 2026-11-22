// guestmail: what a venue's website says before and around its issues (app/archive/[slug]/page.js), in the venue's
// language: what it is and where, a line about it, its offer for new subscribers and what subscribing brings. Only what
// the owner wrote or chose: the newsletter's description, the "who we are" of their brief, their offer.
const COPY = {
	en: {
		kinds: { hotel: "Hotel", restaurant: "Restaurant", other: "" },
		offerTitle: "Get your discount",
		offerNote: "Subscribe and it's yours, right away.",
		button: "Subscribe",
		placeholder: "you@example.com",
		subscribed: "You're in. Watch your inbox.",
		yourCode: "Your code",
		soon: "Our first stories are on their way. Subscribe and you'll get them first.",
		benefits: {
			hotel: ["Offers when you book direct", "What's on in {city}, before you travel", "Seasons and events, first"],
			restaurant: ["New menus and dishes", "Special nights and events", "Perks for regulars"],
			other: ["Offers only for subscribers", "News and launches, first", "Tips you can use"],
		},
		cityFallback: "the city",
	},
	es: {
		kinds: { hotel: "Hotel", restaurant: "Restaurante", other: "" },
		offerTitle: "Consigue tu descuento",
		offerNote: "Suscríbete y es tuyo al momento.",
		button: "Suscribirme",
		placeholder: "tu@email.com",
		subscribed: "Ya estás dentro. Mira tu bandeja.",
		yourCode: "Tu código",
		soon: "Nuestras primeras novedades están en camino. Suscríbete y serás el primero en recibirlas.",
		benefits: {
			hotel: ["Ofertas al reservar directo", "Qué hacer en {city} antes de venir", "Temporadas y eventos, antes que nadie"],
			restaurant: ["Menús y platos nuevos", "Noches especiales y eventos", "Ventajas para clientes habituales"],
			other: ["Ofertas solo para suscriptores", "Novedades y lanzamientos, antes que nadie", "Consejos útiles"],
		},
		cityFallback: "la ciudad",
	},
};

export function getLandingLanguage(newsletter) {
	return newsletter?.agent?.language === "es" ? "es" : "en";
}

const COUNTRIES = new Set(["spain", "españa", "portugal", "france", "francia", "italy", "italia", "germany", "alemania", "andorra", "uk", "united kingdom", "usa", "united states", "mexico", "méxico", "dominican republic", "república dominicana", "republica dominicana"]);

// "Calle Poblenou, 10 Barcelona, Spain" -> "Barcelona": from the end, the first part after the street that isn't a
// country, without its postal code or number. ponytail: a heuristic on a free-text address; a city field on the venue
// if it guesses wrong too often.
export function guessCity(address) {
	const parts = String(address ?? "")
		.split(/[,\n]/)
		.map((part) => part.trim())
		.filter(Boolean);
	for (const part of parts.slice(1).reverse()) {
		if (COUNTRIES.has(part.toLowerCase())) continue;
		const candidate = part.replace(/^[\d\s-]+/, "").replace(/\s+\d{4,6}$/, "").trim();
		if (candidate && !/\d/.test(candidate)) return candidate;
	}
	return null;
}

// The "who we are" paragraph of the owner's brief (lib/content-agent.js), without Markdown and without the starter
// brief's hints in parentheses, cut at a sentence. Null when there's nothing the owner wrote.
export function briefAbout(brief, max = 320) {
	const match = /^##\s*(?:who we are|quiénes somos|quienes somos)\s*$([\s\S]*?)(?=^##\s|$(?![\s\S]))/im.exec(String(brief ?? ""));
	const text = (match?.[1] ?? "")
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line && !line.startsWith("(") && !line.startsWith("-"))
		.join(" ")
		.replace(/[*_`#>[\]]/g, "")
		.trim();
	if (!text) return null;
	if (text.length <= max) return text;
	const cut = text.slice(0, max);
	const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
	return end > 80 ? cut.slice(0, end + 1) : `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

export function getLandingCopy(newsletter) {
	const language = getLandingLanguage(newsletter);
	const copy = COPY[language];
	const kind = newsletter?.venue?.kind ?? null;
	const city = guessCity(newsletter?.postalAddress);
	const kicker = [kind ? copy.kinds[kind] : "", city].filter(Boolean).join(" · ");
	const offerText = String(newsletter?.signupForm?.offerText ?? "").trim();
	return {
		language,
		kicker: kicker || null,
		about: newsletter?.description?.trim() || briefAbout(newsletter?.agent?.brief),
		offer: offerText ? { title: copy.offerTitle, text: offerText, note: copy.offerNote } : null,
		benefits: kind ? copy.benefits[kind].map((line) => line.replace("{city}", city ?? copy.cityFallback)) : [],
		form: { button: copy.button, placeholder: copy.placeholder, subscribed: copy.subscribed, yourCode: copy.yourCode },
		soon: copy.soon,
	};
}

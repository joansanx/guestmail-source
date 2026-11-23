// guestmail: the two made-up venues GuestMail runs as demo websites (scripts/demo_venues.mjs creates them). Their addresses
// are written here and nowhere else: the landing page links to them (lib/marketing/landing-templates.js), its demo with
// tabs shows the hotel's (lib/marketing/landing-demo.js) and their pages stay out of search engines (lib/archive-seo.js).
export const DEMO_VENUES = [
	{ kind: "hotel", name: "Hotel Brisa Lenta", url: "https://brisalenta.theguestmail.com", photo: "pool-loungers" },
	{ kind: "restaurant", name: "Tres Higueras", url: "https://treshigueras.theguestmail.com", photo: "tapas-table" },
];

export const DEMO_SLUGS = new Set(DEMO_VENUES.map(({ url }) => new URL(url).hostname.split(".")[0]));

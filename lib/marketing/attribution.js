// guestmail: where each new account came from, without cookies or a banner. The marketing pages carry the visit's UTM
// parameters and its external referrer (ref) on their links to /signin (components/marketing/SiteExtensions.jsx), so
// the sign-in page's own URL holds them, and the sign-in's request names that URL as its referer. Nothing is stored in
// the browser. ponytail: a visitor who leaves the marketing pages and comes back loses the first touch; a server-side
// visit log keyed by an anonymous id if that gap turns out to matter.
export const ATTRIBUTION_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref"];
const MAX_VALUE = 100;

export function readAttribution(url) {
	let params;
	try {
		params = new URL(String(url ?? "")).searchParams;
	} catch {
		return {};
	}
	return Object.fromEntries(
		ATTRIBUTION_PARAMS.map((key) => [key, String(params.get(key) ?? "").trim().slice(0, MAX_VALUE)]).filter(([, value]) => /^[\w.\-@:/ ]+$/.test(value))
	);
}

// The links that bring readers of a venue's website or emails to GuestMail: the venue's slug says who brought them.
export function getPoweredByUrl(appUrl, { slug, medium }) {
	const url = new URL("/", appUrl);
	url.search = new URLSearchParams({ utm_source: slug || "newsletter", utm_medium: medium, utm_campaign: "powered_by" }).toString();
	return url.toString();
}

export const POWERED_BY = {
	en: { sent: "Sent with GuestMail", made: "Made with GuestMail", create: "Create yours" },
	es: { sent: "Enviado con GuestMail", made: "Hecho con GuestMail", create: "Crea la tuya" },
};

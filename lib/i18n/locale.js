// guestmail: the dashboard's language, per person. It's a cookie the account menu sets (components/MenuLanguage.jsx);
// until they pick one, their browser's first language decides. The server reads it to know whether to send the
// translation along (components/TranslatePage.jsx), and never redirects on it.
export const LOCALE_COOKIE = "locale";
export const DEFAULT_LOCALE = "en";
// Each language under its own name, whatever the dashboard's.
export const LOCALES = [
	{ id: "en", label: "English" },
	{ id: "es", label: "Español" },
];

// The <html> attribute the page gets once it's translated, and how long the page waits for it before it shows anyway,
// in English: a translation that fails must never leave a blank page.
export const READY_ATTRIBUTE = "data-translated";
export const REVEAL_AFTER_MS = 1000;

const isLocale = (value) => LOCALES.some(({ id }) => id === value);

// languages: an Accept-Language header, or navigator.languages joined with commas. Its favorite language wins, not
// any Spanish further down the list.
export function resolveLocale(saved, languages) {
	if (isLocale(saved)) return saved;
	const [favorite] = String(languages ?? "")
		.split(",")
		.map((range) => {
			const [tag, quality] = range.trim().split(/\s*;\s*q=/);
			return { tag: tag.toLowerCase(), quality: quality === undefined ? 1 : Number(quality) || 0 };
		})
		.filter(({ tag, quality }) => tag && tag !== "*" && quality > 0)
		.sort((a, b) => b.quality - a.quality);
	const language = favorite?.tag.split("-")[0];
	return isLocale(language) ? language : DEFAULT_LOCALE;
}

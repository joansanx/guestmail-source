import { getCountryName } from "./countries.js";

// guestmail: what a hotel CRM knows about a guest besides their stays, read from whatever a PMS, a CSV or a person types:
// country (ISO code, the contact's own `country`), language (ISO 639-1), birthday (MM-DD, without the year: marketing
// needs the day, not the age) and a VIP mark. Each reader gives undefined for what it can't read, never a guess.
const DAY_MS = 24 * 60 * 60 * 1000;
const NAMES = ["en", "es", "de", "fr", "it", "pt", "ca"];
const LANGUAGE_CODES = [
	"es",
	"en",
	"de",
	"fr",
	"it",
	"pt",
	"ca",
	"eu",
	"gl",
	"nl",
	"sv",
	"no",
	"da",
	"fi",
	"pl",
	"ru",
	"uk",
	"cs",
	"ro",
	"hu",
	"el",
	"tr",
	"ar",
	"he",
	"zh",
	"ja",
	"ko",
];
const YES = new Set(["true", "yes", "y", "si", "sí", "1", "vip", "x"]);

let countryNames;
function countryByName() {
	if (countryNames) return countryNames;
	countryNames = new Map();
	const names = NAMES.map((locale) => new Intl.DisplayNames([locale], { type: "region", fallback: "none" }));
	for (let first = 65; first <= 90; first++) {
		for (let second = 65; second <= 90; second++) {
			const code = String.fromCharCode(first, second);
			if (!getCountryName(code)) continue;
			for (const display of names) {
				const name = display.of(code);
				if (name) countryNames.set(fold(name), code);
			}
		}
	}
	return countryNames;
}

let languageNames;
function languageByName() {
	if (languageNames) return languageNames;
	languageNames = new Map();
	const names = NAMES.map((locale) => new Intl.DisplayNames([locale], { type: "language", fallback: "none" }));
	for (const code of LANGUAGE_CODES) for (const display of names) languageNames.set(fold(display.of(code) ?? ""), code);
	return languageNames;
}

function fold(value) {
	return String(value ?? "")
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.trim()
		.toLowerCase();
}

// "ES", "es", "Spain", "España" -> "ES".
export function readCountryCode(value) {
	const text = String(value ?? "").trim();
	if (/^[a-z]{2}$/i.test(text)) return getCountryName(text.toUpperCase()) ? text.toUpperCase() : undefined;
	return countryByName().get(fold(text));
}

// "es", "es-ES", "ES", "Spanish", "español" -> "es".
export function readLanguage(value) {
	const text = String(value ?? "").trim();
	const code = /^([a-z]{2})([-_][a-z]{2,4})?$/i.exec(text)?.[1]?.toLowerCase();
	if (code) return LANGUAGE_CODES.includes(code) ? code : undefined;
	return languageByName().get(fold(text));
}

// "1985-03-07", "07/03/1985", "7/3", "03-07" (already MM-DD) -> "03-07". Slashes are day first, as in Spain and most of
// Europe. ponytail: a US file with month first reads wrong on days 1 to 12; a column format setting if one shows up.
export function readBirthday(value) {
	const text = String(value ?? "").trim();
	let month;
	let day;
	let match;
	if ((match = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(text))) [, , month, day] = match;
	else if ((match = /^(\d{1,2})[/.](\d{1,2})(?:[/.](\d{2,4}))?$/.exec(text))) [, day, month] = match;
	else if ((match = /^(\d{2})-(\d{2})$/.exec(text))) [, month, day] = match;
	else return undefined;
	const date = new Date(Date.UTC(2000, Number(month) - 1, Number(day)));
	if (date.getUTCMonth() !== Number(month) - 1 || date.getUTCDate() !== Number(day)) return undefined;
	return `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// A reservation's status in a PMS's words: cancelled or a no-show. Anything else (confirmed, checked in, checked out) is
// a stay that happened or will, so it has none. Accents go before the match, so cancelación reads cancelacin.
export function readStayStatus(value) {
	const text = String(value ?? "")
		.toLowerCase()
		.replace(/[^a-z]/g, "");
	if (/^(cancel|anulad)/.test(text)) return "cancelled";
	if (/^(noshow|nopresentad|nosepresent)/.test(text)) return "no_show";
	return undefined;
}

export function readVip(value) {
	if (typeof value === "boolean") return value;
	const text = fold(value);
	if (!text) return undefined;
	return YES.has(text);
}

// The MM-DD days from now through the next `days`, for birthday segments: a list, so it crosses the new year.
export function getUpcomingDays(days, now = new Date()) {
	return Array.from({ length: days + 1 }, (_, offset) => new Date(now.getTime() + offset * DAY_MS).toISOString().slice(5, 10));
}

export function formatBirthday(value) {
	const [month, day] = String(value ?? "")
		.split("-")
		.map(Number);
	if (!month || !day) return null;
	return new Intl.DateTimeFormat("en-US", {
		month: "long",
		day: "numeric",
		timeZone: "UTC",
	}).format(new Date(Date.UTC(2000, month - 1, day)));
}

export function getLanguageName(code) {
	return code ? (new Intl.DisplayNames(["en"], { type: "language", fallback: "none" }).of(code) ?? code) : null;
}

export const LANGUAGE_OPTIONS = LANGUAGE_CODES.map((code) => ({
	value: code,
	label: getLanguageName(code),
}));

// Nights between arrival and departure, and days booked ahead, for a stay's segments. Undefined without both dates.
export function getNights(from, to) {
	if (!from || !to) return undefined;
	const nights = Math.round((new Date(to).getTime() - new Date(from).getTime()) / DAY_MS);
	return nights >= 0 && nights <= 365 ? nights : undefined;
}

export function getLeadDays(bookedAt, from) {
	if (!bookedAt || !from) return undefined;
	const days = Math.floor((new Date(from).getTime() - new Date(bookedAt).getTime()) / DAY_MS);
	return days >= 0 && days <= 1000 ? days : undefined;
}

// Every country, by its English name, for the segment editor and the contact form.
export function getCountryOptions() {
	const options = [];
	for (let first = 65; first <= 90; first++) {
		for (let second = 65; second <= 90; second++) {
			const code = String.fromCharCode(first, second);
			const label = getCountryName(code);
			if (label) options.push({ value: code, label });
		}
	}
	return options.sort((a, b) => a.label.localeCompare(b.label));
}

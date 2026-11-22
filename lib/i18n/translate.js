// guestmail: the dashboard's translation, as a function of text alone: createTranslator(dictionary)(english) is the
// translation, or null when the dictionary doesn't have that exact text. Nothing here knows about the page: the walk
// over it is lib/i18n/dom.js.
//
// A dictionary entry is "English": "Español". A key with placeholders is a pattern, for text the page builds:
//   {n}      a number as the page writes it (12, 1,204, 3.5)
//   {x}      a name, kept as it is: a person's, a segment's, an address, a subject. Not text that starts with a plain
//            lowercase word and goes on ("it there", "our kitchen"): that's the rest of an English sentence the
//            dictionary doesn't have, and "Remove {x}" must not translate half of it. And not across a middle dot,
//            which upstream puts between two things it says
//   {q}      any text at all, kept as it is: what someone typed. Only between the quotes the page puts around it,
//            written in the key (“{q}”), which is what says where it ends
//   {e}      text the dictionary has as it is, not through another pattern
//   {t}      text the dictionary translates too: a label inside a sentence. Text it doesn't have isn't a match, so
//            the sentence stays whole in English rather than half translated
//   {month}  and the other lists in `lists`: one of their keys, replaced by its value
//   {date}   and the other `shapes`: text of one form (a regular expression), translated like {t}
// The same placeholder twice is told apart by position, or by a digit ({x1}, {x2}) when the translation reorders them.
// A pattern's translation can depend on its first number: { one: "{n} contacto", other: "{n} contactos" }.
// `formatNumber` rewrites each number a pattern carries, and a text that is nothing but a number ("1,204", "+8.5%").
const NUMBER = /[+−]?\d+(?:[.,]\d+)*/g;
const BARE_NUMBER = /^([+\-−$€]{0,2})(\d+(?:[.,]\d+)*)([%KMB]?)$/;
const PLACEHOLDER = /\{([a-z]+)(\d?)\}/g;
const CACHE_SIZE = 5000;

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const collapse = (text) => text.replace(/\s+/g, " ").trim();

function compile(key, lists, shapes) {
	const tokens = [];
	let source = "";
	let last = 0;
	for (const match of key.matchAll(PLACEHOLDER)) {
		const [token, type] = match;
		source += escapeRegExp(key.slice(last, match.index));
		last = match.index + token.length;
		if (type === "n") source += "([+−]?\\d+(?:[.,]\\d+)*)";
		else if (type === "x") source += "((?!\\p{Ll}+ )(?:(?! · ).)+?)";
		else if (type === "t" || type === "e" || type === "q") source += "(.+?)";
		else if (shapes[type]) source += `(${shapes[type]})`;
		else if (lists[type]) source += `(${Object.keys(lists[type]).sort((a, b) => b.length - a.length).map(escapeRegExp).join("|")})`;
		else throw new Error(`"${key}" has a placeholder the dictionary doesn't define: ${token}`);
		tokens.push({ token, type });
	}
	// first: the character a text has to start with for the pattern to be worth a try, when it starts with one.
	return { tokens, first: key.startsWith("{") ? null : key[0], regex: new RegExp(`^${source}${escapeRegExp(key.slice(last))}$`, "u") };
}

export function createTranslator({ entries, lists = {}, shapes = {}, formatNumber = (number) => number }) {
	const signed = (number) => (/^[+−]/.test(number) ? `${number[0]}${formatNumber(number.slice(1))}` : formatNumber(number));
	const exact = new Map();
	const numeric = new Map();
	const patterns = [];
	for (const [key, value] of Object.entries(entries)) {
		const tokens = [...key.matchAll(PLACEHOLDER)];
		if (tokens.length === 0) exact.set(key, value);
		// "Step {n} of 3" names one number itself, so it's matched as written, not by counting its numbers.
		else if (tokens.every(([token]) => token === "{n}") && !/\d/.test(key.replace(PLACEHOLDER, ""))) numeric.set(key, value);
		else patterns.push({ value, ...compile(key, lists, shapes) });
	}
	const cache = new Map();

	// Null when a {t} carries text the dictionary doesn't have.
	function fill(value, tokens, captures) {
		const first = tokens.findIndex(({ type }) => type === "n");
		const template = typeof value === "string" ? value : Number(captures[first]?.replace(/\D/g, "")) === 1 ? value.one : value.other;
		const queues = new Map();
		for (const [index, { token, type }] of tokens.entries()) {
			const capture = captures[index];
			const text = type === "t" || shapes[type] ? translate(capture) : type === "e" ? (exact.get(capture) ?? null) : type === "n" ? signed(capture) : lists[type] ? lists[type][capture] : capture;
			if (text === null) return null;
			queues.set(token, [...(queues.get(token) ?? []), text]);
		}
		return template.replace(PLACEHOLDER, (token) => queues.get(token)?.shift() ?? token);
	}

	// text: already collapsed.
	function core(text) {
		const direct = exact.get(text);
		if (direct !== undefined) return direct;
		if (cache.has(text)) return cache.get(text);
		let result = null;
		const numbers = text.match(NUMBER);
		const counted = numbers && numeric.get(text.replace(NUMBER, "{n}"));
		if (counted) {
			result = fill(counted, numbers.map(() => ({ token: "{n}", type: "n" })), numbers);
		} else {
			for (const { regex, tokens, value, first } of patterns) {
				if (first !== null && first !== text[0]) continue;
				const match = regex.exec(text);
				result = match && fill(value, tokens, match.slice(1));
				if (result !== null) break;
			}
		}
		if (result === null) {
			const bare = BARE_NUMBER.exec(text);
			const number = bare && formatNumber(bare[2]);
			if (number && number !== bare[2]) result = `${bare[1]}${number}${bare[3]}`;
		}
		if (cache.size >= CACHE_SIZE) cache.clear();
		cache.set(text, result);
		return result;
	}

	// The translation with the text's own spaces around it, or null.
	function translate(text) {
		if (typeof text !== "string") return null;
		const inner = collapse(text);
		if (!inner) return null;
		const translated = core(inner);
		if (translated === null || translated === undefined) return null;
		return `${/^\s*/.exec(text)[0]}${translated}${/\s*$/.exec(text)[0]}`;
	}
	return translate;
}

// For scripts/i18n_extract.mjs: "Sent to {state.sent} guests" in the code is the dictionary's "Sent to {n} guests".
export const patternKey = (text) => text.replace(/\{[^}]*\}/g, "{}");

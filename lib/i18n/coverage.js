// guestmail: what scripts/i18n_extract.mjs asks the Spanish dictionary: whether it has a string the code shows.
import dictionary from "./es/index.js";
import { covered, notText, same } from "./es/kept.js";
import { createTranslator, patternKey } from "./translate.js";

const sets = {
	translated: new Set([...Object.keys(dictionary.entries), ...covered].map(patternKey)),
	same: new Set(same.map(patternKey)),
	"not text": new Set(notText.map(patternKey)),
};

// The dictionary without the patterns that keep a part as it was written ({x}, {q}): what these translate is Spanish
// all through.
const withoutNames = { ...dictionary, entries: Object.fromEntries(Object.entries(dictionary.entries).filter(([key]) => !/\{[xq]\d?\}/.test(key))) };
export const translateWhole = createTranslator(withoutNames);

// "translated" (also what patterns compose without leaving a word in English, like "Off." from "Off", and `covered`:
// text the code builds from parts lib/i18n/es/patterns.js translates one by one), "same" (reads the same in Spanish: a
// name, a term people search as it is), "not text" (the extractor took it for text and it isn't the dashboard's to
// translate: code, what goes to guests, what goes to the platform's admins), or null: missing.
export function isTranslated(text) {
	const key = patternKey(text);
	const state = Object.keys(sets).find((name) => sets[name].has(key));
	if (state) return state;
	return !/\{[^}]*\}/.test(text) && translateWhole(text) !== null ? "translated" : null;
}

export const dictionaryKeys = () => Object.keys(dictionary.entries);

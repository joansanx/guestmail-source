// guestmail: the dashboard's Spanish. `entries` is English as upstream wrote it, to the Spanish of Spain a hotel or
// restaurant owner reads: "tú", their words and not a developer's. Each file is one part of the dashboard, in the
// order scripts/i18n_extract.mjs lists its screens; a string two screens share lives in the first.
//
// A key with {placeholders} is a pattern (lib/i18n/translate.js says what each means). What's left in English on
// purpose is in kept.js, which only the coverage reads: it never reaches the browser.
import account from "./account.js";
import campaigns from "./campaigns.js";
import contacts from "./contacts.js";
import errors from "./errors.js";
import { formatNumber, lists, patterns, shapes } from "./patterns.js";
import screens from "./screens.js";
import settings from "./settings.js";
import shell from "./shell.js";

const dictionary = {
	entries: { ...errors, ...account, ...settings, ...screens, ...contacts, ...campaigns, ...shell, ...patterns },
	lists,
	shapes,
	formatNumber,
};

export default dictionary;

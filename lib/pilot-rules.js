// guestmail: the autopilot's rules, in code and nowhere else (lib/pilot.js runs them). The menu a venue's owner
// confirmed is the only source of what its emails may say: the model that writes them only writes. Nothing here reads
// the database or the network.
export const FREQUENCIES = ["weekly", "biweekly", "monthly"];
export const MENU_SOURCES = ["url", "pdf"];
export const MAX_SECTIONS = 40;
export const MAX_ITEMS = 300;
export const MAX_NAME_LENGTH = 120;
export const MAX_DESCRIPTION_LENGTH = 300;
export const MAX_PRICE_LENGTH = 40;
// What the writer gets to choose from at each proposal, and how many of them one email features at most.
export const MAX_CANDIDATES = 60;
export const MAX_FEATURED = 3;
const DAY_MS = 86_400_000;

function clean(value, max) {
	return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

// A menu as it's kept, from what the agent read or the owner typed: trimmed, without empty items or sections, within
// the limits. Two items with one name in a section are one.
export function cleanSections(sections) {
	let left = MAX_ITEMS;
	return (Array.isArray(sections) ? sections : [])
		.slice(0, MAX_SECTIONS)
		.map((section) => {
			const seen = new Set();
			const items = (Array.isArray(section?.items) ? section.items : [])
				.map((item) => ({ name: clean(item?.name, MAX_NAME_LENGTH), description: clean(item?.description, MAX_DESCRIPTION_LENGTH), price: clean(item?.price, MAX_PRICE_LENGTH) }))
				.filter(({ name }) => plain(name) && !seen.has(plain(name)) && seen.add(plain(name)))
				.slice(0, Math.max(0, left));
			left -= items.length;
			return { name: clean(section?.name, MAX_NAME_LENGTH), items };
		})
		.filter(({ items }) => items.length > 0);
}

export function listItems(sections) {
	return (sections ?? []).flatMap((section) => section.items.map((item) => ({ section: section.name, name: item.name, description: item.description ?? "", price: item.price ?? "" })));
}

// Letters and digits only, without accents or case: how a name is compared and looked for.
export function plain(text) {
	return String(text ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

// ─── The rhythm ───────────────────────────────────────────────────────────────

// The first day (00:00 UTC) of the cycle a moment is in: the last time the owner's weekday came around, every week,
// every other week (counted from 1970, so it never drifts) or the first one of each month. One proposal per cycle.
// ponytail: days are UTC, a newsletter has no time zone yet.
export function getCycleStart({ frequency, weekday }, now = new Date()) {
	if (!FREQUENCIES.includes(frequency) || !Number.isInteger(weekday) || weekday < 0 || weekday > 6) return null;
	const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
	const last = today - ((new Date(today).getUTCDay() - weekday + 7) % 7) * DAY_MS;
	if (frequency === "weekly") return new Date(last);
	if (frequency === "biweekly") return new Date(Math.floor(last / (7 * DAY_MS)) % 2 === 0 ? last : last - 7 * DAY_MS);
	const first = Date.UTC(new Date(last).getUTCFullYear(), new Date(last).getUTCMonth(), 1);
	return new Date(first + ((weekday - new Date(first).getUTCDay() + 7) % 7) * DAY_MS);
}

// When the cycle after that one starts.
export function getNextCycleStart(settings, now = new Date()) {
	const start = getCycleStart(settings, now);
	if (!start) return null;
	for (let day = 1; day <= 62; day += 1) {
		const next = getCycleStart(settings, new Date(start.getTime() + day * DAY_MS));
		if (next > start) return next;
	}
	return null;
}

export function toCycleKey(start) {
	return start.toISOString().slice(0, 10);
}

// ─── What to write about ──────────────────────────────────────────────────────

// The items a new proposal may feature: those no proposal showed the owner yet. history: what each past proposal
// featured, newest first. Once the whole menu went by, it starts over, leaving out what the latest ones featured.
export function pickCandidates(sections, history = []) {
	const items = listItems(sections);
	let used = new Set();
	for (const names of history) {
		const next = new Set([...used, ...names.map(plain)]);
		if (!items.some(({ name }) => !next.has(plain(name)))) break;
		used = next;
	}
	return items.filter(({ name }) => !used.has(plain(name))).slice(0, MAX_CANDIDATES);
}

// ─── The fact gate ────────────────────────────────────────────────────────────

const CURRENCY = "€|\\$|£|eur(?:os?)?|usd|d[oó]lares?|dollars?|gbp|pounds?|libras?|pesos?|mxn|chf|francos?";
const PRICE_PATTERN = new RegExp(`(?:(?:${CURRENCY})\\s?\\d[\\d.,]*|\\d[\\d.,]*\\s?(?:${CURRENCY})(?![\\p{L}]))`, "giu");
const FIGURE_PATTERN = /\d[\d.,:/-]*\d|\d/g;

// "12,50" and "12.5" are one amount, and "1.200" is a thousand two hundred: a separator before exactly three digits
// groups thousands.
export function toAmount(figure) {
	const digits = String(figure).match(/\d[\d.,]*/)?.[0].replace(/[.,]+$/, "") ?? "";
	const last = Math.max(digits.lastIndexOf("."), digits.lastIndexOf(","));
	const isDecimal = last > -1 && digits.length - last - 1 !== 3;
	return Number(isDecimal ? `${digits.slice(0, last).replace(/[.,]/g, "")}.${digits.slice(last + 1)}` : digits.replace(/[.,]/g, ""));
}

// What a draft says that the confirmed menu doesn't, one reason each: none means it can go to the owner. featured: the
// names the writer says it's about. candidates: the menu's items it could choose from. venueText: the venue's own name
// and address, whose numbers aren't facts about the menu. A prompt alone has been measured not to keep a model from
// making facts up, so this decides, and a draft with a single reason is dropped:
// - it features 1 to MAX_FEATURED items, each on the menu and each named as the menu writes it,
// - every price is the price of an item it features,
// - every other figure (an hour, a date, a discount, a weight) is in what the menu says of those items.
// ponytail: an invented dish that comes with no figure passes. Names can't be told from prose in code, so the owner,
// who reads the whole draft before anything is scheduled, is that check.
export function findDraftProblems({ subject = "", previewText = "", markdown = "" }, { featured = [], candidates = [], venueText = "" }) {
	const byName = new Map(candidates.map((item) => [plain(item.name), item]));
	const names = [...new Set(featured.map(plain).filter(Boolean))];
	const items = names.map((name) => byName.get(name)).filter(Boolean);
	const problems = featured.filter((name) => !byName.has(plain(name))).map((name) => `"${clean(name, 80)}" isn't on the menu`);
	if (names.length === 0) problems.push("It features nothing from the menu");
	if (names.length > MAX_FEATURED) problems.push(`It features more than ${MAX_FEATURED} items`);

	const text = `${subject}\n${previewText}\n${markdown}`.replace(/\]\([^)]*\)/g, "]").replace(/https?:\/\/\S+/g, " ");
	const said = ` ${plain(text)} `;
	for (const item of items) if (!said.includes(` ${plain(item.name)} `)) problems.push(`It doesn't name "${item.name}" as the menu writes it`);

	const prices = new Set(items.flatMap((item) => (item.price.match(/\d[\d.,]*/g) ?? []).map(toAmount)));
	for (const price of new Set(text.match(PRICE_PATTERN) ?? [])) {
		if (!prices.has(toAmount(price))) problems.push(`The price "${price.trim()}" isn't the price of an item it features`);
	}

	const known = `${items.map((item) => `${item.section} ${item.name} ${item.description} ${item.price}`).join(" ")} ${venueText}`.replace(/[\s.,]/g, "");
	for (const figure of new Set(text.replace(PRICE_PATTERN, " ").match(FIGURE_PATTERN) ?? [])) {
		if (/^[1-9]$/.test(figure)) continue;
		if (!known.includes(figure.replace(/[.,]/g, ""))) problems.push(`The figure "${figure}" isn't on the menu`);
	}
	return problems;
}

import { cleanTag } from "./contact-fields.js";
import { getCountryName } from "./countries.js";
import { LANGUAGE_OPTIONS, getLanguageName, getUpcomingDays } from "./guest-profile.js";

// A segment picks some of a newsletter's contacts with a few conditions, kept as written and compiled here into one
// MongoDB filter on contacts. Sending, counts, the contacts list, its export, the API and MCP all use compileSegment,
// so a segment picks the same contacts everywhere. No database code: the dashboard's segment editor reads the fields.
// Conditions on the account's own fields name them fields.<key>; checking those needs the account's fields.

const DAY_MS = 24 * 60 * 60 * 1000;
const CUSTOM_FIELD_PATTERN = /^fields\.[a-z][a-z0-9_]{0,29}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATE_FORMAT = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export const SEGMENT_MATCHES = ["all", "any"];
export const SEGMENT_DELETED = "Its segment was deleted: pick who gets it";
export const MAX_SEGMENT_CONDITIONS = 10;
export const MAX_SEGMENT_NAME = 60;

const VALUES = {
	days: { max: 3650, problem: "a whole number of days, 1 to 3,650" },
	count: { max: 100_000, problem: "a whole number, 1 to 100,000" },
	date: { problem: "a date, YYYY-MM-DD" },
	source: { max: 100, problem: "a source, 100 characters at most" },
	text: { max: 254, problem: "some text, 254 characters at most" },
	tag: { problem: "a tag, 40 characters at most, without commas" },
	number: { problem: "a number" },
	country: { problem: "a country, as its two-letter code like ES" },
	language: { problem: "a language, as its two-letter code like es" },
};

// Each field's ops, in the order the editor offers them. A date field's ops count days back from the moment the segment
// is used, so "in the last 30 days" moves with time. A contact without the date never did it: missing values count as
// "never" and as 0.
export const SEGMENT_FIELDS = {
	opened: {
		label: "Opened",
		path: "lastOpenAt",
		ops: {
			within: { label: "in the last", value: "days", unit: "days" },
			not_within: { label: "not in the last", value: "days", unit: "days" },
			never: { label: "never" },
		},
	},
	clicked: {
		label: "Clicked",
		path: "lastClickAt",
		ops: {
			within: { label: "in the last", value: "days", unit: "days" },
			not_within: { label: "not in the last", value: "days", unit: "days" },
			never: { label: "never" },
		},
	},
	missed_issues: {
		label: "Missed",
		path: "ignoredIssues",
		ops: {
			at_least: { label: "at least", value: "count", unit: "issues in a row" },
			less_than: { label: "fewer than", value: "count", unit: "issues in a row" },
		},
	},
	emails_opened: {
		label: "Emails opened",
		path: "stats.opens",
		ops: {
			at_least: { label: "at least", value: "count" },
			less_than: { label: "fewer than", value: "count" },
		},
	},
	signed_up: {
		label: "Signed up",
		path: "subscribedAt",
		ops: {
			within: { label: "in the last", value: "days", unit: "days" },
			not_within: { label: "more than", value: "days", unit: "days ago" },
			before: { label: "before", value: "date" },
			since: { label: "since", value: "date" },
		},
	},
	source: {
		label: "Source",
		path: "source",
		ops: {
			is: { label: "is", value: "source" },
			is_not: { label: "isn't", value: "source" },
		},
	},
	email: {
		label: "Email",
		path: "email",
		ops: {
			contains: { label: "contains", value: "text" },
			ends_with: { label: "ends with", value: "text" },
		},
	},
	tag: {
		label: "Tag",
		path: "tags",
		ops: {
			has: { label: "is", value: "tag" },
			has_not: { label: "isn't", value: "tag" },
		},
	},
	first_name: {
		label: "First name",
		path: "firstName",
		ops: {
			is_set: { label: "is known" },
			not_set: { label: "is unknown" },
		},
	},
	// guestmail: stays and reservations (models/Contact.js guest). ponytail: no index on these paths yet, a segment
	// reads the newsletter's active contacts; add { newsletterId, "guest.lastVisitAt" } when lists pass ~100k.
	last_visit: {
		label: "Last visit",
		path: "guest.lastVisitAt",
		ops: {
			within: { label: "in the last", value: "days", unit: "days" },
			not_within: { label: "not in the last", value: "days", unit: "days" },
			never: { label: "never" },
		},
	},
	visits: {
		label: "Visits",
		path: "guest.visitCount",
		ops: {
			at_least: { label: "at least", value: "count" },
			less_than: { label: "fewer than", value: "count" },
		},
	},
	// guestmail: a condition on a stay's own value (elem) is met by any one stay: "a stay of at least 7 nights". Text
	// compares without case.
	booking_channel: {
		label: "Booking channel",
		path: "guest.visits",
		elem: "channel",
		caseless: true,
		ops: {
			is: { label: "is", value: "text" },
			contains: { label: "contains", value: "text" },
			is_not: { label: "isn't", value: "text" },
		},
	},
	total_spent: {
		label: "Total spent",
		path: "guest.totalSpent",
		ops: {
			at_least: { label: "at least", value: "number" },
			less_than: { label: "less than", value: "number" },
		},
	},
	room_type: {
		label: "Room type",
		path: "guest.visits",
		elem: "roomType",
		caseless: true,
		ops: {
			contains: { label: "contains", value: "text" },
			is: { label: "is", value: "text" },
			is_not: { label: "isn't", value: "text" },
		},
	},
	party_size: {
		label: "Party size",
		path: "guest.visits",
		elem: "partySize",
		ops: {
			at_least: { label: "at least", value: "count", unit: "people" },
			is: { label: "exactly", value: "count", unit: "people" },
			less_than: { label: "fewer than", value: "count", unit: "people" },
		},
	},
	nights: {
		label: "Nights in a stay",
		path: "guest.visits",
		elem: "nights",
		ops: {
			at_least: { label: "at least", value: "count", unit: "nights" },
			less_than: { label: "fewer than", value: "count", unit: "nights" },
		},
	},
	lead_time: {
		label: "Booked ahead",
		path: "guest.visits",
		elem: "leadDays",
		ops: {
			at_least: { label: "at least", value: "count", unit: "days" },
			less_than: { label: "less than", value: "count", unit: "days" },
		},
	},
	stay: {
		label: "Stay",
		path: "guest.visits",
		ops: {
			arriving_in: { label: "arrives in the next", value: "days", unit: "days" },
			staying_now: { label: "is staying now" },
			left_in: { label: "left in the last", value: "days", unit: "days" },
			none_upcoming: { label: "has nothing booked" },
		},
	},
	country: {
		label: "Country",
		path: "country",
		ops: {
			is: { label: "is", value: "country" },
			is_not: { label: "isn't", value: "country" },
		},
	},
	language: {
		label: "Language",
		path: "guest.language",
		ops: {
			is: { label: "is", value: "language" },
			is_not: { label: "isn't", value: "language" },
		},
	},
	birthday: {
		label: "Birthday",
		path: "guest.birthday",
		ops: {
			in_next: { label: "in the next", value: "days", unit: "days" },
			this_month: { label: "this month" },
		},
	},
	vip: {
		label: "VIP",
		path: "guest.vip",
		ops: {
			yes: { label: "is VIP" },
			no: { label: "isn't VIP" },
		},
	},
};

// The ops of the account's own fields, by type. Text compares without case; a contact without a value meets only "isn't
// set".
export const CUSTOM_FIELD_OPS = {
	text: {
		is: { label: "is", value: "text" },
		contains: { label: "contains", value: "text" },
		is_set: { label: "is set" },
		not_set: { label: "isn't set" },
	},
	number: {
		at_least: { label: "at least", value: "number" },
		less_than: { label: "less than", value: "number" },
		is_set: { label: "is set" },
		not_set: { label: "isn't set" },
	},
	date: {
		before: { label: "before", value: "date" },
		since: { label: "since", value: "date" },
		is_set: { label: "is set" },
		not_set: { label: "isn't set" },
	},
};

export const SEGMENT_FIELD_NAMES = Object.keys(SEGMENT_FIELDS);
// guestmail: the fields a hotel CRM has, shown apart in the editor.
export const GUEST_SEGMENT_FIELDS = ["last_visit", "visits", "stay", "total_spent", "room_type", "party_size", "nights", "lead_time", "booking_channel", "vip", "country", "language", "birthday"];
export const SEGMENT_OPS = [
	...new Set([...Object.values(SEGMENT_FIELDS), ...Object.values(CUSTOM_FIELD_OPS).map((ops) => ({ ops }))].flatMap(({ ops }) => Object.keys(ops))),
];

// A built-in field's name, or fields.<key> for one of the account's own.
export function isSegmentFieldName(name) {
	return Object.hasOwn(SEGMENT_FIELDS, name) || CUSTOM_FIELD_PATTERN.test(String(name ?? ""));
}

function isCustomField(name) {
	return CUSTOM_FIELD_PATTERN.test(String(name ?? ""));
}

// What the editor and the checks know of a field: its label, path and ops. fields: the account's own (Account.
// contactFields). null for a name that's neither.
export function getSegmentField(name, fields = []) {
	if (Object.hasOwn(SEGMENT_FIELDS, name)) return SEGMENT_FIELDS[name];
	if (!isCustomField(name)) return null;
	const definition = fields.find(({ key }) => `fields.${key}` === name);
	return definition ? { label: definition.label, path: name, ops: CUSTOM_FIELD_OPS[definition.type], type: definition.type } : null;
}

// The sources GuestMail sets itself (Contact.source). An API caller's own source, like "podcast", shows as written.
export const CONTACT_SOURCES = {
	website: { label: "Signup form", phrase: "the signup form" },
	embed: { label: "Form on your site", phrase: "the form on your site" },
	import: { label: "Import", phrase: "an import" },
	dashboard: { label: "Added by hand", phrase: "the dashboard" },
	api: { label: "API", phrase: "the API" },
};

// How far back the segments' pages count opens and clicks.
export const ACTIVITY_DAYS = 30;

// Starting points in the segment editor.
export const SEGMENT_PRESETS = [
	{ name: "Engaged", match: "all", conditions: [{ field: "opened", op: "within", value: 30 }] },
	{ name: "New", match: "all", conditions: [{ field: "signed_up", op: "within", value: 30 }] },
	{ name: "Inactive", match: "all", conditions: [{ field: "missed_issues", op: "at_least", value: 5 }] },
	{
		name: "Never opened",
		match: "all",
		conditions: [
			{ field: "opened", op: "never" },
			{ field: "signed_up", op: "not_within", value: 30 },
		],
	},
];

function readValue(type, value) {
	if (type === "days" || type === "count") {
		const number = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
		return Number.isInteger(number) && number >= 1 && number <= VALUES[type].max ? number : null;
	}
	if (type === "number") {
		const number = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
		return typeof number === "number" && Number.isFinite(number) ? number : null;
	}
	if (typeof value !== "string") return null;
	if (type === "tag") return cleanTag(value);
	if (type === "country") return getCountryName(value.trim().toUpperCase()) ? value.trim().toUpperCase() : null;
	if (type === "language") return LANGUAGE_OPTIONS.some((option) => option.value === value.trim().toLowerCase()) ? value.trim().toLowerCase() : null;
	if (type === "date") {
		const text = value.trim();
		const date = DATE_PATTERN.test(text) ? startOfDay(text) : null;
		return date && !Number.isNaN(date.getTime()) && date.toISOString().startsWith(text) ? text : null;
	}
	const text = type === "text" ? value.trim().toLowerCase() : value.trim();
	return text && text.length <= VALUES[type].max ? text : null;
}

// The rules as stored, or what's wrong with them, for people (the editor) and agents (the API) alike. fields: the
// account's own, which conditions on fields.<key> need.
export function checkSegmentRules({ match = "all", conditions } = {}, { fields = [] } = {}) {
	if (!SEGMENT_MATCHES.includes(match)) return { problem: "match must be all or any" };
	if (!Array.isArray(conditions) || conditions.length === 0) return { problem: "Add a condition" };
	if (conditions.length > MAX_SEGMENT_CONDITIONS) return { problem: `${MAX_SEGMENT_CONDITIONS} conditions at most` };
	const checked = [];
	for (const [index, condition] of conditions.entries()) {
		const where = conditions.length > 1 ? `Condition ${index + 1}: ` : "";
		const field = getSegmentField(condition?.field, fields);
		if (!field && isCustomField(condition?.field)) return { problem: `${where}${condition.field}: the account has no such field` };
		if (!field) return { problem: `${where}field must be one of ${SEGMENT_FIELD_NAMES.join(", ")}, or fields.<key> for a field of the account` };
		const op = Object.hasOwn(field.ops, String(condition.op)) ? field.ops[condition.op] : null;
		if (!op) return { problem: `${where}${condition.field} takes ${Object.keys(field.ops).join(", ")}` };
		if (!op.value) {
			checked.push({ field: condition.field, op: condition.op });
			continue;
		}
		const value = readValue(op.value, condition.value);
		if (value === null) return { problem: `${where}${condition.field} ${condition.op} needs ${VALUES[op.value].problem}` };
		checked.push({ field: condition.field, op: condition.op, value });
	}
	return { rules: { match, conditions: checked } };
}

// One filter on contacts for checked rules, the dates counted back from now. It goes inside $and next to the account,
// newsletter and status, so it can't widen a query. Mongoose casts its values, so it's for Contact queries only.
export function compileSegment({ match, conditions }, { now = new Date() } = {}) {
	const filters = conditions.map((condition) => compileCondition(condition, now));
	if (filters.length === 1) return filters[0];
	return { [match === "any" ? "$or" : "$and"]: filters };
}

function compileCondition({ field, op, value }, now) {
	if (isCustomField(field)) return compileCustomCondition({ path: field, op, value });
	const { path, elem, caseless } = SEGMENT_FIELDS[field];
	if (elem) return compileStayValue({ path, elem, caseless, op, value });
	if (field === "stay") return compileStay(path, op, value, now);
	switch (op) {
		case "in_next":
			return { [path]: { $in: [...new Set(getUpcomingDays(Math.min(value, 365), now))] } };
		case "this_month":
			return { [path]: { $regex: `^${now.toISOString().slice(5, 7)}-` } };
		case "yes":
			return { [path]: true };
		case "no":
			return { [path]: { $ne: true } };
		case "within":
			return { [path]: { $gte: daysBefore(now, value) } };
		// Not opened lately includes never opened; a signup date is always there.
		case "not_within":
			return field === "signed_up" ? { [path]: { $lt: daysBefore(now, value) } } : { [path]: { $not: { $gte: daysBefore(now, value) } } };
		case "never":
			return { [path]: null };
		case "at_least":
			return { [path]: { $gte: value } };
		case "less_than":
			return { [path]: { $not: { $gte: value } } };
		case "before":
			return { [path]: { $lt: startOfDay(value) } };
		case "since":
			return { [path]: { $gte: startOfDay(value) } };
		case "is":
			return { [path]: value };
		case "is_not":
			return { [path]: { $ne: value } };
		case "contains":
			return { [path]: { $regex: escapeRegex(value) } };
		case "ends_with":
			return { [path]: { $regex: `${escapeRegex(value)}$` } };
		// A tag in the contact's list, or not in it (a contact without tags too).
		case "has":
			return { [path]: value };
		case "has_not":
			return { [path]: { $ne: value } };
		// null also matches a contact without the property.
		case "is_set":
			return { [path]: { $nin: [null, ""] } };
		case "not_set":
			return { [path]: { $in: [null, ""] } };
		default:
			throw new Error(`Unknown segment op ${op}`);
	}
}

// guestmail: any one stay meets it, or none does for "isn't". A contact without stays meets only "isn't".
function compileStayValue({ path, elem, caseless, op, value }) {
	const exact = caseless ? { $regex: `^${escapeRegex(value)}$`, $options: "i" } : value;
	switch (op) {
		case "at_least":
			return { [path]: { $elemMatch: { [elem]: { $gte: value } } } };
		case "less_than":
			return { [path]: { $elemMatch: { [elem]: { $lt: value } } } };
		case "is":
			return { [path]: { $elemMatch: { [elem]: exact } } };
		case "contains":
			return { [path]: { $elemMatch: { [elem]: { $regex: escapeRegex(value), $options: "i" } } } };
		case "is_not":
			return { [path]: { $not: { $elemMatch: { [elem]: exact } } } };
		default:
			throw new Error(`Unknown segment op ${op}`);
	}
}

// Stays by their dates, counted from the moment the segment is used. Most systems give a departure as a day, so a guest
// stays through the day they check out and has left from the next one: "left in the last 2 days" is the two days before
// today, never the morning of the checkout. A reservation has no departure: it counts as left the day after its date.
function compileStay(path, op, value, now) {
	// A cancelled reservation or a no-show never arrives, stays or leaves.
	const kept = { status: null };
	const today = startOfDay(now.toISOString().slice(0, 10));
	switch (op) {
		case "arriving_in":
			return { [path]: { $elemMatch: { ...kept, from: { $gte: now, $lt: daysAfter(now, value) } } } };
		case "staying_now":
			return { [path]: { $elemMatch: { ...kept, from: { $lte: now }, to: { $gte: today } } } };
		case "left_in": {
			const range = { $gte: daysBefore(today, value), $lt: today };
			return { [path]: { $elemMatch: { ...kept, $or: [{ to: range }, { to: null, from: range }] } } };
		}
		case "none_upcoming":
			return { [path]: { $not: { $elemMatch: { ...kept, from: { $gte: now } } } } };
		default:
			throw new Error(`Unknown segment op ${op}`);
	}
}

// A field of the account: text without case, and a contact without a value never meets a comparison.
function compileCustomCondition({ path, op, value }) {
	switch (op) {
		case "is":
			return { [path]: { $regex: `^${escapeRegex(value)}$`, $options: "i" } };
		case "contains":
			return { [path]: { $regex: escapeRegex(value), $options: "i" } };
		case "at_least":
			return { [path]: { $gte: value } };
		case "less_than":
			return { [path]: { $lt: value } };
		case "before":
			return { [path]: { $lt: startOfDay(value) } };
		case "since":
			return { [path]: { $gte: startOfDay(value) } };
		case "is_set":
			return { [path]: { $nin: [null, ""] } };
		case "not_set":
			return { [path]: { $in: [null, ""] } };
		default:
			throw new Error(`Unknown segment op ${op}`);
	}
}

const DESCRIPTIONS = {
	opened: {
		within: (value) => `Opened in the last ${plural(value, "day")}`,
		not_within: (value) => `Not opened in the last ${plural(value, "day")}`,
		never: () => "Never opened",
	},
	clicked: {
		within: (value) => `Clicked in the last ${plural(value, "day")}`,
		not_within: (value) => `Not clicked in the last ${plural(value, "day")}`,
		never: () => "Never clicked",
	},
	missed_issues: {
		at_least: (value) => `Missed at least ${plural(value, "issue")} in a row`,
		less_than: (value) => `Missed fewer than ${plural(value, "issue")} in a row`,
	},
	emails_opened: {
		at_least: (value) => `Opened at least ${plural(value, "email")}`,
		less_than: (value) => `Opened fewer than ${plural(value, "email")}`,
	},
	signed_up: {
		within: (value) => `Signed up in the last ${plural(value, "day")}`,
		not_within: (value) => `Signed up more than ${plural(value, "day")} ago`,
		before: (value) => `Signed up before ${formatDay(value)}`,
		since: (value) => `Signed up since ${formatDay(value)}`,
	},
	source: {
		is: (value) => `Came from ${describeSource(value)}`,
		is_not: (value) => `Didn't come from ${describeSource(value)}`,
	},
	email: {
		contains: (value) => `Email contains "${value}"`,
		ends_with: (value) => `Email ends with "${value}"`,
	},
	tag: {
		has: (value) => `Tagged "${value}"`,
		has_not: (value) => `Not tagged "${value}"`,
	},
	first_name: {
		is_set: () => "First name known",
		not_set: () => "First name unknown",
	},
	last_visit: {
		within: (value) => `Visited in the last ${plural(value, "day")}`,
		not_within: (value) => `No visit in the last ${plural(value, "day")}`,
		never: () => "Never visited",
	},
	visits: {
		at_least: (value) => `At least ${plural(value, "visit")}`,
		less_than: (value) => `Fewer than ${value} visits`,
	},
	booking_channel: {
		is: (value) => `Booked through ${value}`,
		contains: (value) => `Booked through a channel with "${value}"`,
		is_not: (value) => `Didn't book through ${value}`,
	},
	total_spent: {
		at_least: (value) => `Spent at least ${value.toLocaleString("en-US")} in total`,
		less_than: (value) => `Spent less than ${value.toLocaleString("en-US")} in total`,
	},
	room_type: {
		contains: (value) => `Stayed in a room with "${value}"`,
		is: (value) => `Stayed in ${value}`,
		is_not: (value) => `Never stayed in ${value}`,
	},
	party_size: {
		at_least: (value) => `Came with a party of at least ${value}`,
		is: (value) => `Came as a party of ${value}`,
		less_than: (value) => `Came with a party of fewer than ${value}`,
	},
	nights: {
		at_least: (value) => `Stayed at least ${plural(value, "night")} once`,
		less_than: (value) => `Stayed fewer than ${plural(value, "night")} once`,
	},
	lead_time: {
		at_least: (value) => `Booked at least ${plural(value, "day")} ahead`,
		less_than: (value) => `Booked less than ${plural(value, "day")} ahead`,
	},
	stay: {
		arriving_in: (value) => `Arrives in the next ${plural(value, "day")}`,
		staying_now: () => "Staying now",
		left_in: (value) => `Left in the last ${plural(value, "day")}`,
		none_upcoming: () => "Nothing booked",
	},
	country: {
		is: (value) => `From ${getCountryName(value) ?? value}`,
		is_not: (value) => `Not from ${getCountryName(value) ?? value}`,
	},
	language: {
		is: (value) => `Speaks ${getLanguageName(value)}`,
		is_not: (value) => `Doesn't speak ${getLanguageName(value)}`,
	},
	birthday: {
		in_next: (value) => `Birthday in the next ${plural(value, "day")}`,
		this_month: () => "Birthday this month",
	},
	vip: {
		yes: () => "VIP",
		no: () => "Not VIP",
	},
};

const CUSTOM_DESCRIPTIONS = {
	is: (label, value) => `${label} is "${value}"`,
	contains: (label, value) => `${label} contains "${value}"`,
	at_least: (label, value) => `${label} at least ${value.toLocaleString("en-US")}`,
	less_than: (label, value) => `${label} less than ${value.toLocaleString("en-US")}`,
	before: (label, value) => `${label} before ${formatDay(value)}`,
	since: (label, value) => `${label} since ${formatDay(value)}`,
	is_set: (label) => `${label} set`,
	not_set: (label) => `${label} not set`,
};

// For checked conditions: "Opened in the last 30 days". fields: the account's own, for their names.
export function describeCondition({ field, op, value }, fields = []) {
	if (isCustomField(field)) {
		const label = fields.find(({ key }) => `fields.${key}` === field)?.label ?? field.slice("fields.".length);
		return CUSTOM_DESCRIPTIONS[op]?.(label, value) ?? "";
	}
	return DESCRIPTIONS[field]?.[op]?.(value) ?? "";
}

// The rules in one sentence: "Opened in the last 30 days and signed up since Oct 1, 2026".
export function describeSegment({ match, conditions }, fields = []) {
	const parts = conditions.map((condition) => describeCondition(condition, fields));
	if (parts.length === 0) return "";
	const joined = parts.map((part, index) => (index === 0 ? part : part.charAt(0).toLowerCase() + part.slice(1)));
	if (joined.length === 1) return joined[0];
	return `${joined.slice(0, -1).join(", ")} ${match === "any" ? "or" : "and"} ${joined.at(-1)}`;
}

function plural(count, noun) {
	return `${count.toLocaleString("en-US")} ${count === 1 ? noun : `${noun}s`}`;
}

function describeSource(value) {
	return CONTACT_SOURCES[value]?.phrase ?? `"${value}"`;
}

function daysAfter(now, days) {
	return new Date(now.getTime() + days * DAY_MS);
}

function daysBefore(now, days) {
	return new Date(now.getTime() - days * DAY_MS);
}

function startOfDay(date) {
	return new Date(`${date}T00:00:00.000Z`);
}

function formatDay(date) {
	return DATE_FORMAT.format(startOfDay(date));
}

function escapeRegex(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

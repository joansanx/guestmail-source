import { Types } from "mongoose";
import { scoped } from "./account-scope.js";
import { compileSegment, describeSegment } from "./segments.js";
import { getCountryName } from "./countries.js";
import { getLanguageName } from "./guest-profile.js";
import Contact from "../models/Contact.js";
import Newsletter from "../models/Newsletter.js";

// guestmail: the segments a hotel CRM starts with, proposed with how many contacts each picks now, so the owner never
// faces an empty editor (Klaviyo makes five on connecting a PMS, Cloudbeds puts one under each campaign it recommends,
// Fideltour prepares and lets the owner decide: _research/segmentacion_hotelera_2026-11-22.md). Each one says what it
// is for. A suggestion that picks nobody, or that the newsletter already has, isn't shown.
const MIN_FOR_PERCENTILE = 5;
const MIN_FOR_MARKET = 3;
const MAX_MARKETS = 3;
const OTAS = ["booking", "expedia", "airbnb", "agoda", "hotels.com", "trip.com"];
const DIRECT = ["direct", "web", "phone", "telefono", "walk"];
const SUPERIOR_ROOMS = ["suite", "superior", "deluxe", "premium"];

const any = (conditions) => ({ match: "any", conditions });
const all = (...conditions) => ({ match: "all", conditions });
const visits = (op, value) => ({ field: "visits", op, value });
const containsEach = (field, words) => words.map((value) => ({ field, op: "contains", value }));

// The suggestions for a kind of business, as { id, name, why, rules }. premiumFrom: the total spent that puts a guest in
// the top fifth, when there's enough spending to tell (getPremiumThreshold).
export function getSuggestionCatalog(kind, { premiumFrom = null } = {}) {
	const spend = premiumFrom ? [{ field: "total_spent", op: "at_least", value: premiumFrom }] : [];
	const vip = { field: "vip", op: "yes" };
	if (kind === "restaurant") {
		return [
			{
				id: "premium",
				name: "Best customers",
				why: "Your top spenders and VIPs: thank them first.",
				rules: any([...spend, vip]),
			},
			{
				id: "booked_soon",
				name: "Booked for this week",
				why: "Remind them of the menu and suggest a wine or a dessert.",
				rules: all({ field: "stay", op: "arriving_in", value: 7 }),
			},
			{
				id: "regulars",
				name: "Regulars",
				why: "Three visits or more: a perk keeps them coming.",
				rules: all(visits("at_least", 3)),
			},
			{
				id: "first_time",
				name: "First visit",
				why: "Invite them back before they forget you.",
				rules: all(visits("at_least", 1), visits("less_than", 2)),
			},
			{
				id: "lapsed",
				name: "Haven't come back",
				why: "No visit in 90 days: a reason to return.",
				rules: all(visits("at_least", 1), {
					field: "last_visit",
					op: "not_within",
					value: 90,
				}),
			},
			{
				id: "groups",
				name: "Large groups",
				why: "Six or more at the table: offer private dining and set menus.",
				rules: all({ field: "party_size", op: "at_least", value: 6 }),
			},
			{
				id: "couples",
				name: "Couples",
				why: "Tables for two: special nights and tasting menus.",
				rules: all({ field: "party_size", op: "is", value: 2 }),
			},
			{
				id: "birthdays",
				name: "Birthdays in the next 30 days",
				why: "A birthday treat fills a table.",
				rules: all({ field: "birthday", op: "in_next", value: 30 }),
			},
			{
				id: "never_visited",
				name: "Subscribers who haven't booked",
				why: "They signed up: give them a reason for a first visit.",
				rules: all({ field: "last_visit", op: "never" }),
			},
		];
	}
	if (kind !== "hotel") {
		return [
			{
				id: "premium",
				name: "Best customers",
				why: "Your top spenders and VIPs: thank them first.",
				rules: any([...spend, vip]),
			},
			{
				id: "repeat",
				name: "Repeat customers",
				why: "They came back: reward them.",
				rules: all(visits("at_least", 2)),
			},
			{
				id: "lapsed",
				name: "Haven't come back",
				why: "Nothing in six months: a reason to return.",
				rules: all(visits("at_least", 1), {
					field: "last_visit",
					op: "not_within",
					value: 180,
				}),
			},
			{
				id: "birthdays",
				name: "Birthdays in the next 30 days",
				why: "A birthday gift brings them back.",
				rules: all({ field: "birthday", op: "in_next", value: 30 }),
			},
			{
				id: "never_visited",
				name: "Subscribers who haven't bought",
				why: "They signed up: give them a reason to start.",
				rules: all({ field: "last_visit", op: "never" }),
			},
		];
	}
	return [
		{
			id: "premium",
			name: "Premium guests",
			why: "Top spenders, superior rooms and VIPs: offer them the best first.",
			rules: any([...spend, ...containsEach("room_type", SUPERIOR_ROOMS), vip]),
		},
		{
			id: "arriving_soon",
			name: "Arriving in the next 14 days",
			why: "Offer an upgrade, breakfast or late checkout before they come.",
			rules: all({ field: "stay", op: "arriving_in", value: 14 }),
		},
		{
			id: "staying_now",
			name: "Staying now",
			why: "Tell them about the spa, the restaurant and what's on today.",
			rules: all({ field: "stay", op: "staying_now" }),
		},
		{
			id: "just_left",
			name: "Left in the last 7 days",
			why: "Thank them and ask for a review.",
			rules: all({ field: "stay", op: "left_in", value: 7 }),
		},
		{
			id: "second_stay",
			name: "Ready for a second stay",
			why: "Their first stay was this month and nothing is booked: invite them back direct.",
			rules: all(visits("at_least", 1), visits("less_than", 2), { field: "stay", op: "left_in", value: 28 }, { field: "stay", op: "none_upcoming" }),
		},
		{
			id: "repeat",
			name: "Repeat guests",
			why: "Two stays or more: reward their loyalty.",
			rules: all(visits("at_least", 2)),
		},
		{
			id: "loyal",
			name: "Loyal guests",
			why: "Five stays or more: your ambassadors.",
			rules: all(visits("at_least", 5)),
		},
		{
			id: "first_time",
			name: "First-time guests",
			why: "One stay so far: the second is the hardest.",
			rules: all(visits("at_least", 1), visits("less_than", 2)),
		},
		{
			id: "lapsed",
			name: "Lapsed guests",
			why: "No stay in a year and nothing booked: win them back.",
			rules: all(visits("at_least", 1), { field: "last_visit", op: "not_within", value: 365 }, { field: "stay", op: "none_upcoming" }),
		},
		{
			id: "ota",
			name: "Booked through an OTA",
			why: "Show them why booking direct pays next time.",
			rules: any(containsEach("booking_channel", OTAS)),
		},
		{
			id: "direct",
			name: "Booked direct",
			why: "They already trust you: keep them direct.",
			rules: any(containsEach("booking_channel", DIRECT)),
		},
		{
			id: "families",
			name: "Families",
			why: "Three or more in the room: family rooms and kids' activities.",
			rules: all({ field: "party_size", op: "at_least", value: 3 }),
		},
		{
			id: "couples",
			name: "Couples",
			why: "Two in the room: romantic breaks and dinner for two.",
			rules: all({ field: "party_size", op: "is", value: 2 }),
		},
		{
			id: "short_stays",
			name: "Short stays",
			why: "Two nights or fewer: offer the third night.",
			rules: all({ field: "nights", op: "less_than", value: 3 }),
		},
		{
			id: "long_stays",
			name: "Long stays",
			why: "A week or more: weekly rates and local plans.",
			rules: all({ field: "nights", op: "at_least", value: 7 }),
		},
		{
			id: "last_minute",
			name: "Last-minute bookers",
			why: "They book within a week: flash offers work.",
			rules: all({ field: "lead_time", op: "less_than", value: 8 }),
		},
		{
			id: "planners",
			name: "Early planners",
			why: "They book two months ahead: early-booking offers for next season.",
			rules: all({ field: "lead_time", op: "at_least", value: 60 }),
		},
		{
			id: "birthdays",
			name: "Birthdays in the next 30 days",
			why: "A birthday gift brings them back.",
			rules: all({ field: "birthday", op: "in_next", value: 30 }),
		},
		{
			id: "never_visited",
			name: "Subscribers who haven't stayed",
			why: "They signed up: give them a reason for a first stay.",
			rules: all({ field: "last_visit", op: "never" }),
		},
	];
}

// The total spent at the 80th percentile of the guests who spent anything, rounded down to a round number. Null with
// fewer than MIN_FOR_PERCENTILE of them: too few to call anyone premium.
export async function getPremiumThreshold(account, newsletterId) {
	const filter = scoped(account, {
		newsletterId,
		status: "active",
		"guest.totalSpent": { $gt: 0 },
	});
	const spenders = await Contact.countDocuments(filter);
	if (spenders < MIN_FOR_PERCENTILE) return null;
	const [row] = await Contact.find(filter)
		.sort({ "guest.totalSpent": 1 })
		.skip(Math.floor(spenders * 0.8))
		.limit(1)
		.select({ "guest.totalSpent": 1 })
		.lean();
	return roundDown(row?.guest?.totalSpent);
}

export function roundDown(value) {
	if (!(value > 0)) return null;
	if (value < 100) return Math.floor(value);
	const step = value < 1000 ? 50 : 100;
	return Math.floor(value / step) * step;
}

// A segment per market the list has enough of: its countries, and its languages other than the newsletter's own.
async function getMarketSuggestions(account, newsletterId, ownLanguage) {
	// An aggregation doesn't cast like a find: the ids go in as ObjectIds, whatever form they came in.
	const match = { accountId: new Types.ObjectId(String(account._id)), newsletterId: new Types.ObjectId(String(newsletterId)), status: "active" };
	const top = (path) =>
		Contact.aggregate([
			{ $match: { ...match, [path]: { $type: "string" } } },
			{ $group: { _id: `$${path}`, contacts: { $sum: 1 } } },
			{ $match: { contacts: { $gte: MIN_FOR_MARKET } } },
			{ $sort: { contacts: -1 } },
			{ $limit: MAX_MARKETS + 1 },
		]);
	const [countries, languages] = await Promise.all([top("country"), top("guest.language")]);
	return [
		...countries
			.filter(({ _id }) => getCountryName(_id))
			.slice(0, MAX_MARKETS)
			.map(({ _id }) => ({
				id: `country-${_id}`,
				name: `Guests from ${getCountryName(_id)}`,
				why: "Offers and events for their market, in their season.",
				rules: all({ field: "country", op: "is", value: _id }),
			})),
		...languages
			.filter(({ _id }) => _id !== ownLanguage)
			.slice(0, MAX_MARKETS)
			.map(({ _id }) => ({
				id: `language-${_id}`,
				name: `Speak ${getLanguageName(_id)}`,
				why: "Write to them in their language.",
				rules: all({ field: "language", op: "is", value: _id }),
			})),
	];
}

// The suggestions worth showing for a newsletter now: each with its description and its count of active contacts,
// biggest first after the catalog's order. existing: the newsletter's segments, matched by name or by the same rules.
export async function findSegmentSuggestions(account, newsletterId, existing = []) {
	const newsletter = await Newsletter.findOne(scoped(account, { _id: newsletterId }))
		.select({ "venue.kind": 1, "agent.language": 1 })
		.lean();
	if (!newsletter) return [];
	const [premiumFrom, markets] = await Promise.all([
		getPremiumThreshold(account, newsletterId),
		getMarketSuggestions(account, newsletterId, newsletter.agent?.language),
	]);
	const taken = new Set(existing.flatMap((segment) => [segment.name.trim().toLowerCase(), rulesKey(segment)]));
	const candidates = [...getSuggestionCatalog(newsletter.venue?.kind, { premiumFrom }), ...markets].filter(
		(suggestion) => !taken.has(suggestion.name.toLowerCase()) && !taken.has(rulesKey(suggestion.rules)),
	);
	const counts = await Promise.all(
		candidates.map((suggestion) =>
			Contact.countDocuments(
				scoped(account, {
					newsletterId,
					status: "active",
					$and: [compileSegment(suggestion.rules)],
				}),
			),
		),
	);
	return candidates
		.map((suggestion, index) => ({
			...suggestion,
			description: describeSegment(suggestion.rules),
			contacts: counts[index],
		}))
		.filter(({ contacts }) => contacts > 0);
}

function rulesKey({ match, conditions }) {
	return JSON.stringify([match, conditions.map(({ field, op, value }) => [field, op, value ?? null])]);
}

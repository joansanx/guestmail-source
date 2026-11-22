import "server-only";
import { scoped } from "@/lib/account-scope";
import { LIST_DAYS, MAX_LISTED_BOOKINGS, WINDOW_MS, creditBooking, startOfUtcDay, sumBookings } from "@/lib/booking-attribution-rules";
import { sendsEmail } from "@/lib/publish-to";
import { DEFAULT_TIME_ZONE, shiftDateKey, startOfDateKey } from "@/lib/time-zone";
import Contact from "@/models/Contact";
import Message from "@/models/Message";

// guestmail: the bookings attributed to a venue's campaigns (lib/booking-attribution-rules.js has the rule), worked out when
// asked, from the bookings made in a period: nothing is kept. Each query starts from the bookings with a date in the
// period, by their index (models/Contact.js), never from the whole list.
// ponytail: reading grows with the bookings made in the period, not with the list. Measured on 100,000 contacts with
// 100,000 bookings a year and a campaign 40,000 of them opened: a campaign's report 0.3 s, the campaigns list 0.4 s, the
// overview's 30 days 0.1 s and its 12 months 2 s. An automatic email's period runs from its first send to now, so it
// grows the same way. Past that, keep a tally per campaign and day, written as bookings and clicks come in, and read it.

const DAY_MS = 24 * 60 * 60 * 1000;

// Each booking made in [since, until) that counts, one row per booking: a cancelled one and a no-show don't. contact:
// more to ask of its contact.
function bookingStages({ accountId, newsletterId, since, until }, contact = {}) {
	const made = { $gte: since, $lt: until };
	return [
		{ $match: { accountId, newsletterId, "guest.visits": { $elemMatch: { bookedAt: made } }, ...contact } },
		{ $project: { email: 1, firstName: 1, lastOpenAt: 1, visit: "$guest.visits" } },
		{ $unwind: "$visit" },
		{ $match: { "visit.bookedAt": made, "visit.status": null } },
	];
}

// The period's bookings with the email each counts for. Contact.lastOpenAt follows every open and click of the contact's
// emails (lib/email-events.js), so a booking made more than the window after it has no email to count for, and its
// contact's emails aren't read.
async function findCreditedBookings(scope) {
	const rows = await Contact.aggregate([
		...bookingStages(scope, { lastOpenAt: { $gt: new Date(scope.since.getTime() - WINDOW_MS) } }),
		{ $match: { $expr: { $gt: ["$lastOpenAt", { $subtract: ["$visit.bookedAt", WINDOW_MS] }] } } },
		{
			$lookup: {
				from: Message.collection.collectionName,
				localField: "_id",
				foreignField: "contactId",
				let: { since: { $subtract: ["$visit.bookedAt", WINDOW_MS] }, until: { $add: ["$visit.bookedAt", DAY_MS] } },
				pipeline: [
					{
						$match: {
							accountId: scope.accountId,
							kind: "campaign",
							openedAt: { $ne: null },
							$expr: { $and: [{ $lt: ["$openedAt", "$$until"] }, { $gt: [{ $ifNull: ["$clickedAt", "$openedAt"] }, "$$since"] }] },
						},
					},
					{ $project: { _id: 0, campaignId: 1, openedAt: 1, clickedAt: 1 } },
				],
				as: "emails",
			},
		},
		{ $match: { emails: { $ne: [] } } },
	]);
	return rows
		.map(({ _id, email, firstName, visit, emails }) => {
			const credit = creditBooking(visit.bookedAt, emails);
			return (
				credit && {
					...credit,
					contactId: String(_id),
					email,
					firstName: firstName || null,
					bookedAt: visit.bookedAt,
					from: visit.from,
					to: visit.to ?? null,
					amount: typeof visit.amount === "number" ? visit.amount : null,
				}
			);
		})
		.filter(Boolean);
}

// How many bookings were made in the period, and with a campaign, how many by contacts it had gone to by then.
async function countBookings(scope, campaignId) {
	const [counts] = await Contact.aggregate([
		...bookingStages(scope),
		...(campaignId
			? [
					{
						$lookup: {
							from: Message.collection.collectionName,
							localField: "_id",
							foreignField: "contactId",
							let: { until: { $add: ["$visit.bookedAt", DAY_MS] } },
							pipeline: [
								{ $match: { accountId: scope.accountId, campaignId, kind: "campaign", sentAt: { $ne: null }, $expr: { $lt: ["$sentAt", "$$until"] } } },
								{ $limit: 1 },
								{ $project: { _id: 1 } },
							],
							as: "got",
						},
					},
				]
			: []),
		{ $group: { _id: null, made: { $sum: 1 }, fromRecipients: { $sum: { $size: { $ifNull: ["$got", []] } } } } },
	]);
	return { made: counts?.made ?? 0, fromRecipients: counts?.fromRecipients ?? 0 };
}

// The newsletter's latest booking date, or null when none of its bookings has one: then there's nothing to measure
// with, which isn't the same as no booking attributed. The index gives it in one read.
async function findLatestBookingDate({ accountId, newsletterId }) {
	const [contact] = await Contact.find({ accountId, newsletterId }).sort({ "guest.visits.bookedAt": -1 }).limit(1).select({ "guest.visits.bookedAt": 1 }).lean();
	const times = (contact?.guest?.visits ?? []).map(({ bookedAt }) => bookedAt?.getTime()).filter(Number.isFinite);
	return times.length > 0 ? new Date(Math.max(...times)) : null;
}

// Stays of the campaign's clickers that start after their click and have no booking date: bookings it may have brought
// and nobody can tell. A day of slack, for arrival dates without a time.
async function countUndatedStays({ accountId, campaignId }) {
	const [counts] = await Message.aggregate([
		{ $match: { accountId, campaignId, kind: "campaign", clickedAt: { $ne: null } } },
		{
			$lookup: {
				from: Contact.collection.collectionName,
				localField: "contactId",
				foreignField: "_id",
				pipeline: [{ $project: { _id: 0, visits: "$guest.visits" } }],
				as: "contact",
			},
		},
		{ $unwind: "$contact" },
		{ $unwind: "$contact.visits" },
		{
			$match: {
				"contact.visits.bookedAt": null,
				"contact.visits.status": null,
				$expr: { $gte: ["$contact.visits.from", { $subtract: ["$clickedAt", DAY_MS] }] },
			},
		},
		{ $count: "stays" },
	]);
	return counts?.stays ?? 0;
}

async function findLastEngagement({ accountId, campaignId }) {
	const [last] = await Message.aggregate([
		{ $match: { accountId, campaignId, kind: "campaign", openedAt: { $ne: null } } },
		{ $group: { _id: null, openedAt: { $max: "$openedAt" }, clickedAt: { $max: "$clickedAt" } } },
	]);
	return last ? new Date(Math.max(last.openedAt, last.clickedAt ?? 0)) : null;
}

const byLatest = (a, b) => b.bookedAt - a.bookedAt;
const viaClick = ({ via }) => via === "click";

// A sent campaign's attributed bookings, or null for one that sent no email. status "no_booking_data": none of the
// newsletter's bookings has a booking date, so nothing can be attributed and no figure is given. "measured": the bookings
// made in its period, from the day its send started to the window after its last open or click, which is every booking
// that could count for it. period is null while nobody has opened it. attributed: after a click. influenced: after an
// open without a click, apart. made and fromRecipients: the period's bookings, and those of contacts it had gone to.
// undatedStays: see countUndatedStays. bookingsUntil: the newsletter's latest booking date, to tell data that stopped
// coming from a campaign that brought nothing.
export async function getCampaignAttribution(campaign, { now = new Date() } = {}) {
	const startedAt = campaign.startedAt ?? campaign.sentAt;
	if (!startedAt || !sendsEmail(campaign)) return null;
	const { accountId, newsletterId, _id: campaignId } = campaign;
	const [bookingsUntil, lastEngagedAt] = await Promise.all([
		findLatestBookingDate({ accountId, newsletterId }),
		findLastEngagement({ accountId, campaignId }),
	]);
	if (!bookingsUntil) return { status: "no_booking_data" };

	const period = lastEngagedAt && {
		since: startOfUtcDay(startedAt),
		until: new Date(Math.min(now.getTime(), lastEngagedAt.getTime() + WINDOW_MS)),
	};
	const scope = period && { accountId, newsletterId, ...period };
	const [credited, counts, undatedStays] = await Promise.all([
		scope ? findCreditedBookings(scope) : [],
		scope ? countBookings(scope, campaignId) : { made: 0, fromRecipients: 0 },
		countUndatedStays({ accountId, campaignId }),
	]);
	const own = credited.filter((booking) => booking.campaignId === String(campaignId));
	const clicked = own.filter(viaClick).sort(byLatest);
	return {
		status: "measured",
		period: period && { from: period.since, to: period.until },
		bookingsUntil,
		attributed: sumBookings(clicked),
		influenced: sumBookings(own.filter(({ via }) => via === "open")),
		made: counts.made,
		fromRecipients: counts.fromRecipients,
		undatedStays,
		bookings: clicked.slice(0, MAX_LISTED_BOOKINGS).map(({ contactId, email, firstName, at, bookedAt, from, to, amount, isSameDay }) => ({
			contactId,
			email,
			firstName,
			clickedAt: at,
			bookedAt,
			from,
			to,
			amount,
			isSameDay,
		})),
	};
}

// The bookings made in [since, until) attributed to any of a newsletter's campaigns. status as in getCampaignAttribution.
export async function getAttribution({ accountId, newsletterId, since, until }) {
	const scope = { accountId, newsletterId, since, until };
	const [bookingsUntil, credited, counts] = await Promise.all([findLatestBookingDate(scope), findCreditedBookings(scope), countBookings(scope)]);
	if (!bookingsUntil) return { status: "no_booking_data" };
	return {
		status: "measured",
		bookingsUntil,
		attributed: sumBookings(credited.filter(viaClick)),
		influenced: sumBookings(credited.filter(({ via }) => via === "open")),
		made: counts.made,
	};
}

// The same over the overview's period, read as its email stats read it (lib/overview-data.js getEmailStats): the last
// `days` up to now, or the whole days from and to, both included, in timeZone.
export function getPeriodAttribution({ accountId, newsletterId, days, from, to, timeZone = DEFAULT_TIME_ZONE, now = new Date() }) {
	const since = from ? startOfDateKey(from, timeZone) : new Date(now.getTime() - days * DAY_MS);
	const until = to ? startOfDateKey(shiftDateKey(to, 1), timeZone) : now;
	return getAttribution({ accountId, newsletterId, since, until });
}

// What the campaigns list shows by a campaign: the bookings attributed to each of those that started in the last
// LIST_DAYS, whose every booking is in what's read, as { bookings, amount, withoutAmount, sameDay } by campaign id. A
// campaign without any isn't there, and neither is any of a newsletter that isn't a venue's.
export async function getListAttribution(account, newsletter, campaigns, { now = new Date() } = {}) {
	if (!newsletter?.venue?.kind) return {};
	const since = startOfUtcDay(new Date(now.getTime() - LIST_DAYS * DAY_MS));
	const recent = new Set(campaigns.filter(({ startedAt }) => startedAt >= since).map(({ _id }) => String(_id)));
	if (recent.size === 0) return {};
	const credited = await findCreditedBookings({ ...scoped(account), newsletterId: newsletter._id, since, until: now });
	const byCampaign = Object.groupBy(credited.filter((booking) => viaClick(booking) && recent.has(booking.campaignId)), ({ campaignId }) => campaignId);
	return Object.fromEntries(Object.entries(byCampaign).map(([id, bookings]) => [id, sumBookings(bookings)]));
}

// guestmail: which campaign a booking is attributed to (lib/booking-attribution.js reads the bookings and the emails, this file
// decides). A booking is a stay or a reservation on a contact (guest.visits), and what places it in time is when it was
// made, its bookedAt: one without it can't be attributed, and a cancelled one or a no-show never counts.

const DAY_MS = 24 * 60 * 60 * 1000;

// A booking made up to this many days after its contact clicked a campaign is attributed to it. 7: someone who clicks
// books within the week or not because of the email, and every day more adds bookings the email had less to do with.
export const CLICK_WINDOW_DAYS = 7;
// The same span after an open without a click, for the softer figure, never added to the attributed one: Apple Mail's
// privacy protection and Gmail's image proxy open emails nobody read (lib/tracking.js only filters clicks).
export const OPEN_WINDOW_DAYS = 7;
// The longest of the two, for the queries that look for an email before a booking.
export const WINDOW_MS = Math.max(CLICK_WINDOW_DAYS, OPEN_WINDOW_DAYS) * DAY_MS;
// The attributed bookings a report lists, latest first.
export const MAX_LISTED_BOOKINGS = 100;
// How far back the campaigns list reads bookings: a campaign that started before then shows no figure there, and its
// report still does. 90: at 100,000 bookings a year, a year of them takes a second to read on every visit to the list.
export const LIST_DAYS = 90;

// A booking date without a time is midnight UTC (lib/csv-import.js normalizeDate): the booking was made at some point
// of that day, so an email clicked the same day counts, before or after. isDayOnly says which bookings those are.
export function isDayOnly(bookedAt) {
	return new Date(bookedAt).getTime() % DAY_MS === 0;
}

export function startOfUtcDay(date) {
	const time = new Date(date).getTime();
	return new Date(time - (time % DAY_MS));
}

function isWithin(at, booked, latest, days) {
	if (!at) return false;
	const time = new Date(at).getTime();
	return time <= latest && booked - time < days * DAY_MS;
}

// The one email a booking counts for, or null: { campaignId, via, at, isSameDay }. via "click": the last click before
// the booking, within CLICK_WINDOW_DAYS, on any of the contact's campaigns: a booking is never shared between two.
// via "open": no such click, and the last email opened within OPEN_WINDOW_DAYS that wasn't clicked before the booking.
// emails: the contact's campaign emails, { campaignId, openedAt, clickedAt }, their first open and first click.
// isSameDay: the booking date has no time and the click or open came that day, so which came first isn't known.
export function creditBooking(bookedAt, emails) {
	const booked = new Date(bookedAt).getTime();
	const latest = isDayOnly(bookedAt) ? booked + DAY_MS - 1 : booked;
	let credit = null;
	for (const email of emails) {
		const isClick = isWithin(email.clickedAt, booked, latest, CLICK_WINDOW_DAYS);
		const wasClicked = Boolean(email.clickedAt) && new Date(email.clickedAt).getTime() <= latest;
		if (!isClick && (wasClicked || !isWithin(email.openedAt, booked, latest, OPEN_WINDOW_DAYS))) continue;
		const candidate = {
			campaignId: String(email.campaignId),
			via: isClick ? "click" : "open",
			at: new Date(isClick ? email.clickedAt : email.openedAt),
		};
		if (!credit || isBetter(candidate, credit)) credit = candidate;
	}
	return credit && { ...credit, isSameDay: credit.at.getTime() > booked };
}

// A click beats an open, then the latest wins. Two at the same instant: the campaign with the higher id, so the same
// booking always goes to the same one.
function isBetter(candidate, credit) {
	if (candidate.via !== credit.via) return candidate.via === "click";
	if (candidate.at.getTime() !== credit.at.getTime()) return candidate.at > credit.at;
	return candidate.campaignId > credit.campaignId;
}

// Bookings and their amounts added up as they are: the data has no currency. withoutAmount: bookings that carry none, so
// the sum is short of them. sameDay: see creditBooking.
export function sumBookings(bookings) {
	const sum = { bookings: 0, amount: 0, withoutAmount: 0, sameDay: 0 };
	for (const { amount, isSameDay } of bookings) {
		sum.bookings += 1;
		if (typeof amount === "number") sum.amount += amount;
		else sum.withoutAmount += 1;
		if (isSameDay) sum.sameDay += 1;
	}
	return sum;
}

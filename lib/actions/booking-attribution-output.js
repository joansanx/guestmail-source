import "server-only";
import * as z from "zod";
import { dateOutput, toIso } from "@/lib/actions/shared";
import { CLICK_WINDOW_DAYS, MAX_LISTED_BOOKINGS, OPEN_WINDOW_DAYS } from "@/lib/booking-attribution-rules";

// guestmail: how the bookings attributed to campaigns (lib/booking-attribution.js) read in get_campaign_report and
// get_overview. Without booking dates every figure is null, never zero.
const RULE = `A booking counts when its contact clicked a campaign and booked (bookedAt) within ${CLICK_WINDOW_DAYS} days of that click, for one campaign only: the last one clicked before the booking. Cancelled bookings, no-shows and bookings without a booking date never count.`;
const StatusSchema = z
	.enum(["measured", "no_booking_data"])
	.describe(
		"no_booking_data: none of the newsletter's stays or reservations has a booking date, so nothing can be attributed and every figure is null, which isn't zero. They come in with import_contacts (bookedAt) or the connector (get_connector)."
	);
const SumSchema = z.object({
	bookings: z.number().int(),
	amount: z.number().describe("Their amounts added up as the bookings carry them: the data has no currency"),
	withoutAmount: z.number().int().describe("Bookings that carry no amount, which the sum is short of"),
	sameDay: z.number().int().describe("Bookings whose date has no time, made the day of the click or open: which came first isn't known"),
});
const InfluencedSchema = SumSchema.nullable().describe(
	`Softer, and never added to attributed: bookings made within ${OPEN_WINDOW_DAYS} days of opening a campaign that wasn't clicked before them. Opens are inflated by Apple Mail's privacy protection and Gmail's image proxy.`
);
const UntilSchema = dateOutput.describe("The newsletter's latest booking date: bookings made after it aren't on record yet");

export const CampaignAttributionSchema = z
	.object({
		status: StatusSchema,
		clickWindowDays: z.number().int(),
		openWindowDays: z.number().int(),
		period: z
			.object({ from: z.string(), to: z.string() })
			.nullable()
			.describe("The bookings read: those made from the day the send started to the window after its last open or click. Null while nobody has opened it"),
		bookingsUntil: UntilSchema,
		attributed: SumSchema.nullable().describe(RULE),
		influenced: InfluencedSchema,
		made: z.number().int().nullable().describe("Every booking made in the period by the newsletter's contacts, attributed or not"),
		fromRecipients: z.number().int().nullable().describe("Those of them made by contacts the campaign had gone to: the rest couldn't be attributed to it"),
		undatedStays: z
			.number()
			.int()
			.nullable()
			.describe("Stays of contacts who clicked it that start after their click and have no booking date: they couldn't be attributed either way"),
		bookings: z
			.array(
				z.object({
					contactId: z.string(),
					email: z.string(),
					firstName: z.string().nullable(),
					clickedAt: z.string().describe("Their first click on the campaign"),
					bookedAt: z.string(),
					from: z.string().describe("The stay's check-in or the reservation's date"),
					to: dateOutput.describe("The stay's check-out"),
					amount: z.number().nullable(),
					isSameDay: z.boolean().describe("See sameDay"),
				})
			)
			.describe(`The attributed bookings, latest first, ${MAX_LISTED_BOOKINGS} at most`),
	})
	.nullable()
	.describe("Bookings attributed to the campaign, for a hotel's or a restaurant's newsletter. Null for any other newsletter and for a campaign that sent no email");

export const OverviewAttributionSchema = z
	.object({
		status: StatusSchema,
		clickWindowDays: z.number().int(),
		openWindowDays: z.number().int(),
		bookingsUntil: UntilSchema,
		attributed: SumSchema.nullable().describe(`Bookings made in the period and attributed to any campaign. ${RULE}`),
		influenced: InfluencedSchema,
		made: z.number().int().nullable().describe("Every booking made in the period by the newsletter's contacts, attributed or not"),
	})
	.nullable()
	.describe("Bookings attributed to the newsletter's campaigns over the period, for a hotel's or a restaurant's newsletter. Null for any other");

const WINDOWS = { clickWindowDays: CLICK_WINDOW_DAYS, openWindowDays: OPEN_WINDOW_DAYS };
const UNMEASURED = { status: "no_booking_data", ...WINDOWS, bookingsUntil: null, attributed: null, influenced: null, made: null };

export function toCampaignAttribution(attribution) {
	if (!attribution) return null;
	if (attribution.status !== "measured") return { ...UNMEASURED, period: null, fromRecipients: null, undatedStays: null, bookings: [] };
	const { period, bookingsUntil, bookings, ...figures } = attribution;
	return {
		...figures,
		...WINDOWS,
		period: period && { from: toIso(period.from), to: toIso(period.to) },
		bookingsUntil: toIso(bookingsUntil),
		bookings: bookings.map((booking) => ({
			...booking,
			clickedAt: toIso(booking.clickedAt),
			bookedAt: toIso(booking.bookedAt),
			from: toIso(booking.from),
			to: toIso(booking.to),
		})),
	};
}

export function toOverviewAttribution(attribution) {
	if (!attribution) return null;
	if (attribution.status !== "measured") return UNMEASURED;
	const { status, bookingsUntil, attributed, influenced, made } = attribution;
	return { status, ...WINDOWS, bookingsUntil: toIso(bookingsUntil), attributed, influenced, made };
}

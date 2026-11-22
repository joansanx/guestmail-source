import "server-only";
import * as z from "zod";
import { scoped } from "@/lib/account-scope";
import { campaignActions } from "@/lib/actions/campaigns";
import { defineAction } from "@/lib/actions/define-action";
import { actionError } from "@/lib/actions/errors";
import { dateOutput, findNewsletter, newsletterInput, toIso } from "@/lib/actions/shared";
import { checkPlace, isPlaceId, readPlace, searchPlaces } from "@/lib/google-places";
import { MAX_REVIEW_PICKS, REPUTATION_LANGUAGES, VENUE_KINDS, buildReviewCampaign, pickReviews } from "@/lib/reputation-rules";
import Newsletter from "@/models/Newsletter";

// guestmail: a hotel's or restaurant's reputation on Google Maps, and the campaign that quotes its best reviews. Google
// lets a server keep a place's ID and nothing else, so every action reads the place live and saves no rating or review:
// the draft create_review_campaign writes is the owner's own email, which they read before it goes anywhere.
const GROUP = "Reputation";
const NO_PLACE = "This newsletter has no Google Maps place yet: find it with find_place and save it with set_venue";
const createCampaign = campaignActions.find(({ name }) => name === "create_campaign");

const languageInput = z
	.enum(REPUTATION_LANGUAGES)
	.optional()
	.describe("The language Google Maps answers in and the campaign is written in: en (the default) or es");

const VenueSchema = z.object({
	kind: z.enum(VENUE_KINDS).nullable().describe("hotel, restaurant or other (any other business): which words its campaigns use"),
	placeId: z.string().nullable().describe("Its place on Google Maps"),
	bookingUrl: z.string().nullable().describe("Where its review campaigns send guests to book"),
});

const ReviewSchema = z.object({
	id: z.string(),
	rating: z.number(),
	text: z.string(),
	author: z.string().describe("The name to show next to the review, with authorUrl: Google asks for both"),
	authorUrl: z.string().nullable(),
	publishedAt: dateOutput,
	relativeTime: z.string().nullable().describe("When, in Google's words: 3 months ago"),
	url: z.string().nullable().describe("The review on Google Maps"),
	recommended: z.boolean().describe(`One of the ${MAX_REVIEW_PICKS} reviews create_review_campaign quotes by default`),
	reason: z.string().nullable().describe("Why it's recommended"),
});

function toVenue(newsletter) {
	return { kind: newsletter.venue?.kind ?? null, placeId: newsletter.venue?.placeId ?? null, bookingUrl: newsletter.venue?.bookingUrl ?? null };
}

async function findVenuePlace(account, reference, language) {
	const newsletter = await findNewsletter(account, reference, { _id: 1, venue: 1 });
	if (!newsletter.venue?.placeId) throw actionError("conflict", NO_PLACE);
	const place = await readPlace(newsletter.venue.placeId, { language });
	return { newsletter, place, picks: pickReviews(place.reviews, { kind: newsletter.venue.kind }) };
}

const findPlace = defineAction({
	name: "find_place",
	role: "admin",
	tryWithoutPlan: true,
	title: "Find a place on Google Maps",
	group: GROUP,
	description: "Searches Google Maps for a hotel or a restaurant by name and city, and answers up to 5 places with the placeId set_venue takes.",
	http: { method: "GET", path: "/reputation/places" },
	readOnly: true,
	openWorld: true,
	rateLimit: { limit: 60, window: "1 h" },
	example: { query: "Hotel Casa Fuster, Barcelona" },
	input: z.object({
		query: z.string().trim().min(3).max(200).describe("The venue's name and its city"),
		language: languageInput,
	}),
	output: z.object({ places: z.array(z.object({ placeId: z.string(), name: z.string(), address: z.string() })) }),
	handler: async ({ input }) => ({ places: await searchPlaces(input.query, { language: input.language }) }),
});

const setVenue = defineAction({
	name: "set_venue",
	role: "admin",
	tryWithoutPlan: true,
	title: "Set a newsletter's venue",
	group: GROUP,
	description:
		"Says which hotel or restaurant a newsletter belongs to: its kind, its place on Google Maps (from find_place) and where guests book. Send only the fields to change; null takes one off.",
	http: { method: "PATCH", path: "/reputation/venue" },
	idempotent: true,
	openWorld: true,
	example: { kind: "hotel", placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4", bookingUrl: "https://example.com/book" },
	input: z.object({
		newsletter: newsletterInput,
		kind: z.enum(VENUE_KINDS).nullable().optional().describe("hotel, restaurant or other"),
		placeId: z.string().trim().max(300).nullable().optional().describe("The placeId find_place answered"),
		bookingUrl: z.string().trim().url().max(500).startsWith("https://", "Use an https:// link").nullable().optional().describe("An https:// link to book"),
	}),
	output: VenueSchema,
	handler: async ({ account, input: { newsletter: reference, ...changes } }) => {
		const newsletter = await findNewsletter(account, reference, { _id: 1, venue: 1 });
		if (changes.placeId) {
			if (!isPlaceId(changes.placeId)) throw actionError("validation_failed", "placeId isn't a Google Maps place ID: find_place answers them");
			await checkPlace(changes.placeId);
		}
		const entries = Object.entries(changes).filter(([, value]) => value !== undefined);
		const set = Object.fromEntries(entries.filter(([, value]) => value !== null).map(([key, value]) => [`venue.${key}`, value]));
		const unset = Object.fromEntries(entries.filter(([, value]) => value === null).map(([key]) => [`venue.${key}`, 1]));
		const saved = await Newsletter.findOneAndUpdate(
			scoped(account, { _id: newsletter._id }),
			{ ...(Object.keys(set).length > 0 && { $set: set }), ...(Object.keys(unset).length > 0 && { $unset: unset }) },
			{ returnDocument: "after" }
		)
			.select({ venue: 1 })
			.lean();
		return toVenue(saved);
	},
});

const getReputation = defineAction({
	name: "get_reputation",
	role: "member",
	tryWithoutPlan: true,
	title: "Get the venue's reputation",
	group: GROUP,
	description: `Reads the venue's rating, its number of reviews and the 5 reviews Google Maps finds most relevant, live, and marks the ${MAX_REVIEW_PICKS} worth quoting in a campaign with why. Show a review with its author, authorUrl and url, as Google Maps asks.`,
	http: { method: "GET", path: "/reputation" },
	readOnly: true,
	openWorld: true,
	rateLimit: { limit: 60, window: "1 h" },
	input: z.object({ newsletter: newsletterInput, language: languageInput }),
	output: z.object({
		venue: VenueSchema,
		source: z.string().describe("Where the rating and the reviews come from, to say next to them"),
		name: z.string(),
		address: z.string(),
		rating: z.number().nullable(),
		reviewCount: z.number().int(),
		mapsUrl: z.string().nullable(),
		reviews: z.array(ReviewSchema).describe("Sorted by relevance, as Google Maps answers them"),
	}),
	handler: async ({ account, input }) => {
		const { newsletter, place, picks } = await findVenuePlace(account, input.newsletter, input.language);
		const reasons = new Map(picks.map(({ id, reason }) => [id, reason]));
		return {
			venue: toVenue(newsletter),
			source: "Google Maps",
			name: place.name,
			address: place.address,
			rating: place.rating,
			reviewCount: place.reviewCount,
			mapsUrl: place.mapsUrl,
			reviews: place.reviews.map((review) => ({
				...review,
				publishedAt: toIso(review.publishedAt),
				recommended: reasons.has(review.id),
				reason: reasons.get(review.id) ?? null,
			})),
		};
	},
});

const createReviewCampaign = defineAction({
	name: "create_review_campaign",
	role: "member",
	tryWithoutPlan: true,
	title: "Draft a campaign from reviews",
	group: GROUP,
	description: `Creates a draft campaign that quotes the venue's reviews: its rating, each review with its author and a link to it on Google Maps, and a button to book when the venue has a bookingUrl. Without reviews it quotes the ${MAX_REVIEW_PICKS} get_reputation recommends. Nothing is sent: read the draft, edit it, then send it like any campaign.`,
	http: { method: "POST", path: "/reputation/campaigns", status: 201 },
	openWorld: true,
	rateLimit: { limit: 30, window: "1 h" },
	example: { language: "en" },
	input: z.object({
		newsletter: newsletterInput,
		reviews: z.array(z.string().max(500)).min(1).max(5).optional().describe("The ids of the reviews to quote, from get_reputation, in the order to quote them"),
		language: languageInput,
	}),
	output: createCampaign.output,
	handler: async ({ account, input, ...context }) => {
		const { newsletter, place, picks } = await findVenuePlace(account, input.newsletter, input.language);
		const ids = input.reviews ?? picks.map(({ id }) => id);
		const reviews = ids.map((id) => place.reviews.find((review) => review.id === id && review.text));
		if (reviews.some((review) => !review)) throw actionError("validation_failed", "One of these reviews isn't among the venue's reviews on Google Maps now: get_reputation lists them");
		if (reviews.length === 0 || place.rating === null) throw actionError("conflict", "Google Maps has no review with text for this place yet");
		const draft = buildReviewCampaign({ place, reviews, kind: newsletter.venue.kind, bookingUrl: newsletter.venue.bookingUrl, language: input.language });
		return createCampaign.handler({
			...context,
			account,
			input: { newsletter: String(newsletter._id), subject: draft.subject, previewText: draft.previewText, format: "markdown", content: draft.markdown },
		});
	},
});

export const reputationActions = [findPlace, setVenue, getReputation, createReviewCampaign];

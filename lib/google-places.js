import "server-only";
import { actionError } from "@/lib/actions/errors";

// guestmail: the hotel's or restaurant's listing on Google Maps, through Places API (New). Google lets a place ID be
// kept and nothing else of a place (developers.google.com/maps/documentation/places/web-service/policies), so every
// read is live and nothing here is saved. Its reviews are the 5 Google finds most relevant, with their authors and links.
const API_URL = "https://places.googleapis.com/v1";
const PLACE_ID_PATTERN = /^[A-Za-z0-9_-]{10,300}$/;
const FIELDS = {
	search: "places.id,places.displayName,places.formattedAddress",
	// IDs only: Google doesn't bill it.
	id: "id",
	place: "id,displayName,formattedAddress,rating,userRatingCount,googleMapsUri,reviews,primaryTypeDisplayName,websiteUri",
};

export function isPlacesConfigured() {
	return Boolean(process.env.GOOGLE_PLACES_API_KEY);
}

export function isPlaceId(value) {
	return PLACE_ID_PATTERN.test(String(value ?? ""));
}

async function call(path, { fields, body, language } = {}) {
	if (!isPlacesConfigured()) throw actionError("unavailable", "Reputation isn't set up on this server: it needs GOOGLE_PLACES_API_KEY");
	let response;
	try {
		response = await fetch(`${API_URL}${path}${!body && language ? `?languageCode=${encodeURIComponent(language)}` : ""}`, {
			method: body ? "POST" : "GET",
			headers: {
				"X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
				"X-Goog-FieldMask": fields,
				...(body && { "content-type": "application/json" }),
			},
			...(body && { body: JSON.stringify({ ...body, ...(language && { languageCode: language }) }) }),
			signal: AbortSignal.timeout(15_000),
		});
	} catch (error) {
		throw actionError("unavailable", `Google Maps didn't answer: ${error.message}`);
	}
	if (response.status === 404 || (response.status === 400 && !body)) throw actionError("not_found", "Google Maps doesn't have this place");
	if (!response.ok) throw actionError("unavailable", `Google Maps refused the request (${response.status})`);
	return response.json();
}

export async function searchPlaces(query, { language } = {}) {
	const { places = [] } = await call("/places:searchText", { fields: FIELDS.search, body: { textQuery: query, pageSize: 5 }, language });
	return places.map((place) => ({ placeId: place.id, name: place.displayName?.text ?? "", address: place.formattedAddress ?? "" }));
}

// Throws not_found for an ID Google Maps doesn't have.
export async function checkPlace(placeId) {
	await call(`/places/${encodeURIComponent(placeId)}`, { fields: FIELDS.id });
}

export async function readPlace(placeId, { language } = {}) {
	const place = await call(`/places/${encodeURIComponent(placeId)}`, { fields: FIELDS.place, language });
	return {
		placeId: place.id,
		name: place.displayName?.text ?? "",
		address: place.formattedAddress ?? "",
		rating: place.rating ?? null,
		reviewCount: place.userRatingCount ?? 0,
		category: place.primaryTypeDisplayName?.text ?? null,
		website: place.websiteUri ?? null,
		mapsUrl: place.googleMapsUri ?? null,
		reviews: (place.reviews ?? []).map((review) => ({
			id: review.name,
			rating: review.rating ?? 0,
			text: review.text?.text ?? review.originalText?.text ?? "",
			author: review.authorAttribution?.displayName ?? "",
			authorUrl: review.authorAttribution?.uri ?? null,
			publishedAt: review.publishTime ?? null,
			relativeTime: review.relativePublishTimeDescription ?? null,
			url: review.googleMapsUri ?? place.googleMapsUri ?? null,
		})),
	};
}

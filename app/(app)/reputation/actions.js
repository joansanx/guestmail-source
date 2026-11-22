"use server";

import { revalidatePath } from "next/cache";
import { runDashboardAction, toFormError } from "@/lib/actions/dashboard";

// guestmail: the Reputation page's server actions, each the same action the API and MCP run (lib/actions/reputation.js).
export async function findPlaces(query) {
	const { output, failure } = await runDashboardAction("find_place", { query: String(query ?? "") });
	return failure ? toFormError(failure) : output;
}

export async function saveVenue(newsletterId, changes) {
	const { output, failure } = await runDashboardAction("set_venue", { newsletter: String(newsletterId ?? ""), ...changes });
	if (failure) return toFormError(failure);
	revalidatePath("/reputation");
	return output;
}

export async function draftReviewCampaign(newsletterId, reviews) {
	const { output, failure } = await runDashboardAction("create_review_campaign", {
		newsletter: String(newsletterId ?? ""),
		...(Array.isArray(reviews) && reviews.length > 0 && { reviews }),
	});
	return failure ? toFormError(failure) : { id: output.id };
}

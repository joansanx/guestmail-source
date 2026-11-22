"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { scoped } from "@/lib/account-scope";
import { isAgentConfigured, runFirstRound } from "@/lib/content-agent";
import { isPlaceId } from "@/lib/google-places";
import { VENUE_KINDS } from "@/lib/reputation-rules";
import { runAccountAction, toFormError } from "@/lib/actions/dashboard";
import { requireAccount } from "@/lib/auth";
import { LIST_SIZES, LIST_SOURCES, OTHER_LIST_SOURCE, findFreeSlug, needsOnboarding } from "@/lib/onboarding";
import { OWN_DOMAIN_STEPS } from "@/lib/sender-rules";
import { saveSelectedNewsletter } from "@/lib/selected-newsletter";
import { siteExtensions } from "@/lib/site-extensions";
import { isObjectIdString } from "@/lib/validation";
import Account from "@/models/Account";
import Newsletter from "@/models/Newsletter";

function readText(formData, key) {
	return String(formData.get(key) ?? "").trim();
}

function readChoice(formData, key, choices) {
	const value = readText(formData, key);
	return choices.includes(value) ? value : null;
}

// Creates the account's newsletter, keeps what it said about its list, then opens the dashboard. Sent twice,
// the second time only finishes: the newsletter is there.
export async function completeOnboarding(_state, formData) {
	const { account } = await requireAccount();
	const name = readText(formData, "name");
	if (!name) return { error: "Name your newsletter" };
	if (await needsOnboarding(account)) {
		const { failure } = await runAccountAction("create_newsletter", {
			name,
			slug: await findFreeSlug(name),
			description: readText(formData, "description"),
			fromName: readText(formData, "fromName"),
		});
		if (failure) return toFormError(failure);
		await siteExtensions.sendGoalOnNextPage("onboarding_completed");
	}

	const listSize = readChoice(formData, "listSize", LIST_SIZES.map(({ id }) => id));
	const listSource = listSize && listSize !== "none" ? readChoice(formData, "listSource", [...LIST_SOURCES, OTHER_LIST_SOURCE]) : null;
	await Account.updateOne(
		{ _id: account._id },
		{
			$set: {
				"onboarding.completedAt": new Date(),
				...(listSize && { "onboarding.listSize": listSize }),
				...(listSource && { "onboarding.listSource": listSource }),
			},
		}
	);
	redirect("/");
}

// guestmail: the venue-first sign-up (components/FormOnboardingVenue.jsx). find_place for the search box.
export async function searchVenue(query) {
	await requireAccount();
	const { output, failure } = await runAccountAction("find_place", { query: String(query ?? "") });
	return failure ? toFormError(failure) : output;
}

const TERMS_VERSION = "2026-11-21";

// What the venue steps (components/FormOnboardingVenue.jsx) sent, checked, or the problem to show.
function readVenueForm(formData, { needsTerms }) {
	const venue = {
		kind: readChoice(formData, "kind", VENUE_KINDS),
		placeId: readText(formData, "placeId"),
		name: readText(formData, "name"),
		postalAddress: readText(formData, "postalAddress"),
		language: readChoice(formData, "language", ["en", "es"]) ?? "en",
		topics: formData
			.getAll("topics")
			.map((topic) => String(topic).trim())
			.filter((topic) => topic.length >= 2 && topic.length <= 80)
			.slice(0, 12),
		website: readText(formData, "website"),
		offerText: readText(formData, "offerText").slice(0, 120),
		offerCode: readText(formData, "offerCode").toUpperCase(),
	};
	if (!venue.kind) return { error: "Say what you run" };
	if (venue.placeId && !isPlaceId(venue.placeId)) return { error: "Pick your venue on Google Maps again" };
	if (venue.website && !/^https:\/\/[^\s]+\.[^\s]+$/.test(venue.website)) return { error: "Your website starts with https://" };
	if (!venue.name) return { error: "Name your venue" };
	if (!venue.postalAddress) return { error: "Add your postal address: every email needs it" };
	if (needsTerms && formData.get("terms") !== "on") return { error: "Accept the terms to go on" };
	return { venue };
}

// The newsletter takes the venue's kind, its place on Google Maps, its postal address and its offer, and its content
// agent is on with the owner's topics. The agent's first round (lib/content-agent.js runFirstRound) starts after the
// answer: brief, 3 ideas and the first draft.
async function setUpVenue(account, newsletterId, { kind, placeId, postalAddress, language, topics, website, offerText, offerCode }) {
	await Newsletter.updateOne(scoped(account, { _id: newsletterId }), {
		$set: {
			venue: { kind, ...(placeId && { placeId }), ...(website && { website }) },
			postalAddress,
			"agent.enabled": isAgentConfigured(),
			"agent.language": language,
			"agent.topics": topics,
			// Double opt-in: the strongest proof of consent, and a stop to addresses typed for the discount (RGPD 7.1).
			requireConfirmation: true,
			...(language === "es" && { "signupForm.buttonText": "Suscribirme", "signupForm.placeholder": "tu@email.com" }),
			...(offerText && /^[A-Z0-9][A-Z0-9-]{0,23}$/.test(offerCode) && { "signupForm.offerText": offerText, "signupForm.offerCode": offerCode, "signupForm.offerUnique": true }),
		},
	});
	if (isAgentConfigured()) {
		after(() => runFirstRound(newsletterId, account._id).catch((error) => console.error(`[agent] First round of ${newsletterId}: ${error.message}`)));
	}
}

// The sign-up: the account's first newsletter is the venue, and the terms are accepted here, with the date and their
// version.
export async function completeVenueOnboarding(_state, formData) {
	const { account } = await requireAccount();
	const { venue, error } = readVenueForm(formData, { needsTerms: true });
	if (error) return { error };

	let newsletterId = null;
	if (await needsOnboarding(account)) {
		const { output, failure } = await runAccountAction("create_newsletter", { name: venue.name, slug: await findFreeSlug(venue.name), fromName: venue.name });
		if (failure) return toFormError(failure);
		newsletterId = output.id;
		await siteExtensions.sendGoalOnNextPage("onboarding_completed");
	} else {
		newsletterId = (await Newsletter.findOne(scoped(account, {})).sort({ createdAt: 1 }).select({ _id: 1 }).lean())?._id;
	}
	await setUpVenue(account, newsletterId, venue);
	await Account.updateOne(
		{ _id: account._id },
		{ $set: { "onboarding.completedAt": new Date(), "onboarding.venueKind": venue.kind, termsAcceptedAt: new Date(), termsVersion: TERMS_VERSION } }
	);
	// The fourth step: the guests in (app/(app)/contacts/page.js).
	redirect("/contacts?start=1");
}

// Add a newsletter on an account that has one already (components/FormAddNewsletter.jsx): another venue, with its own
// sender name, address, website and agent. It opens selected, on the step that brings its guests in.
export async function addVenueNewsletter(_state, formData) {
	const { account } = await requireAccount();
	const { venue, error } = readVenueForm(formData, { needsTerms: false });
	if (error) return { error };
	const { output, failure } = await runAccountAction("create_newsletter", {
		name: venue.name,
		slug: await findFreeSlug(venue.name),
		fromName: venue.name,
		postalAddress: venue.postalAddress,
	});
	if (failure) return toFormError(failure);
	await setUpVenue(account, output.id, venue);
	await saveSelectedNewsletter(output.id);
	// The fourth step: the guests in (app/(app)/contacts/page.js).
	redirect("/contacts?start=1");
}

// The get-started panel of one of the account's newsletters, hidden on the newsletter so it stays hidden on every
// device. Its other newsletters keep theirs.
export async function dismissGetStarted(newsletterId) {
	const id = String(newsletterId ?? "");
	if (!isObjectIdString(id)) return { error: "Couldn't close it" };
	const { account } = await requireAccount();
	await Newsletter.updateOne(
		scoped(account, { _id: id, "getStarted.dismissedAt": null }),
		{ $set: { "getStarted.dismissedAt": new Date() } }
	);
	revalidatePath("/", "layout");
	return { ok: true };
}

// The own-domain helper of one of the account's newsletters, closed for the step it suggested (lib/sender-rules.js).
// Kept on the newsletter so it stays closed on every device until the step changes. The helper hides itself as it
// closes, so no page renders again.
export async function dismissOwnDomainNudge(newsletterId, step) {
	const id = String(newsletterId ?? "");
	if (!isObjectIdString(id) || !OWN_DOMAIN_STEPS.includes(step)) return { error: "Couldn't close it" };
	const { account } = await requireAccount();
	await Newsletter.updateOne(scoped(account, { _id: id }), { $set: { "dismissedNudges.ownDomain": step } });
	return { ok: true };
}

// The inbox check at the dashboard's bottom right (lib/inbox-check.js), closed for good for one of the account's
// newsletters. The layout renders again, so the corner moves on to what waits for it.
export async function dismissInboxCheck(newsletterId) {
	const id = String(newsletterId ?? "");
	if (!isObjectIdString(id)) return { error: "Couldn't close it" };
	const { account } = await requireAccount();
	await Newsletter.updateOne(scoped(account, { _id: id, "dismissedNudges.inboxCheck": null }), { $set: { "dismissedNudges.inboxCheck": new Date() } });
	revalidatePath("/", "layout");
	return { ok: true };
}

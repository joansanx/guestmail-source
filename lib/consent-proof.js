import { createHash } from "node:crypto";
import { getSiteNotice } from "./archive-notice.js";
import { getPrivacyNoticeText, getVenueLanguage } from "./venue-legal.js";
import Contact from "../models/Contact.js";
import ConsentText from "../models/ConsentText.js";

// guestmail: proof of what a subscriber agreed to (RGPD art. 7.1, EDPB guidelines 05/2020): when, through which form and
// page, in which language, and the exact notice they were shown, kept once by its hash. No IP address: the guidelines
// ask for no more data than the proof needs. Never throws: a signup goes through even if the proof can't be saved.
export function hashNotice(text) {
	return createHash("sha256").update(text).digest("hex").slice(0, 24);
}

export async function recordConsent({ newsletter, email, channel, url = "", now = new Date() }) {
	try {
		const text = getPrivacyNoticeText(getSiteNotice(newsletter));
		const hash = hashNotice(text);
		const language = getVenueLanguage(newsletter);
		await ConsentText.updateOne(
			{ accountId: newsletter.accountId, newsletterId: newsletter._id, hash },
			{ $setOnInsert: { text, language } },
			{ upsert: true }
		);
		await Contact.updateOne(
			{ accountId: newsletter.accountId, newsletterId: newsletter._id, email },
			{ $set: { consentNotice: { hash, channel, url: String(url).slice(0, 500), language, at: now } } }
		);
	} catch (error) {
		console.error(`[consent] Proof for ${newsletter._id} not saved: ${error.message}`);
	}
}

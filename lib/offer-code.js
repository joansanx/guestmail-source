import "server-only";
import { createHmac } from "node:crypto";
import { startAutomations } from "@/lib/automation-runs";
import { getAppSecret } from "@/lib/config";
import Account from "@/models/Account";
import Contact from "@/models/Contact";
import { MAX_CONTACT_FIELDS } from "./contact-fields.js";
import { OFFER_FIELD, OFFER_TAG } from "./signup-form.js";

// guestmail: the code a venue's offer gives someone who joins from its form or popup (lib/signup-form.js). The venue's
// own code as it is, the one its booking engine takes, or with offerUnique one code per person: the venue's code and 6
// characters from the address, the same every time, so it needs no table of codes and no two people share one.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function getOfferCode(settings, { newsletterId, email }) {
	if (!settings.offerCode) return null;
	if (!settings.offerUnique) return settings.offerCode;
	const digest = createHmac("sha256", getAppSecret()).update(`offer:${newsletterId}:${email}`).digest();
	const suffix = Array.from(digest.subarray(0, 6), (byte) => ALPHABET[byte % ALPHABET.length]).join("");
	return `${settings.offerCode}-${suffix}`;
}

// The contact keeps its code in the account's field offer_code, which {{offer_code}} prints in emails and segments
// read, and the tag offer, which starts its automations (lib/automation-runs.js). The field is added to the account the
// first time, while it has room for one.
export async function saveOfferCode({ accountId, newsletterId, email, code }) {
	const [before] = await Promise.all([
		Contact.findOneAndUpdate(
			{ accountId, newsletterId, email },
			{ $set: { [`fields.${OFFER_FIELD.key}`]: code }, $addToSet: { tags: OFFER_TAG } },
			{ projection: { newsletterId: 1, tags: 1 } }
		).lean(),
		Account.updateOne(
			{ _id: accountId, "contactFields.key": { $ne: OFFER_FIELD.key }, [`contactFields.${MAX_CONTACT_FIELDS - 1}`]: { $exists: false } },
			{ $push: { contactFields: { ...OFFER_FIELD, createdAt: new Date() } } }
		),
	]);
	if (before && !before.tags?.includes(OFFER_TAG)) await startAutomations({ accountId, event: "tag", contacts: [before], tags: [OFFER_TAG] });
}

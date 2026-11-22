import "server-only";
import { connectDb } from "@/lib/db";
import { ATTRIBUTION_PARAMS, readAttribution } from "@/lib/marketing/attribution";
import Account from "@/models/Account";

// guestmail: where a new account came from (lib/marketing/attribution.js), from the sign-in form's hidden fields. Only
// for an account made in the last minutes that has none yet: a returning owner signing in again never changes it.
const NEW_ACCOUNT_MS = 10 * 60_000;

export function readAttributionFromForm(formData) {
	const url = new URL("https://x.invalid/");
	for (const key of ATTRIBUTION_PARAMS) {
		const value = formData.get(key);
		if (value) url.searchParams.set(key, String(value));
	}
	return readAttribution(url.toString());
}

export async function saveSignupSource(userId, attribution, now = new Date()) {
	await connectDb();
	await Account.updateOne(
		{ ownerId: userId, signupSource: { $exists: false }, createdAt: { $gte: new Date(now.getTime() - NEW_ACCOUNT_MS) } },
		{ $set: { signupSource: { ...attribution, at: now } } }
	);
}

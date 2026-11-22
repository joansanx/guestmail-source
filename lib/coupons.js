import "server-only";
import { grantFreePlan } from "@/lib/billing";
import { connectDb } from "@/lib/db";
import { getPlan } from "@/lib/plans";
import Coupon from "@/models/Coupon";

// guestmail: coupons (models/Coupon.js). GuestMail has no free plan for sale: a coupon is how an admin gives one, to
// their own account, a pilot hotel or a partner, without Stripe and while plans are off sale.
export const COUPON_PATTERN = /^[A-Z0-9][A-Z0-9-]{3,39}$/;

export function normalizeCode(code) {
	return String(code ?? "").trim().toUpperCase();
}

export async function createCoupon({ code, plan, months = null, maxRedemptions = 1, note = "", createdBy }) {
	const clean = normalizeCode(code);
	if (!COUPON_PATTERN.test(clean)) return { error: "A code is 4 to 40 letters, digits or dashes" };
	if (!getPlan(plan)) return { error: "Pick a plan" };
	await connectDb();
	// The unique index on code is what refuses a duplicate: wait for it, it's built in the background on first use.
	await Coupon.init();
	try {
		const coupon = await Coupon.create({ code: clean, plan, ...(months && { months }), maxRedemptions, note: String(note).slice(0, 200), createdBy });
		return { coupon };
	} catch (error) {
		if (error?.code === 11000) return { error: "That code exists already" };
		throw error;
	}
}

export async function listCoupons() {
	await connectDb();
	return Coupon.find({}).sort({ createdAt: -1 }).limit(200).lean();
}

export async function setCouponActive(code, active) {
	await connectDb();
	return Coupon.updateOne({ code: normalizeCode(code) }, { $set: { active } });
}

// Takes one use of the code for the account, then gives it the code's plan. The use is taken in one update, so two
// accounts can't take the last one together, and an account can't take the same code twice.
export async function redeemCoupon({ account, code, now = new Date() }) {
	await connectDb();
	const clean = normalizeCode(code);
	const taken = await Coupon.findOneAndUpdate(
		{
			code: clean,
			active: true,
			"redemptions.accountId": { $ne: account._id },
			$expr: { $lt: [{ $size: "$redemptions" }, "$maxRedemptions"] },
		},
		{ $push: { redemptions: { accountId: account._id, at: now } } },
		{ returnDocument: "after" }
	).lean();
	if (!taken) {
		const coupon = await Coupon.findOne({ code: clean }).lean();
		if (!coupon || !coupon.active) return { error: "This code doesn't exist or isn't active" };
		if (coupon.redemptions.some(({ accountId }) => String(accountId) === String(account._id))) return { error: "This account already used this code" };
		return { error: "This code has been used up" };
	}
	const until = taken.months ? new Date(new Date(now).setMonth(now.getMonth() + taken.months)) : null;
	const comp = await grantFreePlan({ accountId: account._id, plan: taken.plan, until, by: `coupon:${taken.code}` });
	return { plan: taken.plan, until: comp?.until ?? null };
}

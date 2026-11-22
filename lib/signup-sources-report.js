import "server-only";
import { connectDb } from "@/lib/db";
import { PAID_SUBSCRIPTION_STATUSES } from "@/lib/plans";
import Account from "@/models/Account";

// guestmail: new accounts by where they came from (lib/signup-source.js), and how many have a plan now. "direct": no UTM
// and no external site. Powered-by links (utm_campaign=powered_by) name the venue that brought them as the source.
export async function getSignupSources({ days = 90, now = new Date() } = {}) {
	await connectDb();
	const since = new Date(now.getTime() - days * 86_400_000);
	const rows = await Account.aggregate([
		{ $match: { createdAt: { $gte: since } } },
		{
			$group: {
				_id: {
					source: { $ifNull: ["$signupSource.utm_source", { $ifNull: ["$signupSource.ref", "direct"] }] },
					medium: { $ifNull: ["$signupSource.utm_medium", { $cond: [{ $ifNull: ["$signupSource.ref", false] }, "referral", "none"] }] },
					campaign: { $ifNull: ["$signupSource.utm_campaign", ""] },
				},
				accounts: { $sum: 1 },
				paying: { $sum: { $cond: [{ $in: ["$subscriptionStatus", PAID_SUBSCRIPTION_STATUSES] }, 1, 0] } },
				coupons: { $sum: { $cond: [{ $ifNull: ["$comp.plan", false] }, 1, 0] } },
			},
		},
		{ $sort: { accounts: -1 } },
	]).option({ crossAccount: true });
	return rows.map(({ _id, accounts, paying, coupons }) => ({ ..._id, accounts, paying, coupons }));
}

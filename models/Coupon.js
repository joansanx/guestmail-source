import mongoose from "mongoose";

// guestmail: a code an admin hands out that turns on a plan without Stripe (lib/coupons.js). Redeeming one gives the
// account a free plan (account.comp), the same as an admin's "Give a free plan": every feature, the plan's limits.
// months: how long it lasts, none for good. maxRedemptions: how many accounts can use it. redemptions: who did, once each.
const couponSchema = new mongoose.Schema(
	{
		code: { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 40 },
		plan: { type: String, required: true },
		months: { type: Number, min: 1, max: 120 },
		maxRedemptions: { type: Number, required: true, min: 1, max: 10_000, default: 1 },
		redemptions: [{ accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" }, at: { type: Date }, _id: false }],
		active: { type: Boolean, default: true },
		note: { type: String, maxlength: 200 },
		createdBy: { type: String, maxlength: 200 },
	},
	{ timestamps: true }
);

export default mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);

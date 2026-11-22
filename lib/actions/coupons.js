import "server-only";
import * as z from "zod";
import { defineAction } from "@/lib/actions/define-action";
import { actionError } from "@/lib/actions/errors";
import { dateOutput, toIso } from "@/lib/actions/shared";
import { isCloud } from "@/lib/config";
import { redeemCoupon } from "@/lib/coupons";
import { PLAN_IDS } from "@/lib/plans";

// guestmail: an account redeems a coupon an admin gave it (lib/coupons.js), for a plan without Stripe.
const redeem = defineAction({
	name: "redeem_coupon",
	tryWithoutPlan: true,
	title: "Redeem a coupon",
	group: "Billing",
	description: "Turns on the plan of a coupon GuestMail gave you, for the months it says or for good, without a card. Each account can use a code once.",
	http: { method: "POST", path: "/billing/coupons" },
	rateLimit: { limit: 10, window: "1 h" },
	input: z.object({ code: z.string().trim().min(4).max(40).describe("The coupon's code, like HOTEL-PILOT") }),
	output: z.object({ plan: z.enum(PLAN_IDS), until: dateOutput.describe("When the plan ends, or null for good") }),
	handler: async ({ account, input }) => {
		if (!isCloud()) throw actionError("billing_off", "Billing is off on this server: every account has every feature, without plan limits");
		const result = await redeemCoupon({ account, code: input.code });
		if (result.error) throw actionError("validation_failed", result.error);
		return { plan: result.plan, until: toIso(result.until) };
	},
});

export const couponActions = [redeem];

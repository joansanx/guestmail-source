"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createCoupon, setCouponActive } from "@/lib/coupons";

// guestmail: the admin's coupons (lib/coupons.js).
export async function addCoupon(_state, formData) {
	const admin = await requireAdmin();
	const months = Number(formData.get("months")) || null;
	const result = await createCoupon({
		code: formData.get("code"),
		plan: String(formData.get("plan") ?? ""),
		months,
		maxRedemptions: Math.max(1, Math.min(10_000, Number(formData.get("maxRedemptions")) || 1)),
		note: String(formData.get("note") ?? ""),
		createdBy: admin.email,
	});
	if (result.error) return { error: result.error };
	revalidatePath("/admin/coupons");
	return { created: result.coupon.code };
}

export async function toggleCoupon(code, active) {
	await requireAdmin();
	await setCouponActive(code, active);
	revalidatePath("/admin/coupons");
}

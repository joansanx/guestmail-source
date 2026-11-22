"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Ticket } from "lucide-react";
import { redeemCouponCode } from "@/app/(account)/billing/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

// guestmail: "Have a code?" on the billing page: a coupon GuestMail gave turns on its plan (lib/coupons.js).
export default function CardCoupon({ className }) {
	const router = useRouter();
	const [code, setCode] = useState("");
	const [isRedeeming, startRedeeming] = useTransition();

	function redeem(event) {
		event.preventDefault();
		startRedeeming(async () => {
			const result = await redeemCouponCode(code);
			if (result?.error) return void toast.error(result.error);
			toast.success(result.until ? `Your plan is on until ${new Date(result.until).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : "Your plan is on");
			router.push("/");
		});
	}

	return (
		<form onSubmit={redeem} className={cn("flex flex-col gap-3 rounded-xl bg-card p-4 shadow-border sm:flex-row sm:items-center", className)}>
			<label htmlFor="coupon" className="flex shrink-0 items-center gap-2 text-sm font-medium">
				<Ticket className="size-4" aria-hidden="true" /> Have a code?
			</label>
			<Input id="coupon" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="HOTEL-PILOT" maxLength={40} autoComplete="off" className="font-mono" />
			<Button type="submit" disabled={code.trim().length < 4 || isRedeeming}>
				{isRedeeming && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />} Redeem
			</Button>
		</form>
	);
}

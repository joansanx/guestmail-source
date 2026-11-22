"use client";

import { useActionState } from "react";
import { addCoupon } from "@/app/admin/coupons/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// guestmail: the admin's form for a new coupon (app/admin/coupons).
export default function FormCoupon({ plans }) {
	const [state, action, isPending] = useActionState(addCoupon, null);
	return (
		<form action={action} className="mt-6 grid gap-3 rounded-xl bg-card p-4 shadow-border sm:grid-cols-2">
			<label className="flex flex-col gap-1.5 text-sm">
				Code
				<Input name="code" required placeholder="HOTEL-PILOT" maxLength={40} className="font-mono uppercase" autoComplete="off" />
			</label>
			<label className="flex flex-col gap-1.5 text-sm">
				Plan
				<select name="plan" defaultValue="ultra" className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
					{plans.map(({ id, name }) => (
						<option key={id} value={id}>
							{name}
						</option>
					))}
				</select>
			</label>
			<label className="flex flex-col gap-1.5 text-sm">
				Months (empty: for good)
				<Input name="months" type="number" min={1} max={120} placeholder="For good" />
			</label>
			<label className="flex flex-col gap-1.5 text-sm">
				Accounts that can use it
				<Input name="maxRedemptions" type="number" min={1} max={10000} defaultValue={1} />
			</label>
			<label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
				Note
				<Input name="note" maxLength={200} placeholder="Who it's for" />
			</label>
			<div className="flex items-center gap-3 sm:col-span-2">
				<Button type="submit" disabled={isPending}>
					Create coupon
				</Button>
				{state?.error && <span className="text-sm text-destructive">{state.error}</span>}
				{state?.created && <span className="text-sm text-muted-foreground">Created {state.created}</span>}
			</div>
		</form>
	);
}

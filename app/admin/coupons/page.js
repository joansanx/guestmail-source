import Link from "next/link";
import FormCoupon from "@/components/FormCoupon";
import { requireAdmin } from "@/lib/auth";
import { listCoupons } from "@/lib/coupons";
import { PLANS } from "@/lib/plans";

export const metadata = { title: "Coupons" };

// guestmail: coupons turn on a plan without Stripe (lib/coupons.js). An account redeems one on its billing page.
export default async function CouponsPage() {
	await requireAdmin();
	const coupons = await listCoupons();
	return (
		<main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-10">
			<nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
				<Link href="/admin" className="hover:text-foreground">Admin</Link>
				<span aria-hidden="true">/</span>
				<span>Coupons</span>
			</nav>
			<h1 className="text-2xl font-semibold tracking-tight">Coupons</h1>
			<p className="mt-2 text-sm text-pretty text-muted-foreground">A code turns on a plan for an account, without a card. It works while plans are off sale.</p>
			<FormCoupon plans={PLANS.map(({ id, name }) => ({ id, name }))} />
			<ul className="mt-8 divide-y divide-border/60 rounded-xl bg-card shadow-border">
				{coupons.length === 0 && <li className="px-4 py-3 text-sm text-muted-foreground">No coupons yet.</li>}
				{coupons.map((coupon) => (
					<li key={coupon.code} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
						<span className="font-mono font-medium">{coupon.code}</span>
						<span className="text-muted-foreground">
							{coupon.plan} · {coupon.months ? `${coupon.months} months` : "for good"} · used {coupon.redemptions.length} of {coupon.maxRedemptions}
							{coupon.active ? "" : " · off"}
						</span>
						{coupon.note && <span className="w-full text-xs text-muted-foreground">{coupon.note}</span>}
					</li>
				))}
			</ul>
		</main>
	);
}

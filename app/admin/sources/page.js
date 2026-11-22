import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getSignupSources } from "@/lib/signup-sources-report";

export const metadata = { title: "Sources" };
export const dynamic = "force-dynamic";

// guestmail: where new accounts came from in the last 90 days, and which of them pay (lib/signup-sources-report.js).
export default async function SourcesPage() {
	await requireAdmin();
	const rows = await getSignupSources();
	const total = rows.reduce((sum, row) => sum + row.accounts, 0);
	return (
		<main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-10">
			<nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
				<Link href="/admin" className="hover:text-foreground">Admin</Link>
				<span aria-hidden="true">/</span>
				<span>Sources</span>
			</nav>
			<h1 className="text-2xl font-semibold tracking-tight">Sources</h1>
			<p className="mt-2 text-sm text-pretty text-muted-foreground">
				New accounts in the last 90 days by where they came from: the UTM parameters of the visit, or the site that sent it. Links in
				venues&apos; websites and emails are utm_campaign powered_by, with the venue as the source.
			</p>
			<div className="mt-6 overflow-x-auto rounded-xl bg-card shadow-border">
				<table className="w-full text-left text-sm">
					<thead>
						<tr className="border-b border-border/60 text-muted-foreground">
							<th className="px-4 py-2.5 font-medium">Source</th>
							<th className="px-4 py-2.5 font-medium">Medium</th>
							<th className="px-4 py-2.5 font-medium">Campaign</th>
							<th className="px-4 py-2.5 text-right font-medium">Accounts</th>
							<th className="px-4 py-2.5 text-right font-medium">Paying</th>
							<th className="px-4 py-2.5 text-right font-medium">Coupon</th>
						</tr>
					</thead>
					<tbody>
						{rows.length === 0 && (
							<tr>
								<td colSpan={6} className="px-4 py-3 text-muted-foreground">No new accounts in the last 90 days.</td>
							</tr>
						)}
						{rows.map((row) => (
							<tr key={`${row.source}|${row.medium}|${row.campaign}`} className="border-b border-border/40 last:border-0">
								<td className="px-4 py-2.5 font-medium">{row.source}</td>
								<td className="px-4 py-2.5 text-muted-foreground">{row.medium}</td>
								<td className="px-4 py-2.5 text-muted-foreground">{row.campaign || "none"}</td>
								<td className="px-4 py-2.5 text-right tabular-nums">{row.accounts}</td>
								<td className="px-4 py-2.5 text-right tabular-nums">{row.paying}</td>
								<td className="px-4 py-2.5 text-right tabular-nums">{row.coupons}</td>
							</tr>
						))}
					</tbody>
					{total > 0 && (
						<tfoot>
							<tr className="text-muted-foreground">
								<td colSpan={3} className="px-4 py-2.5">Total</td>
								<td className="px-4 py-2.5 text-right tabular-nums">{total}</td>
								<td className="px-4 py-2.5 text-right tabular-nums">{rows.reduce((sum, row) => sum + row.paying, 0)}</td>
								<td className="px-4 py-2.5 text-right tabular-nums">{rows.reduce((sum, row) => sum + row.coupons, 0)}</td>
							</tr>
						</tfoot>
					)}
				</table>
			</div>
		</main>
	);
}

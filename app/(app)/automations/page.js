import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, TriangleAlert, Zap } from "lucide-react";
import ButtonNewAutomation from "@/components/ButtonNewAutomation";
import HeaderPage from "@/components/HeaderPage";
import LayoutNarrow from "@/components/LayoutNarrow";
import PanelAutomations from "@/components/PanelAutomations";
import StateEmpty from "@/components/StateEmpty";
import TextTrigger from "@/components/TextTrigger";
import { runDashboardAction } from "@/lib/actions/dashboard";
import { formatNumber } from "@/lib/format";
import { ADD_NEWSLETTER_PATH } from "@/lib/newsletters";
import { requireRole } from "@/lib/selected-newsletter";

export const metadata = { title: "Automations" };

// guestmail: the newsletter's automations (lib/actions/automations.js), each a path of emails that goes out on its own,
// and for a hotel its four automatic emails by date (lib/automations.js).
export default async function AutomationsPage() {
	const { selected } = await requireRole("admin");
	if (!selected) redirect(ADD_NEWSLETTER_PATH);
	const newsletter = String(selected._id);
	const [list, hotel] = await Promise.all([
		runDashboardAction("list_automations", { newsletter }),
		runDashboardAction("list_hotel_automations", { newsletter }),
	]);
	const automations = list.output?.automations ?? [];
	return (
		<LayoutNarrow>
			<HeaderPage title="Automations" parent={{ label: "Overview", href: "/" }}>
				{automations.length > 0 && <ButtonNewAutomation newsletterId={newsletter} />}
			</HeaderPage>
			<div className="flex flex-col gap-10">
				{list.failure ? (
					<p className="rounded-xl bg-card px-4 py-3 text-sm text-muted-foreground shadow-border">{list.failure.message}</p>
				) : automations.length === 0 ? (
					<StateEmpty icon={Zap} title="No automations yet">
						<p className="max-w-sm text-sm text-pretty text-muted-foreground">
							A series of emails that goes out on its own when someone joins, gets a tag, clicks a link or books.
						</p>
						<ButtonNewAutomation newsletterId={newsletter} label="Create an automation" />
					</StateEmpty>
				) : (
					<ul className="flex flex-col gap-3">
						{automations.map((automation, index) => (
							<li key={automation.id} style={{ "--stagger": index }} className="animate-enter">
								<RowAutomation automation={automation} />
							</li>
						))}
					</ul>
				)}
				{hotel.output?.available && (
					<section className="flex flex-col gap-4">
						<h2 className="text-base font-semibold">Automatic emails by date</h2>
						<PanelAutomations
							key={newsletter}
							newsletterId={newsletter}
							available
							automations={hotel.output.automations}
							problem={hotel.failure?.message ?? null}
						/>
					</section>
				)}
			</div>
		</LayoutNarrow>
	);
}

function RowAutomation({ automation }) {
	const { people } = automation;
	return (
		<Link
			href={`/automations/${automation.id}`}
			className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-border transition-colors duration-150 hover:bg-muted/50"
		>
			<span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
				<Zap className="size-4" aria-hidden="true" />
			</span>
			<span className="flex min-w-0 flex-1 flex-col gap-0.5">
				<span className="flex min-w-0 items-center gap-2">
					<span data-no-translate className="truncate text-sm font-semibold">
						{automation.name}
					</span>
					<span
						className={
							automation.enabled
								? "shrink-0 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400"
								: "shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground"
						}
					>
						{automation.enabled ? "On" : "Off"}
					</span>
				</span>
				<span className="truncate text-sm text-muted-foreground">
					<TextTrigger trigger={automation.trigger} />
				</span>
				<span className="text-xs text-muted-foreground">
					{automation.emails === 1 ? "1 email" : `${formatNumber(automation.emails)} emails`} · {formatNumber(people.active)} on their way ·{" "}
					{formatNumber(people.entered)} entered
				</span>
				{automation.problem && (
					<span className="mt-1 flex items-start gap-1.5 text-xs text-pretty text-amber-700 dark:text-amber-400">
						<TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
						{automation.problem}
					</span>
				)}
			</span>
			<ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
		</Link>
	);
}

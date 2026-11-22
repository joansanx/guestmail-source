import { redirect } from "next/navigation";
import HeaderPage from "@/components/HeaderPage";
import LayoutNarrow from "@/components/LayoutNarrow";
import PanelAgent from "@/components/PanelAgent";
import PanelPilot from "@/components/PanelPilot";
import { scoped } from "@/lib/account-scope";
import { runDashboardAction } from "@/lib/actions/dashboard";
import { buildStarterBrief } from "@/lib/content-agent";
import { ADD_NEWSLETTER_PATH } from "@/lib/newsletters";
import { listLiveSegments } from "@/lib/segment-queries";
import { requireRole } from "@/lib/selected-newsletter";
import { hasRole } from "@/lib/team-rules";
import Newsletter from "@/models/Newsletter";

export const metadata = { title: "Content agent" };

// guestmail: the content agent of the selected newsletter: its brief (context.md), the ideas it proposes for the
// owner to approve, and the drafts it wrote from them. Under it, the autopilot: the menu the owner gave it, its rhythm
// and the campaigns it prepared (components/PanelPilot.jsx).
export default async function AgentPage() {
	const { account, selected, role } = await requireRole("member");
	if (!selected) redirect(ADD_NEWSLETTER_PATH);
	const newsletter = await Newsletter.findOne(scoped(account, { _id: selected._id })).select({ name: 1, postalAddress: 1, venue: 1 }).lean();
	const [agent, ideas, pilot, proposals, segments] = await Promise.all([
		runDashboardAction("get_agent", { newsletter: String(selected._id) }),
		runDashboardAction("list_ideas", { newsletter: String(selected._id) }),
		runDashboardAction("get_pilot", { newsletter: String(selected._id) }),
		runDashboardAction("list_proposals", { newsletter: String(selected._id) }),
		listLiveSegments(account, selected._id),
	]);

	return (
		<LayoutNarrow>
			<HeaderPage title="Content agent" parent={{ label: "Overview", href: "/" }} />
			<PanelAgent
				key={String(selected._id)}
				newsletterId={String(selected._id)}
				agent={agent.output ?? null}
				ideas={ideas.output?.ideas ?? []}
				starterBrief={buildStarterBrief(newsletter)}
				hasPlace={Boolean(newsletter.venue?.placeId)}
				problem={agent.failure?.message ?? ideas.failure?.message ?? null}
				canEdit={hasRole(role, "admin")}
			/>
			<div className="mt-6 flex flex-col gap-6">
				<PanelPilot
					key={String(selected._id)}
					newsletterId={String(selected._id)}
					pilot={pilot.output ?? null}
					proposals={proposals.output?.proposals ?? []}
					segments={segments.map(({ _id, name }) => ({ id: String(_id), name }))}
					canEdit={hasRole(role, "admin")}
				/>
			</div>
		</LayoutNarrow>
	);
}

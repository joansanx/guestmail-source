import { redirect } from "next/navigation";
import HeaderPage from "@/components/HeaderPage";
import LayoutNarrow from "@/components/LayoutNarrow";
import PanelAutomations from "@/components/PanelAutomations";
import { runDashboardAction } from "@/lib/actions/dashboard";
import { ADD_NEWSLETTER_PATH } from "@/lib/newsletters";
import { requireRole } from "@/lib/selected-newsletter";

export const metadata = { title: "Automations" };

// guestmail: a hotel's automatic emails (lib/automations.js), each on or off, each an email to edit like a campaign.
export default async function AutomationsPage() {
	const { selected } = await requireRole("admin");
	if (!selected) redirect(ADD_NEWSLETTER_PATH);
	const { output, failure } = await runDashboardAction("list_automations", { newsletter: String(selected._id) });
	return (
		<LayoutNarrow>
			<HeaderPage title="Automations" parent={{ label: "Overview", href: "/" }} />
			<PanelAutomations
				key={String(selected._id)}
				newsletterId={String(selected._id)}
				available={output?.available ?? false}
				automations={output?.automations ?? []}
				problem={failure?.message ?? null}
			/>
		</LayoutNarrow>
	);
}

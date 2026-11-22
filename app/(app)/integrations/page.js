import { redirect } from "next/navigation";
import CardAgents from "@/components/CardAgents";
import HeaderPage from "@/components/HeaderPage";
import LayoutNarrow from "@/components/LayoutNarrow";
import PanelConnector from "@/components/PanelConnector";
import { runDashboardAction } from "@/lib/actions/dashboard";
import { ADD_NEWSLETTER_PATH } from "@/lib/newsletters";
import { requireRole } from "@/lib/selected-newsletter";

export const metadata = { title: "Integrations" };

// guestmail: where reservations come in from a PMS, a booking engine or a no-code tool (lib/connector.js).
export default async function IntegrationsPage() {
	const { selected } = await requireRole("admin");
	if (!selected) redirect(ADD_NEWSLETTER_PATH);
	const { output, failure } = await runDashboardAction("get_connector", { newsletter: String(selected._id) });
	return (
		<LayoutNarrow>
			<HeaderPage title="Integrations" parent={{ label: "Overview", href: "/" }} />
			<PanelConnector key={String(selected._id)} newsletterId={String(selected._id)} connector={output ?? null} problem={failure?.message ?? null} />
			<CardAgents className="mt-6" />
		</LayoutNarrow>
	);
}

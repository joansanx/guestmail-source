import { redirect } from "next/navigation";
import HeaderPage from "@/components/HeaderPage";
import LayoutNarrow from "@/components/LayoutNarrow";
import PanelReputation from "@/components/PanelReputation";
import { scoped } from "@/lib/account-scope";
import { runDashboardAction } from "@/lib/actions/dashboard";
import { isPlacesConfigured } from "@/lib/google-places";
import { ADD_NEWSLETTER_PATH } from "@/lib/newsletters";
import { requireRole } from "@/lib/selected-newsletter";
import { hasRole } from "@/lib/team-rules";
import Newsletter from "@/models/Newsletter";

export const metadata = { title: "Reputation" };

// guestmail: what guests say about the venue on Google Maps, read live on every visit (Google lets nothing of it be
// kept), with the reviews worth quoting marked and a draft campaign one click away.
export default async function ReputationPage() {
	const { account, selected, role } = await requireRole("member");
	if (!selected) redirect(ADD_NEWSLETTER_PATH);
	const newsletter = await Newsletter.findOne(scoped(account, { _id: selected._id })).select({ venue: 1 }).lean();
	const hasPlace = Boolean(newsletter.venue?.placeId);
	const { output, failure } = hasPlace && isPlacesConfigured() ? await runDashboardAction("get_reputation", { newsletter: String(selected._id) }) : {};

	return (
		<LayoutNarrow>
			<HeaderPage title="Reputation" parent={{ label: "Overview", href: "/" }} />
			<PanelReputation
				key={String(selected._id)}
				newsletterId={String(selected._id)}
				venue={{ kind: newsletter.venue?.kind ?? null, placeId: newsletter.venue?.placeId ?? null, bookingUrl: newsletter.venue?.bookingUrl ?? null }}
				reputation={output ?? null}
				problem={!isPlacesConfigured() ? "Reputation isn't set up on this server yet: it needs a Google Maps key." : (failure?.message ?? null)}
				canEdit={hasRole(role, "admin")}
			/>
		</LayoutNarrow>
	);
}

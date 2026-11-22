import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import EditorAutomation from "@/components/EditorAutomation";
import { runDashboardAction } from "@/lib/actions/dashboard";
import { formatDate } from "@/lib/format";
import { gravatarHash } from "@/lib/gravatar";
import { ADD_NEWSLETTER_PATH } from "@/lib/newsletters";
import { openNewsletter, requireRole } from "@/lib/selected-newsletter";
import { TIME_ZONE_COOKIE, resolveTimeZone } from "@/lib/time-zone";

export const metadata = { title: "Automation" };

// guestmail: one automation (lib/actions/automations.js): its trigger and path to edit, its switch, and who's on it.
export default async function AutomationPage({ params }) {
	const [{ id }, view, cookieStore] = await Promise.all([params, requireRole("admin"), cookies()]);
	const { selected } = view;
	if (!selected) redirect(ADD_NEWSLETTER_PATH);
	const automation = await runDashboardAction("get_automation", { id });
	if (automation.failure?.code === "not_found") notFound();
	if (automation.failure) throw new Error(automation.failure.message);
	// Its newsletter opens with it, like a campaign's.
	openNewsletter(view, automation.output.newsletterId, `/automations/${id}`);
	if (automation.output.newsletterId !== String(selected._id)) notFound();
	const newsletter = String(selected._id);
	const [segments, campaigns, tags] = await Promise.all([
		runDashboardAction("list_segments", { newsletter }),
		runDashboardAction("list_campaigns", { newsletter, status: "sent", limit: 50 }),
		runDashboardAction("list_contact_tags", { newsletter }),
	]);
	const timeZone = resolveTimeZone(cookieStore.get(TIME_ZONE_COOKIE)?.value);
	const recent = automation.output.recent.map((person) => ({ ...person, gravatarHash: gravatarHash(person.email), enteredOn: formatDate(person.enteredAt, timeZone) }));
	return (
		<EditorAutomation
			key={automation.output.id}
			automation={{ ...automation.output, recent }}
			segments={(segments.output?.segments ?? []).map(({ id: segmentId, name }) => ({ id: segmentId, name }))}
			campaigns={(campaigns.output?.campaigns ?? []).map(({ id: campaignId, subject }) => ({ id: campaignId, subject }))}
			tags={(tags.output?.tags ?? []).map(({ name }) => name)}
			isVenue={Boolean(selected.venue?.kind)}
		/>
	);
}

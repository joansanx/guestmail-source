import { redirect } from "next/navigation";
import HeaderPage from "@/components/HeaderPage";
import LayoutNarrow from "@/components/LayoutNarrow";
import PanelTemplates from "@/components/PanelTemplates";
import { scoped } from "@/lib/account-scope";
import { runDashboardAction } from "@/lib/actions/dashboard";
import { CAMPAIGN_TEMPLATES, TEMPLATE_GOALS, TEMPLATE_LANGUAGES } from "@/lib/campaign-templates";
import { getTemplatePreview } from "@/lib/design-gallery";
import { ADD_NEWSLETTER_PATH } from "@/lib/newsletters";
import { requireRole } from "@/lib/selected-newsletter";
import Newsletter from "@/models/Newsletter";

export const metadata = { title: "Templates" };

// guestmail: campaigns that bring revenue, ready to fill in, in English and Spanish: the designs with photos for the
// venue's kind, in its language, as list_templates lists them (lib/actions/templates.js), and the text templates
// (lib/campaign-templates.js).
export default async function TemplatesPage() {
	const { account, selected } = await requireRole("member");
	if (!selected) redirect(ADD_NEWSLETTER_PATH);
	const newsletter = await Newsletter.findOne(scoped(account, { _id: selected._id })).select({ name: 1, venue: 1, agent: 1, theme: 1 }).lean();
	const { output, failure } = await runDashboardAction("list_templates", { newsletter: String(selected._id), previews: true });
	// Every text template in both languages, the page switches between them (about 100 KB in all).
	const previews = Object.fromEntries(
		CAMPAIGN_TEMPLATES.map((template) => [template.id, Object.fromEntries(TEMPLATE_LANGUAGES.map((language) => [language, getTemplatePreview(template, language, newsletter)]))])
	);
	return (
		<LayoutNarrow>
			<HeaderPage title="Templates" parent={{ label: "Overview", href: "/" }} />
			<PanelTemplates
				newsletterId={String(selected._id)}
				templates={CAMPAIGN_TEMPLATES}
				previews={previews}
				gallery={failure ? { error: failure.message } : { designs: output.designs, language: output.language }}
				goals={TEMPLATE_GOALS}
				defaultKind={newsletter.venue?.kind ?? "hotel"}
				defaultLanguage={newsletter.agent?.language ?? "en"}
			/>
		</LayoutNarrow>
	);
}

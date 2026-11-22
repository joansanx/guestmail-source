"use server";

import { runDashboardAction, toFormError } from "@/lib/actions/dashboard";

// guestmail: the Templates page's action, the same one the API and MCP run (lib/actions/templates.js).
export async function draftFromTemplate(newsletterId, id, language) {
	const { output, failure } = await runDashboardAction("create_campaign_from_template", { newsletter: String(newsletterId ?? ""), id: String(id ?? ""), language });
	return failure ? toFormError(failure) : { id: output.id };
}

// A newsletter's designs with their previews, for the New campaign dialog, which asks for them only once it shows them
// (components/DialogNewCampaign.jsx).
export async function loadDesignGallery(newsletterId) {
	const { output, failure } = await runDashboardAction("list_templates", { newsletter: String(newsletterId ?? ""), previews: true });
	return failure ? toFormError(failure) : { designs: output.designs, language: output.language };
}

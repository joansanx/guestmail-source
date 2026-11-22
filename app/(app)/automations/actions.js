"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { runDashboardAction, toFormError } from "@/lib/actions/dashboard";

// guestmail: the Automations page's actions, the same ones the API and MCP run (lib/actions/automations.js).
export async function editAutomation(newsletterId, kind) {
	const { output, failure } = await runDashboardAction("update_automation", { newsletter: String(newsletterId ?? ""), kind });
	if (failure) return toFormError(failure);
	redirect(`/campaigns/${output.campaign}`);
}

export async function switchAutomation(newsletterId, kind, enabled) {
	const { output, failure } = await runDashboardAction("update_automation", { newsletter: String(newsletterId ?? ""), kind, enabled: Boolean(enabled) });
	if (failure) return toFormError(failure);
	revalidatePath("/automations");
	return output;
}

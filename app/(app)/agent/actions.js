"use server";

import { revalidatePath } from "next/cache";
import { runDashboardAction, toFormError } from "@/lib/actions/dashboard";

// guestmail: the Content agent page's server actions, each the same action the API and MCP run (lib/actions/agent.js).
export async function saveAgent(newsletterId, changes) {
	const { output, failure } = await runDashboardAction("update_agent", { newsletter: String(newsletterId ?? ""), ...changes });
	if (failure) return toFormError(failure);
	revalidatePath("/agent");
	return output;
}

export async function decideIdea(newsletterId, id, decision) {
	const { output, failure } = await runDashboardAction("decide_idea", { newsletter: String(newsletterId ?? ""), id: String(id ?? ""), decision });
	if (failure) return toFormError(failure);
	revalidatePath("/agent");
	return output;
}

export async function writeBriefFromVenue(newsletterId) {
	const { output, failure } = await runDashboardAction("generate_brief", { newsletter: String(newsletterId ?? "") });
	if (failure) return toFormError(failure);
	revalidatePath("/agent");
	return output;
}

// The autopilot (lib/actions/pilot.js). An uploaded PDF goes through app/api/agent/menu instead: a file is too big for
// a server action.
export async function readMenu(newsletterId, url) {
	const { output, failure } = await runDashboardAction("read_menu", { newsletter: String(newsletterId ?? ""), ...(url && { url: String(url) }) });
	if (failure) return toFormError(failure);
	revalidatePath("/agent");
	return output;
}

export async function saveMenu(newsletterId, changes) {
	const { output, failure } = await runDashboardAction("update_menu", { newsletter: String(newsletterId ?? ""), ...changes });
	if (failure) return toFormError(failure);
	revalidatePath("/agent");
	return output;
}

export async function savePilot(newsletterId, changes) {
	const { output, failure } = await runDashboardAction("update_pilot", { newsletter: String(newsletterId ?? ""), ...changes });
	if (failure) return toFormError(failure);
	revalidatePath("/agent");
	return output;
}

export async function decideProposal(newsletterId, id, decision) {
	const { output, failure } = await runDashboardAction("decide_proposal", { newsletter: String(newsletterId ?? ""), id: String(id ?? ""), decision });
	if (failure) return toFormError(failure);
	revalidatePath("/agent");
	return output;
}

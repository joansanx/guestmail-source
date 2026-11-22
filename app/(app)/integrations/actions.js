"use server";

import { revalidatePath } from "next/cache";
import { runDashboardAction, toFormError } from "@/lib/actions/dashboard";

// guestmail: the Integrations page's actions, the same ones the API and MCP run (lib/actions/connector.js).
export async function turnOnConnector(newsletterId) {
	const { output, failure } = await runDashboardAction("enable_connector", { newsletter: String(newsletterId ?? ""), consent: true });
	if (failure) return toFormError(failure);
	revalidatePath("/integrations");
	return output;
}

export async function turnOffConnector(newsletterId) {
	const { output, failure } = await runDashboardAction("disable_connector", { newsletter: String(newsletterId ?? "") });
	if (failure) return toFormError(failure);
	revalidatePath("/integrations");
	return output;
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { runDashboardAction, toFormError } from "@/lib/actions/dashboard";

// guestmail: the Automations pages' actions, the same ones the API and MCP run (lib/actions/automations.js).
export async function createAutomation(newsletterId, template) {
	const { output, failure } = await runDashboardAction("create_automation", { newsletter: String(newsletterId ?? ""), template: String(template ?? "") });
	if (failure) return toFormError(failure);
	redirect(`/automations/${output.id}`);
}

export async function saveAutomation(id, { name, trigger, steps } = {}) {
	const { output, failure } = await runDashboardAction("update_automation", { id: String(id ?? ""), name, trigger, steps });
	if (failure) return toFormError(failure);
	revalidatePath(`/automations/${output.id}`);
	return output;
}

export async function turnOnAutomation(id) {
	const { output, failure } = await runDashboardAction("turn_on_automation", { id: String(id ?? "") });
	if (failure) return toFormError(failure);
	revalidatePath(`/automations/${output.id}`);
	return output;
}

export async function turnOffAutomation(id) {
	const { output, failure } = await runDashboardAction("turn_off_automation", { id: String(id ?? "") });
	if (failure) return toFormError(failure);
	revalidatePath(`/automations/${output.id}`);
	return output;
}

export async function deleteAutomation(id) {
	const { failure } = await runDashboardAction("delete_automation", { id: String(id ?? "") });
	if (failure) return toFormError(failure);
	redirect("/automations");
}

export async function addContactToAutomation(id, contactId) {
	const { output, failure } = await runDashboardAction("add_contact_to_automation", { id: String(id ?? ""), contact: String(contactId ?? "") });
	if (failure) return toFormError(failure);
	revalidatePath(`/contacts/${contactId}`);
	return output;
}

export async function editHotelAutomation(newsletterId, kind) {
	const { output, failure } = await runDashboardAction("update_hotel_automation", { newsletter: String(newsletterId ?? ""), kind });
	if (failure) return toFormError(failure);
	redirect(`/campaigns/${output.campaign}`);
}

export async function switchHotelAutomation(newsletterId, kind, enabled) {
	const { output, failure } = await runDashboardAction("update_hotel_automation", { newsletter: String(newsletterId ?? ""), kind, enabled: Boolean(enabled) });
	if (failure) return toFormError(failure);
	revalidatePath("/automations");
	return output;
}

"use server";

import { headers } from "next/headers";
import { toActionError } from "@/lib/actions/errors";
import { decideByLink } from "@/lib/pilot";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

// guestmail: the two buttons of the approval page (app/approve). The link's token is the only credential: it names
// one proposal of one account, and the proposal takes one answer.
const PER_IP = { name: "approve-ip", limit: 20, window: "10 m" };

async function decide(token, decision) {
	if (await isRateLimited({ ...PER_IP, key: getClientIp(await headers()) })) return { error: "busy" };
	try {
		const proposal = await decideByLink(typeof token === "string" ? token : null, decision);
		return { ok: true, status: proposal.status, scheduledAt: proposal.scheduledAt?.toISOString() ?? null };
	} catch (error) {
		const { code, message } = toActionError(error);
		if (code === "internal_error") console.error("[approve] The decision failed:", error);
		// Decided before, or a link that stopped working: nothing to try again. Anything else says why it wasn't scheduled.
		return code === "not_found" || error.isDecided ? { error: "used" } : { error: "refused", message };
	}
}

export async function approveCampaign(token) {
	return decide(token, "approved");
}

export async function rejectCampaign(token) {
	return decide(token, "rejected");
}

import { NextResponse } from "next/server";
import { processAutomation } from "@/lib/automation-runs";
import { withQStashSignature } from "@/lib/qstash-route";

export const dynamic = "force-dynamic";

// guestmail: an automation walks the people it has due and sends the emails they reached (lib/automation-runs.js).
// Handled outcomes answer 200 so QStash doesn't retry them; a thrown error (database down) is retried.
async function handleRun(request) {
	const body = await request.json().catch(() => null);
	const job = { accountId: body?.accountId, automationId: body?.automationId };
	const result = await processAutomation({ ...job, isRetry: body?.retry === true });
	console.info(`[run-automation] ${JSON.stringify({ ...job, ...result })}`);
	return NextResponse.json(result);
}

export const POST = withQStashSignature(handleRun);

import "server-only";
import { NextResponse } from "next/server";
import { sendAlertIfRepeated } from "@/lib/alerts";
import { handleEmailEvent } from "@/lib/email-events";
import { normalizeResendEvent, verifyResendSignature } from "@/lib/email-provider/resend-events";
import { isPlainObject } from "@/lib/validation";

// Resend posts one event per request.
const MAX_BODY_BYTES = 512 * 1024;

function reply(status, body) {
	return NextResponse.json(body, { status });
}

function parseJson(text) {
	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
}

// Each event names its account and its email in the tags GuestMail sent it with, as on SES: one that matches no email
// of that account changes nothing. The endpoint hears of every email the Resend team sends, GuestMail's own and any
// other app's on the same team included, and those carry no such tags.
export async function handleResendEvent(payload, { eventId } = {}) {
	const event = normalizeResendEvent(payload, { eventId });
	if (!event) return { handled: false };
	const result = await handleEmailEvent(event);
	// Resend gets a 200 either way, so an email that can't be matched would otherwise go unseen.
	if (result.handled && event.messageId && !result.messageId) {
		console.warn(`[resend-webhook] ${event.recordAs} for account ${event.accountId}: no message ${event.messageId} with Resend id ${event.providerMessageId ?? "none"}`);
	}
	return result;
}

// Delivery events of every account (/api/webhooks/resend). Checked against the raw bytes before parsing.
// Anything but a 2xx makes Resend retry, for about a day; every handler is safe to replay.
export async function handleResendRequest(request) {
	const secret = process.env.RESEND_WEBHOOK_SECRET;
	if (!secret) return reply(503, { error: "Webhook is not configured" });
	const body = Buffer.from(await request.arrayBuffer());
	if (body.length > MAX_BODY_BYTES) return reply(413, { error: "Body is too large" });
	const eventId = request.headers.get("svix-id");
	const isSigned = verifyResendSignature({
		body,
		id: eventId,
		timestamp: request.headers.get("svix-timestamp"),
		signature: request.headers.get("svix-signature"),
		secret,
	});
	if (!isSigned) return reply(401, { error: "Invalid signature" });

	const payload = parseJson(body.toString("utf8"));
	if (!isPlainObject(payload)) return reply(400, { error: "Expected an event" });
	try {
		const { handled } = await handleResendEvent(payload, { eventId });
		return reply(200, { ok: true, ...(!handled && { ignored: true }) });
	} catch (error) {
		console.error("[resend-webhook] Could not handle the event:", error);
		await sendAlertIfRepeated("resend-webhook", {
			accountId: null,
			key: "webhook-failing:resend-webhook",
			title: "Webhook failing",
			detail: `resend-webhook couldn't handle 3 events within an hour: ${String(error?.message ?? error).slice(0, 300)}.`,
			action: "Resend retries each one for about a day; until then bounces and complaints go uncounted.",
			link: "https://resend.com/webhooks",
		});
		return reply(500, { error: "Could not handle the event" });
	}
}

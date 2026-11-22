import crypto from "node:crypto";
import { isObjectIdString, isPlainObject, normalizeAddress } from "../validation.js";

// Resend signs each delivery through Svix: svix-signature lists signatures, space separated, each "v1," and the base64
// HMAC-SHA256 of "{svix-id}.{svix-timestamp}.{body}", keyed with the bytes the endpoint's secret holds in base64 after
// whsec_. Each retry is signed again, so an old timestamp is a replay.
export const MAX_SIGNATURE_AGE_SECONDS = 300;
const SECRET_PREFIX = "whsec_";

export function verifyResendSignature({ body, id, timestamp, signature, secret, now = Date.now() }) {
	if (typeof secret !== "string" || !secret.startsWith(SECRET_PREFIX)) return false;
	if (typeof id !== "string" || !id || typeof timestamp !== "string" || !/^\d{1,12}$/.test(timestamp) || typeof signature !== "string") return false;
	if (Math.abs(Math.floor(now / 1000) - Number(timestamp)) > MAX_SIGNATURE_AGE_SECONDS) return false;
	const key = Buffer.from(secret.slice(SECRET_PREFIX.length), "base64");
	if (key.length === 0) return false;
	const expected = crypto.createHmac("sha256", key).update(`${id}.${timestamp}.`).update(body).digest();
	return signature.split(" ").some((item) => {
		const [version, value = ""] = item.split(",");
		const given = Buffer.from(version === "v1" ? value : "", "base64");
		return given.length === expected.length && crypto.timingSafeEqual(given, expected);
	});
}

// email.sent, email.opened and email.clicked aren't read: GuestMail counts a send when Resend takes it, and opens and
// clicks with its own pixel and links.
const EVENT_TYPES = {
	"email.delivered": "delivered",
	"email.bounced": "bounce",
	"email.complained": "complaint",
	"email.delivery_delayed": "deferred",
	"email.failed": "dropped",
	"email.suppressed": "dropped",
};

// Resend sends through SES and keeps its words for bounces. These are a hard bounce of an address that doesn't exist:
// NoEmail, or Suppressed, the list of addresses that bounced as invalid. General can be anything.
const UNDELIVERABLE_SUBTYPES = new Set(["NoEmail", "Suppressed"]);

function readText(value) {
	return typeof value === "string" && value.trim() ? value.trim().slice(0, 300) : null;
}

function readId(value) {
	return isObjectIdString(value) ? value.toLowerCase() : null;
}

function toDate(value) {
	const date = typeof value === "string" ? new Date(value) : null;
	return date && Number.isFinite(date.getTime()) ? date : null;
}

// An email's tags as name: value, or as the list of { name, value } it was sent with.
function readTags(tags) {
	if (Array.isArray(tags)) return Object.fromEntries(tags.filter(isPlainObject).map(({ name, value }) => [name, value]));
	return isPlainObject(tags) ? tags : {};
}

function readDetail(data, key) {
	return isPlainObject(data[key]) ? data[key] : {};
}

// Pure: one Resend event in the shape every provider's events take (lib/email-event-rules.js). The account and the
// message come from the tags every send carries. eventId: the delivery's svix-id, the same on each retry.
export function normalizeResendEvent(payload, { eventId = null } = {}) {
	if (!isPlainObject(payload) || !Object.hasOwn(EVENT_TYPES, payload.type)) return null;
	const data = readDetail(payload, "data");
	const tags = readTags(data.tags);
	const emails = [...new Set((Array.isArray(data.to) ? data.to : [data.to]).map(normalizeAddress).filter(Boolean))];
	const event = {
		type: EVENT_TYPES[payload.type],
		recordAs: payload.type,
		accountId: readId(tags.account_id),
		messageId: readId(tags.message_id),
		providerMessageId: readText(data.email_id),
		providerEventId: readText(eventId),
		email: emails[0] ?? null,
		emails,
		occurredAt: toDate(payload.created_at) ?? new Date(),
		data: payload,
	};
	if (payload.type === "email.bounced") {
		const bounce = readDetail(data, "bounce");
		const subType = readText(bounce.subType);
		const isHard = bounce.type === "Permanent";
		Object.assign(event, {
			bounce: isHard ? "hard" : "soft",
			undeliverable: isHard && UNDELIVERABLE_SUBTYPES.has(subType),
			reason: [subType, readText(bounce.message)].filter(Boolean).join(", ") || null,
			detail: `${readText(bounce.type) ?? "Undetermined"}/${subType ?? "General"}`,
		});
	}
	if (payload.type === "email.failed") event.error = `Failed at Resend: ${readText(readDetail(data, "failed").reason) ?? "unknown"}`;
	if (payload.type === "email.suppressed") {
		event.suppressed = true;
		event.error = `Suppressed by Resend: ${readText(readDetail(data, "suppressed").message) ?? "the address is on its suppression list"}`;
	}
	return event;
}

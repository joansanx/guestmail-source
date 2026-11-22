import "server-only";
import { LIMITS, isSendingEnabled } from "@/lib/config";
import { SEND_OUTCOMES, providerError } from "@/lib/email-provider/outcomes";
import * as resend from "@/lib/resend";
import { rootDomain } from "@/lib/root-domain";

// Resend has no tenants: every account sends through the one team, told apart by its domains and its emails' tags.
// GuestMail's own block is all that stops an account, and there's nothing to set up, pause or remove for it.
const TENANT = Object.freeze({ id: "resend" });

function getTenant() {
	return TENANT;
}

async function provisionTenant() {
	return TENANT;
}

async function ensureTenant() {
	return TENANT;
}

async function suspendTenant() {}

async function resumeTenant() {
	return false;
}

function describeTenant() {
	return null;
}

async function removeTenant() {}

// Resend's own DKIM key, and a custom return path so SPF aligns with the domain.
const RETURN_PATH_PREFIX = "send";

function getMailFromDomain(domain) {
	return `${RETURN_PATH_PREFIX}.${domain}`;
}

const RECORD_PURPOSES = { DKIM: "dkim", SPF: "mail-from" };
const STATUSES = { verified: "SUCCESS", pending: "PENDING", not_started: "PENDING", temporary_failure: "TEMPORARY_FAILURE", failed: "FAILED", failure: "FAILED" };
// A step's records are as far along as the least advanced one.
const WORST_FIRST = ["FAILED", "TEMPORARY_FAILURE", "PENDING", "SUCCESS"];

// Resend names a record inside the domain's DNS zone: send.news for news.example.com.
function toRecordName(name, domain) {
	const host = String(name).toLowerCase().replace(/\.$/, "");
	return host === domain || host.endsWith(`.${domain}`) ? host : `${host}.${rootDomain(domain)}`;
}

// An MX record's value leads with its priority, as SES's does; Resend quotes a TXT record's text.
function toRecordValue({ type, value, priority }) {
	return type === "MX" ? `${priority ?? 10} ${value}` : String(value).replace(/^"(.*)"$/, "$1");
}

// A Resend domain in the shape lib/domains.js stores: statuses in the SES words the Domains page already knows, and
// the records to add, without the ones for receiving email. name: the domain, as GuestMail added it.
export function toDomainStatus(domain, name) {
	const records = (Array.isArray(domain.records) ? domain.records : []).filter((record) => Object.hasOwn(RECORD_PURPOSES, record.record) && record.name && record.value);
	const statusOf = (kind) => {
		const statuses = records.filter(({ record }) => record === kind).map(({ status }) => STATUSES[status] ?? "PENDING");
		return WORST_FIRST.find((status) => statuses.includes(status)) ?? "PENDING";
	};
	return {
		verified: domain.status === "verified",
		dkimStatus: statusOf("DKIM"),
		mailFromStatus: statusOf("SPF"),
		records: records.map((record) => ({
			purpose: RECORD_PURPOSES[record.record],
			type: record.type,
			name: toRecordName(record.name, name),
			value: toRecordValue(record),
		})),
	};
}

// Resend only looks at a domain's DNS when asked, and answers later: a domain that isn't verified is asked about
// again each time it's read, and the next read has the answer.
async function startVerification(domainId) {
	try {
		await resend.verifyDomain(domainId);
	} catch (error) {
		console.warn(`[resend] Domain ${domainId} not checked: ${error.message}`);
	}
}

// A name Resend already has isn't taken over: without tenants, whoever got it would send from records someone else
// may have added.
async function addDomain({ domain }) {
	const created = await resend.createDomain({ name: domain, returnPath: RETURN_PATH_PREFIX });
	await startVerification(created.id);
	return { providerDomainId: created.id, status: toDomainStatus(created, domain) };
}

async function readDomain({ domain }) {
	if (!domain.providerDomainId) return { missing: true };
	try {
		const status = toDomainStatus(await resend.getDomain(domain.providerDomainId), domain.domain);
		if (!status.verified) await startVerification(domain.providerDomainId);
		return status;
	} catch (error) {
		if (error.status === 404) return { missing: true };
		return { error: error.message };
	}
}

function removeDomain({ domain }) {
	return domain.providerDomainId ? resend.deleteDomain(domain.providerDomainId) : null;
}

// Resend takes 10 requests a second from the whole team, domain reads and GuestMail's own emails included.
const MAX_SENDS_PER_SECOND = 8;

function getSendLane() {
	return { name: "resend", rate: Math.min(LIMITS.sendRatePerSecond, MAX_SENDS_PER_SECOND) };
}

// Tags come back on every event, so a bounce or complaint says which account and email it's about
// (lib/email-provider/resend-events.js). Resend takes letters, digits, - and _ in them.
function getMessageTags(message) {
	const tags = [
		{ name: "message_id", value: String(message._id) },
		{ name: "account_id", value: String(message.accountId) },
		{ name: "kind", value: message.kind },
	];
	if (message.campaignId) tags.push({ name: "campaign_id", value: String(message.campaignId) });
	return tags;
}

function toResendEmail({ from, to, subject, html, text, replyTo, headers }) {
	return { from, to: [to], subject, ...(html && { html }), text, ...(replyTo && { reply_to: replyTo }), ...(headers && { headers }) };
}

const DAILY_QUOTA_RETRY_SECONDS = 3600;

// What Resend's answer to a send means for GuestMail (./outcomes.js). Every send carries an Idempotency-Key, so one
// that got no answer goes again: a retry replays the first answer.
export function getSendError(error) {
	const { status, providerCode = null } = error;
	const as = (outcome, fields) => providerError(outcome, error.message, { providerCode, ...fields });
	if (!status || status >= 500) return as(SEND_OUTCOMES.unavailable);
	if (status === 429) {
		// A month's quota only frees up with the plan, which an admin changes at Resend.
		if (providerCode === "monthly_quota_exceeded") return as(SEND_OUTCOMES.misconfigured);
		const retryAfter = error.retryAfter ?? (providerCode === "daily_quota_exceeded" ? DAILY_QUOTA_RETRY_SECONDS : null);
		return as(SEND_OUTCOMES.throttled, retryAfter && { retryAfter });
	}
	if (status === 401 || providerCode === "invalid_api_key") return as(SEND_OUTCOMES.misconfigured);
	// Resend's other 403s: the from domain isn't verified, or no domain is, so it only sends to the team's own address.
	if (status === 403) return as(/verif/i.test(error.detail ?? "") ? SEND_OUTCOMES.domainUnverified : SEND_OUTCOMES.misconfigured);
	// The same email is still going out on its first try. The key reused for another email is a 409 too, and fails.
	if (providerCode === "concurrent_idempotent_requests") return as(SEND_OUTCOMES.throttled);
	return as(SEND_OUTCOMES.failed);
}

// Idempotency-Key = the message id: a retry of the same email never sends it twice.
async function sendEmail({ message, email, feedbackId }) {
	if (!isSendingEnabled()) throw new Error("Sending is off (SENDING_ENABLED is not true)");
	const headers = { ...email.headers, ...(feedbackId && { "Feedback-ID": feedbackId }) };
	let sent;
	try {
		sent = await resend.sendEmail({
			idempotencyKey: String(message._id),
			email: { ...toResendEmail({ ...email, headers }), tags: getMessageTags(message) },
		});
	} catch (error) {
		throw getSendError(error);
	}
	return { providerMessageId: sent?.id ?? null };
}

// Every adapter has it, but GuestMail's own emails never come this way: RESEND_API_KEY sends them itself first
// (lib/platform-email.js).
async function sendPlatformEmail(email) {
	await resend.sendEmail({ email: toResendEmail(email) });
}

function isConfigured() {
	try {
		resend.getResendConfig();
		return true;
	} catch {
		return false;
	}
}

export const resendProvider = Object.freeze({
	id: "resend",
	name: "Resend",
	returnPathPrefix: RETURN_PATH_PREFIX,
	isConfigured,
	sendPlatformEmail,
	getTenant,
	provisionTenant,
	ensureTenant,
	suspendTenant,
	resumeTenant,
	describeTenant,
	removeTenant,
	getMailFromDomain,
	addDomain,
	readDomain,
	removeDomain,
	getSendLane,
	sendEmail,
});

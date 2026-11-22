import "server-only";

// Every call to Resend for customers' emails lives in this file, like lib/ses.js holds every AWS call and
// lib/postshiba.js every PostShiba one. Tests answer them with a mocked fetch. Errors keep Resend's error name
// (validation_error, rate_limit_exceeded…) in providerCode, never in code, which the API answers with.
const API_URL = "https://api.resend.com";
const DEFAULT_REGION = "eu-west-1";
const TIMEOUT_MS = 10_000;
// A send waits for Resend to accept the message.
const SEND_TIMEOUT_MS = 20_000;

export function getResendConfig(env = process.env) {
	const apiKey = String(env.RESEND_API_KEY ?? "").trim();
	if (!apiKey) throw new Error("Resend is not configured (RESEND_API_KEY)");
	return { apiKey, region: String(env.RESEND_REGION ?? "").trim() || DEFAULT_REGION };
}

function readRetryAfter(headers) {
	const seconds = Number.parseInt(headers?.get("retry-after") ?? "", 10);
	return Number.isInteger(seconds) && seconds > 0 ? seconds : null;
}

function resendError({ label, status = null, body = null, headers, cause }) {
	const providerCode = typeof body?.name === "string" ? body.name : null;
	const detail = typeof body?.message === "string" ? body.message.slice(0, 200) : "";
	const answer = status ? `${status}${providerCode ? ` ${providerCode}` : ""}` : cause?.name === "TimeoutError" ? "timed out" : "no answer";
	return Object.assign(new Error(`Resend ${label}: ${answer}${detail ? ` (${detail})` : ""}`), {
		name: "ResendError",
		status,
		providerCode,
		detail,
		retryAfter: readRetryAfter(headers),
		cause,
	});
}

async function request(path, { method = "GET", body, headers = {}, timeoutMs = TIMEOUT_MS } = {}) {
	const { apiKey } = getResendConfig();
	const label = `${method} ${path}`;
	let response;
	try {
		response = await fetch(`${API_URL}${path}`, {
			method,
			headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json", ...(body !== undefined && { "Content-Type": "application/json" }), ...headers },
			...(body !== undefined && { body: JSON.stringify(body) }),
			signal: AbortSignal.timeout(timeoutMs),
		});
	} catch (cause) {
		throw resendError({ label, cause });
	}
	const data = await response.json().catch(() => null);
	if (!response.ok) throw resendError({ label, status: response.status, body: data, headers: response.headers });
	return data;
}

const id = encodeURIComponent;

// returnPath: the subdomain bounces come back to, so SPF aligns with the domain.
export function createDomain({ name, returnPath }) {
	return request("/domains", { method: "POST", body: { name, region: getResendConfig().region, custom_return_path: returnPath } });
}

export function getDomain(domainId) {
	return request(`/domains/${id(domainId)}`);
}

// Resend looks at the domain's DNS records after this, on its own time: the answer only says it started.
export function verifyDomain(domainId) {
	return request(`/domains/${id(domainId)}/verify`, { method: "POST" });
}

export async function deleteDomain(domainId) {
	try {
		await request(`/domains/${id(domainId)}`, { method: "DELETE" });
	} catch (error) {
		if (error.status !== 404) throw error;
	}
}

// A retry with the same key and body answers what the first one did, for 24 hours, and never sends twice.
export function sendEmail({ email, idempotencyKey }) {
	return request("/emails", {
		method: "POST",
		body: email,
		timeoutMs: SEND_TIMEOUT_MS,
		...(idempotencyKey && { headers: { "Idempotency-Key": idempotencyKey } }),
	});
}

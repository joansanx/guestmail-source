import "server-only";
import { createHmac } from "node:crypto";

// Shared subdomains' DNS records, and customers' website domains on the app's Vercel project, go through GuestMail's
// DNS helper (dns-broker/), a Vercel project of its own that holds the Vercel token: the app only signs its requests,
// with DNS_BROKER_SECRET. Without DNS_BROKER_URL and DNS_BROKER_SECRET (a self-hosted server, local development) DNS
// automation is off and nothing is published, unless Cloudflare takes the shared subdomains' records (getCloudflare).
function getBroker() {
	const { DNS_BROKER_URL: url, DNS_BROKER_SECRET: secret } = process.env;
	return url && secret ? { url, secret } : null;
}

// helperProblem: the helper itself, not one slug's records or one host. "cap": its daily cap. "down": a secret or Vercel
// token that's wrong or revoked, Vercel failing, a wrong address or no answer. Either way, every new shared address waits.
function getHelperProblem(status) {
	if (status === 429) return "cap";
	return [400, 403, 405, 409, 413].includes(status) ? null : "down";
}

async function callBroker(payload) {
	const broker = getBroker();
	if (!broker) return { skipped: true };
	const body = JSON.stringify(payload);
	const timestamp = String(Math.floor(Date.now() / 1000));
	const signature = createHmac("sha256", broker.secret).update(`${timestamp}.${body}`).digest("hex");
	let response;
	try {
		response = await fetch(broker.url, {
			method: "POST",
			headers: { "content-type": "application/json", "x-mailcheap-timestamp": timestamp, "x-mailcheap-signature": `sha256=${signature}` },
			body,
			signal: AbortSignal.timeout(30_000),
		});
	} catch (error) {
		throw Object.assign(new Error(`The DNS helper didn't answer: ${error.message}`), { helperProblem: "down" });
	}
	const data = await response.json().catch(() => null);
	if (!response.ok) {
		const target = payload.host ?? `${payload.slug}'s records`;
		const message = `The DNS helper refused to ${payload.action} ${target}: ${data?.message ?? data?.error ?? response.status}`;
		throw Object.assign(new Error(message), { status: response.status, helperProblem: getHelperProblem(response.status) });
	}
	return data;
}

// Without the helper, a server whose shared domain has its DNS on Cloudflare writes the shared subdomains' records
// itself, with a token that edits that one zone (CLOUDFLARE_DNS_TOKEN, CLOUDFLARE_ZONE_ID). Website domains on the
// app's Vercel project still need the helper.
const CLOUDFLARE_URL = "https://api.cloudflare.com/client/v4";

function getCloudflare() {
	const { CLOUDFLARE_DNS_TOKEN: token, CLOUDFLARE_ZONE_ID: zone, DNS_BROKER_URL: brokerUrl } = process.env;
	return token && zone && !brokerUrl ? { token, zone } : null;
}

// Cloudflare's 400 and 409 are about one slug's records, like a name that's taken. Anything else is the token, the zone
// or Cloudflare itself, and every new shared address waits.
function getCloudflareProblem(status) {
	if (status === 429) return "cap";
	return status === 400 || status === 409 ? null : "down";
}

// Cloudflare takes an MX record's priority apart from its server, and a TXT record's text in quoted strings of at most
// 255 characters. DNS only: its proxy would hide a CNAME from inboxes. guestmail: except a website's record that points
// at a Cloudflare Tunnel (ARCHIVE_CNAME_TARGET on *.cfargotunnel.com), which only answers through the proxy.
function toCloudflareRecord(slug, { type, name, value }) {
	const isTunnel = type === "CNAME" && /\.cfargotunnel\.com\.?$/i.test(value);
	const record = { type, name, content: value, ttl: 1, proxied: isTunnel, comment: `guestmail:${slug}` };
	const mx = type === "MX" ? /^(\d+)\s+(\S+)$/.exec(value) : null;
	if (mx) Object.assign(record, { priority: Number(mx[1]), content: mx[2] });
	if (type === "TXT" && !value.startsWith('"')) record.content = value.match(/.{1,255}/g).map((part) => `"${part}"`).join(" ");
	return record;
}

async function callCloudflare({ token, zone }, { method, id, record, target }) {
	const url = `${CLOUDFLARE_URL}/zones/${encodeURIComponent(zone)}/dns_records${id ? `/${encodeURIComponent(id)}` : ""}`;
	let response;
	try {
		response = await fetch(url, {
			method,
			headers: { authorization: `Bearer ${token}`, ...(record && { "content-type": "application/json" }) },
			...(record && { body: JSON.stringify(record) }),
			signal: AbortSignal.timeout(30_000),
		});
	} catch (error) {
		throw Object.assign(new Error(`Cloudflare didn't answer: ${error.message}`), { helperProblem: "down" });
	}
	const data = await response.json().catch(() => null);
	if (!response.ok || !data?.success) {
		const message = `Cloudflare refused to ${method === "POST" ? "create" : "delete"} ${target}: ${data?.errors?.[0]?.message ?? response.status}`;
		throw Object.assign(new Error(message), { status: response.status, helperProblem: getCloudflareProblem(response.status) });
	}
	return data.result;
}

// A record that's gone already counts as removed.
async function removeFromCloudflare(cloudflare, slug, ids) {
	for (const id of ids) {
		await callCloudflare(cloudflare, { method: "DELETE", id, target: `${slug}'s records` }).catch((error) => {
			if (error.status !== 404) throw error;
		});
	}
	return { deleted: ids };
}

// All of a slug's records or none, like the helper: the ones made before a failure are taken back.
async function publishToCloudflare(cloudflare, slug, records) {
	const ids = [];
	try {
		for (const record of records) {
			const created = await callCloudflare(cloudflare, { method: "POST", record: toCloudflareRecord(slug, record), target: `${slug}'s ${record.type} ${record.name}` });
			ids.push(created.id);
		}
	} catch (error) {
		await removeFromCloudflare(cloudflare, slug, ids).catch((leftover) => console.error(`[dns] Some of ${slug}'s records (${ids.join(", ")}) stay on Cloudflare: ${leftover.message}`));
		throw error;
	}
	return { ids };
}

// All of a slug's records or none: the helper tags them for the slug and answers their ids in the same order.
export async function publishSharedRecords(slug, records) {
	const cloudflare = getCloudflare();
	if (cloudflare) return publishToCloudflare(cloudflare, slug, records);
	const result = await callBroker({ action: "create", slug, records: records.map(({ type, name, value }) => ({ type, name, value })) });
	return result.skipped ? result : { ids: result.ids };
}

export async function removeSharedRecords(slug, ids = []) {
	if (ids.length === 0) return { deleted: [] };
	const cloudflare = getCloudflare();
	if (cloudflare) return removeFromCloudflare(cloudflare, slug, ids);
	return callBroker({ action: "delete", slug, ids });
}

// A website domain on the app's project: { verified, verification }, where verification lists the TXT records Vercel
// asks for when the domain is verified for another Vercel team. A refusal for a host on another project has status 409.
export async function attachWebsiteHost(host) {
	const result = await callBroker({ action: "attach", host });
	return result.skipped ? result : { verified: Boolean(result.verified), verification: result.verification ?? [] };
}

export async function detachWebsiteHost(host) {
	return callBroker({ action: "detach", host });
}

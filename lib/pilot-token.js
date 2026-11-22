import crypto from "node:crypto";
import { getAppSecret } from "./config.js";
import { isObjectIdString } from "./validation.js";

// guestmail: the link in the autopilot's email to a venue's owner (lib/pilot.js), which opens one proposal of one account
// without signing in: base64url JSON + "." + HMAC, like the other signed links, with a key of its own. It only says
// which proposal: whether it can still be decided is the proposal's own status, so the link works once.
const INFO = "guestmail-pilot-approval-v1";
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{1,300}\.[A-Za-z0-9_-]{43}$/;
export const APPROVAL_LINK_MS = 7 * 24 * 60 * 60 * 1000;

function sign(payload) {
	const key = Buffer.from(crypto.hkdfSync("sha256", getAppSecret(), "", INFO, 32));
	return crypto.createHmac("sha256", key).update(payload).digest("base64url");
}

export function createApprovalToken({ accountId, proposalId }, now = Date.now()) {
	const data = { a: String(accountId), p: String(proposalId), e: Math.floor((now + APPROVAL_LINK_MS) / 1000) };
	if (!isObjectIdString(data.a) || !isObjectIdString(data.p)) throw new Error("Invalid account or proposal");
	const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
	return `${payload}.${sign(payload)}`;
}

// The proposal the link opens, with its account, or null: not ours, changed, or past its week.
export function verifyApprovalToken(token, now = Date.now()) {
	if (typeof token !== "string" || !TOKEN_PATTERN.test(token)) return null;
	const [payload, signature] = token.split(".");
	const expected = Buffer.from(sign(payload));
	const provided = Buffer.from(signature);
	if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) return null;
	try {
		const { a, p, e } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
		if (!isObjectIdString(a) || !isObjectIdString(p) || !Number.isInteger(e) || e * 1000 < now) return null;
		return { accountId: a, proposalId: p };
	} catch {
		return null;
	}
}

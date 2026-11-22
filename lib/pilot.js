import "server-only";
import { scoped } from "@/lib/account-scope";
import { isBlocked, isDeletionPending } from "@/lib/account-state";
import { findOwnerEmail } from "@/lib/accounts";
import { actionError } from "@/lib/actions/errors";
import { withAuthor } from "@/lib/authors";
import { sendTimesPipeline } from "@/lib/campaign-queries";
import { cleanRichHtml } from "@/lib/clean-html";
import { getAppUrl } from "@/lib/config";
import { callAgent, isAgentConfigured, readVenue } from "@/lib/content-agent";
import { getReviewInput, hashReviewInput, reviewDraft } from "@/lib/content-review";
import { connectDb } from "@/lib/db";
import { markdownToHtml } from "@/lib/markdown";
import { notify } from "@/lib/notifications";
import { cleanSections, findDraftProblems, getCycleStart, listItems, pickCandidates, plain, toCycleKey } from "@/lib/pilot-rules";
import { APPROVAL_LINK_MS, createApprovalToken, verifyApprovalToken } from "@/lib/pilot-token";
import { canSendPlatformEmail, sendPlatformEmail } from "@/lib/platform-email";
import { getAccountPlan } from "@/lib/plans";
import { escapeHtml } from "@/lib/render-email";
import { getScheduleSuggestions } from "@/lib/schedule";
import { isObjectIdString } from "@/lib/validation";
import Account from "@/models/Account";
import Campaign from "@/models/Campaign";
import Newsletter from "@/models/Newsletter";
import PilotProposal from "@/models/PilotProposal";
import Segment from "@/models/Segment";

// guestmail: the autopilot. A venue's owner gives it the menu (a restaurant's dishes, or what a hotel offers), corrects
// what the agent read and confirms it. Then, on the owner's rhythm, it prepares one campaign per cycle from that menu and
// emails it whole to the owner with a link. The link shows the draft, and only the button on that page schedules it:
// nothing is ever sent, or scheduled, without the owner's yes. The writing happens in the agent service
// (lib/content-agent.js); what it may say is decided here, in code (lib/pilot-rules.js).
export const PILOT_PATH = "/agent";
export const APPROVE_PATH = "/approve";
// A cycle's draft is tried this many times, an hour apart: an agent that's down for a while costs no proposal, and one
// that keeps failing costs no more than this.
const MAX_ATTEMPTS = 3;
export const RETRY_AFTER_MS = 60 * 60_000;
// Proposals in a row without an answer before it stops by itself: nobody gets a campaign to approve forever.
export const MAX_MISSED = 3;
const SHOWN_STATUSES = ["proposed", "approved", "rejected", "expired"];
const NEWSLETTER_FIELDS = { accountId: 1, name: 1, postalAddress: 1, venue: 1, agent: 1, pilot: 1 };

// Loaded when it runs, never with this module: the registry runAction reads holds this module's own actions
// (lib/actions/pilot.js), and a static import would make that a circle.
async function runAction(name, options) {
	const runner = await import("@/lib/actions/run-action");
	return runner.runAction(name, options);
}

function cleanText(value, max) {
	return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

// ─── The menu ─────────────────────────────────────────────────────────────────

// Reads the menu from a page or a PDF online (url), or from an uploaded PDF (base64), through the agent service, which
// keeps no file: only the table comes back. It replaces the menu there was, unconfirmed again.
export async function readMenu(newsletter, { url, base64, fileName }) {
	const answer = await callAgent("/menu", {
		venue: { name: newsletter.name, kind: newsletter.venue?.kind ?? null },
		language: newsletter.agent?.language ?? "en",
		...(base64 ? { pdf: base64, fileName } : { url }),
	});
	const sections = cleanSections(answer.sections);
	if (sections.length === 0) throw Object.assign(new Error("Nothing was found in it"), { status: 422 });
	const menu = { source: base64 ? "pdf" : "url", ...(base64 ? { fileName: cleanText(fileName, 120) } : { url }), readAt: new Date(), sections };
	await Newsletter.updateOne(scoped(newsletter.accountId, { _id: newsletter._id }), { $set: { "pilot.menu": menu } });
	return menu;
}

// ─── The round ────────────────────────────────────────────────────────────────

// The owner's email, in the venue's language (its content agent's), like the page its link opens.
const NOTICE = {
	en: {
		title: "A campaign is ready for your approval",
		body: (subject) => `“${subject}” was written from your menu. Nothing is sent until you approve it.`,
		never: "Nothing is sent until you approve it.",
		subject: "Subject",
		preview: "Preview",
		link: (days) => `Read it and approve it, or say no, here (the link works for ${days} days):`,
		button: "Review and approve",
		foot: (days, name) => `The link works for ${days} days. GuestMail's autopilot for ${name}`,
	},
	es: {
		title: "Hay una campaña lista para que la apruebes",
		body: (subject) => `«${subject}» está escrita a partir de tu carta. No se envía nada hasta que la apruebes.`,
		never: "No se envía nada hasta que la apruebes.",
		subject: "Asunto",
		preview: "Vista previa",
		link: (days) => `Léela y apruébala, o di que no, aquí (el enlace funciona ${days} días):`,
		button: "Revisar y aprobar",
		foot: (days, name) => `El enlace funciona ${days} días. Piloto automático de GuestMail para ${name}`,
	},
};

// The whole draft and one link: the link's page has the only button that schedules it (app/approve).
async function tellOwner(newsletter, proposal, draft, now) {
	const copy = NOTICE[newsletter.agent?.language] ?? NOTICE.en;
	await notify({ accountId: newsletter.accountId, key: `pilot-proposal:${proposal._id}`, kind: "pilot-proposal", title: NOTICE.en.title, body: NOTICE.en.body(draft.subject), path: PILOT_PATH });
	if (!canSendPlatformEmail()) return;
	const to = await findOwnerEmail(newsletter.accountId);
	if (!to) return;
	const url = `${getAppUrl()}${APPROVE_PATH}?token=${createApprovalToken({ accountId: newsletter.accountId, proposalId: proposal._id }, now.getTime())}`;
	const days = Math.round(APPROVAL_LINK_MS / 86_400_000);
	const text = [
		`${copy.title}.`,
		"",
		`${copy.subject}: ${draft.subject}`,
		...(draft.previewText ? [`${copy.preview}: ${draft.previewText}`] : []),
		"",
		draft.markdown,
		"",
		copy.link(days),
		url,
		"",
		copy.never,
		copy.foot(days, newsletter.name),
	].join("\n");
	const label = (value) => `<p style="margin:0;font-size:13px;color:#71717a">${escapeHtml(value)}</p>`;
	const button = `<p style="margin:24px 0"><a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#18181b;color:#ffffff;font-weight:600;text-decoration:none">${escapeHtml(copy.button)}</a></p>`;
	const html = [
		`<div style="max-width:600px;margin:0 auto;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;line-height:1.6;color:#18181b">`,
		`<p style="margin:0">${escapeHtml(copy.title)}. ${escapeHtml(copy.never)}</p>`,
		button,
		label(copy.subject),
		`<p style="margin:0 0 12px;font-weight:600">${escapeHtml(draft.subject)}</p>`,
		...(draft.previewText ? [label(copy.preview), `<p style="margin:0 0 12px">${escapeHtml(draft.previewText)}</p>`] : []),
		`<div style="margin:16px 0;padding:16px 20px;border:1px solid #e4e4e7;border-radius:12px">${cleanRichHtml(markdownToHtml(draft.markdown))}</div>`,
		button,
		label(copy.foot(days, newsletter.name)),
		"</div>",
	].join("");
	await sendPlatformEmail({ to, subject: `${copy.title} · ${newsletter.name}`, text, html }).catch((error) => console.error(`[pilot] Couldn't email the owner: ${error.message}`));
}

// The check a send runs (lib/content-review.js), run now on the draft as saved and kept for its send, which uses it
// again. true: it would hold these very words. A check that's off or couldn't run says nothing here: the send's own
// decides then, as for any campaign.
async function isHeldByContentCheck(account, campaignId) {
	const campaign = await Campaign.findOne(scoped(account, { _id: campaignId })).lean();
	const newsletter = campaign && (await Newsletter.findOne(scoped(account, { _id: campaign.newsletterId })).lean());
	if (!newsletter) return false;
	const authored = await withAuthor(campaign);
	await reviewDraft({ account, campaign: authored, newsletter });
	const hash = hashReviewInput(getReviewInput({ campaign: authored, newsletter }));
	const checked = await Campaign.findOne(scoped(account, { _id: campaignId })).select("+review +draftReview").lean();
	return [checked?.draftReview, checked?.review].some((review) => review?.hash === hash && review.outcome === "block" && review.decision !== "approved");
}

// One draft for a claimed proposal: the writer chooses among what the menu still has to show, and the fact gate, then
// the content check, decide whether the owner ever sees it. A draft that doesn't pass is dropped with its reason, and
// a later run tries again, MAX_ATTEMPTS times in all.
async function writeProposal(newsletter, account, proposal, now) {
	const drop = async (reason, { isFinal = false } = {}) => {
		const isLast = isFinal || proposal.attempts >= MAX_ATTEMPTS;
		console.info(`[pilot] ${newsletter._id}: draft dropped (${isLast ? "no proposal this cycle" : "one more try"}): ${reason}`);
		await PilotProposal.updateOne(scoped(account, { _id: proposal._id }), {
			$set: { status: isLast ? "discarded" : "writing" },
			$push: { notes: { $each: [cleanText(reason, 300)], $slice: -6 } },
		});
		return { step: "dropped", reason, ...(isLast && { discarded: true }) };
	};

	const past = await PilotProposal.find(scoped(account, { newsletterId: newsletter._id, status: { $in: SHOWN_STATUSES } }))
		.sort({ createdAt: -1 })
		.limit(200)
		.select({ items: 1, subject: 1 })
		.lean();
	const candidates = pickCandidates(newsletter.pilot.menu.sections, past.map(({ items }) => items ?? []));
	const venue = await readVenue(newsletter);
	let answer;
	try {
		answer = await callAgent("/campaign", {
			venue,
			brief: newsletter.agent?.brief ?? "",
			language: newsletter.agent?.language ?? "en",
			candidates,
			month: now.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }),
			recent: past.map(({ subject }) => subject).filter(Boolean).slice(0, 12),
		});
	} catch (error) {
		return drop(error.message);
	}

	const draft = { subject: cleanText(answer.subject, 200), previewText: cleanText(answer.previewText, 200), markdown: String(answer.markdown ?? "").trim().slice(0, 20_000) };
	const featured = (Array.isArray(answer.featured) ? answer.featured : []).map(String);
	const problems = [
		...(draft.subject && draft.markdown ? [] : ["It has no subject or no text"]),
		...findDraftProblems(draft, { featured, candidates, venueText: `${newsletter.name} ${venue.name ?? ""} ${venue.address ?? ""}` }),
	];
	if (problems.length > 0) return drop(problems.join(". "));

	let campaign;
	try {
		campaign = await runAction("create_campaign", {
			account,
			via: "api",
			input: {
				newsletter: String(newsletter._id),
				subject: draft.subject,
				previewText: draft.previewText,
				format: "markdown",
				content: draft.markdown,
				...(newsletter.pilot.segmentId && { segment: String(newsletter.pilot.segmentId) }),
			},
		});
	} catch (error) {
		return drop(`The draft couldn't be saved: ${error.message}`, { isFinal: true });
	}

	// A draft the content check would hold never reaches the owner.
	if (await isHeldByContentCheck(account, campaign.id)) return drop("The content check held the draft", { isFinal: true });

	const names = new Map(candidates.map(({ name }) => [plain(name), name]));
	const { modifiedCount } = await PilotProposal.updateOne(scoped(account, { _id: proposal._id, status: "writing" }), {
		$set: { status: "proposed", campaignId: campaign.id, subject: draft.subject, items: [...new Set(featured.map((name) => names.get(plain(name))))] },
		$unset: { claimedAt: 1 },
	});
	if (!modifiedCount) return { step: "waiting" };
	await tellOwner(newsletter, proposal, draft, now);
	return { step: "proposed", proposal: String(proposal._id), campaign: campaign.id };
}

// One step for one newsletter: when the cycle its owner's rhythm is in has no proposal yet, write it. One proposal per
// cycle, whoever runs this and however often: the cycle's key is unique for the newsletter, and each try is claimed
// (claimedAt, when the last one started).
export async function runPilotStep(newsletter, { now = new Date() } = {}) {
	const pilot = newsletter.pilot ?? {};
	const start = getCycleStart(pilot, now);
	if (!start) return { step: "no-rhythm" };
	if (!pilot.menu?.confirmedAt || listItems(pilot.menu.sections).length === 0) return { step: "no-menu" };
	const account = await Account.findById(newsletter.accountId).lean();
	if (!account || !getAccountPlan(account)) return { step: "no-plan" };
	if (isBlocked(account) || isDeletionPending(account)) return { step: "blocked" };

	const filter = (extra) => scoped(account, { newsletterId: newsletter._id, ...extra });
	const cycleKey = toCycleKey(start);
	let proposal = await PilotProposal.findOne(filter({ $or: [{ cycleKey }, { createdAt: { $gte: start } }] })).sort({ createdAt: -1 }).lean();
	if (!proposal) {
		// The last cycle's proposal got no answer: its link stops working, and after a few in a row the autopilot stops too.
		// One still being written when its cycle ended is dropped. Never this cycle's own, which another run may have
		// just started.
		const earlier = { cycleKey: { $ne: cycleKey } };
		await PilotProposal.updateMany(filter({ ...earlier, status: "writing" }), { $set: { status: "discarded" }, $push: { notes: "Its cycle ended before a draft was ready" } });
		const { modifiedCount } = await PilotProposal.updateMany(filter({ ...earlier, status: "proposed" }), { $set: { status: "expired" } });
		const missed = modifiedCount ? (pilot.missed ?? 0) + 1 : (pilot.missed ?? 0);
		if (modifiedCount) await Newsletter.updateOne(scoped(account, { _id: newsletter._id }), { $set: { "pilot.missed": missed, ...(missed >= MAX_MISSED && { "pilot.enabled": false }) } });
		if (modifiedCount && missed >= MAX_MISSED) {
			await notify({ accountId: account._id, key: `pilot-paused:${newsletter._id}`, kind: "pilot-paused", title: "The autopilot stopped", body: `${MAX_MISSED} campaigns in a row waited for your approval and got none. Turn it back on when you want the next one.`, path: PILOT_PATH });
			return { step: "paused" };
		}
		try {
			proposal = (await PilotProposal.create({ accountId: account._id, newsletterId: newsletter._id, cycleKey })).toObject();
		} catch (error) {
			if (error?.code === 11000) return { step: "waiting" };
			throw error;
		}
	}
	if (proposal.status !== "writing") return { step: "idle" };
	const claimed = await PilotProposal.findOneAndUpdate(
		filter({ _id: proposal._id, status: "writing", $or: [{ claimedAt: null }, { claimedAt: { $lt: new Date(now.getTime() - RETRY_AFTER_MS) } }] }),
		{ $set: { claimedAt: now }, $inc: { attempts: 1 } },
		{ returnDocument: "after" }
	).lean();
	return claimed ? writeProposal(newsletter, account, claimed, now) : { step: "waiting" };
}

// ponytail: newsletters one after another in one run, like the content agent's round; a queue once there are dozens.
export async function runPilotRound({ now = new Date() } = {}) {
	if (!isAgentConfigured()) return { off: true };
	await connectDb();
	const newsletters = await Newsletter.find({ "pilot.enabled": true }, null, { crossAccount: true }).select(NEWSLETTER_FIELDS).lean();
	const results = [];
	for (const newsletter of newsletters) {
		try {
			results.push({ newsletter: String(newsletter._id), ...(await runPilotStep(newsletter, { now })) });
		} catch (error) {
			console.error(`[pilot] ${newsletter._id}: ${error.message}`);
			results.push({ newsletter: String(newsletter._id), error: error.message });
		}
	}
	return { newsletters: newsletters.length, results };
}

// ─── The owner's answer ───────────────────────────────────────────────────────

// When an approved campaign goes out: the weekday and time the newsletter's last issue went, the next time they come
// around, as the campaign's own send step suggests. A newsletter that never sent: tomorrow morning.
// ponytail: 9:00 UTC, a newsletter has no time zone yet.
export async function pickSendTime(account, proposal, now = new Date()) {
	const rows = await Campaign.aggregate(sendTimesPipeline({ accountId: scoped(account).accountId, newsletterId: proposal.newsletterId, excludeId: proposal.campaignId }));
	const suggestions = getScheduleSuggestions({ history: rows.map(({ at }) => at), taken: rows.filter(({ status }) => status === "scheduled").map(({ at }) => at), now: now.getTime() });
	return suggestions.find(({ isLastIssue }) => isLastIssue)?.at ?? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 9));
}

// The owner's yes or no to a proposal, once: only one that waits can be decided, and the first answer stands. A yes
// schedules its campaign through schedule_campaign, with every check a schedule has (the plan, the sender, the content
// check again when it goes out). If that refuses, the proposal waits again and the reason goes back to the owner.
// via: where the answer came from. newsletterId: only a proposal of this newsletter, for a team's member.
export async function decideProposal({ account, proposalId, newsletterId = null, decision, via, now = new Date() }) {
	if (!isObjectIdString(String(proposalId ?? ""))) throw actionError("not_found", "No proposal has this ID");
	const filter = scoped(account, { _id: proposalId, ...(newsletterId && { newsletterId }) });
	const proposal = await PilotProposal.findOneAndUpdate({ ...filter, status: "proposed" }, { $set: { status: decision, decidedAt: now, decidedVia: via } }, { returnDocument: "after" }).lean();
	if (!proposal) {
		if (!(await PilotProposal.exists(filter))) throw actionError("not_found", "No proposal has this ID");
		throw Object.assign(actionError("conflict", "This proposal was already decided"), { isDecided: true });
	}
	await Newsletter.updateOne(scoped(account, { _id: proposal.newsletterId }), { $unset: { "pilot.missed": 1 } });
	if (decision === "rejected") return proposal;

	try {
		// The owner may have changed the draft since it was proposed: it's read again before it's scheduled.
		if (await isHeldByContentCheck(account, proposal.campaignId)) throw actionError("conflict", "The content check holds this draft: change it, or ask support to look at it");
		const at = await pickSendTime(account, proposal, now);
		await runAction("schedule_campaign", { account, via: via === "link" ? "api" : via, input: { id: String(proposal.campaignId), scheduledAt: at.toISOString() } });
		return await PilotProposal.findOneAndUpdate(filter, { $set: { scheduledAt: at } }, { returnDocument: "after" }).lean();
	} catch (error) {
		await PilotProposal.updateOne({ ...filter, status: "approved" }, { $set: { status: "proposed" }, $unset: { decidedAt: 1, decidedVia: 1 } });
		throw error;
	}
}

// What an approval link opens: its account and its proposal, or null for a link that isn't ours, is older than its
// week, or whose proposal is gone. Reading it changes nothing.
export async function openApprovalLink(token, { now = Date.now() } = {}) {
	const reference = verifyApprovalToken(token, now);
	if (!reference) return null;
	await connectDb();
	const account = await Account.findById(reference.accountId).lean();
	const proposal = account && (await PilotProposal.findOne(scoped(account, { _id: reference.proposalId })).lean());
	return proposal?.campaignId ? { account, proposal } : null;
}

// What the link's page shows, for a GET that decides nothing: the draft as a reader gets it, who it goes to and when
// it would go out. html is null when the draft can't be rendered, like an account without a plan anymore.
export async function viewApprovalLink(token) {
	const link = await openApprovalLink(token);
	if (!link) return null;
	const { account, proposal } = link;
	const [newsletter, campaign] = await Promise.all([
		Newsletter.findOne(scoped(account, { _id: proposal.newsletterId })).select({ name: 1, agent: 1 }).lean(),
		Campaign.findOne(scoped(account, { _id: proposal.campaignId })).select({ subject: 1, previewText: 1, segmentId: 1 }).lean(),
	]);
	if (!newsletter || !campaign) return null;
	const isWaiting = proposal.status === "proposed";
	const [preview, segment, sendAt] = await Promise.all([
		isWaiting ? runAction("preview_campaign", { account, via: "api", input: { id: String(campaign._id) } }).catch(() => null) : null,
		campaign.segmentId ? Segment.findOne(scoped(account, { _id: campaign.segmentId })).select({ name: 1 }).lean() : null,
		isWaiting ? pickSendTime(account, proposal) : null,
	]);
	return {
		status: proposal.status,
		language: newsletter.agent?.language === "es" ? "es" : "en",
		newsletterName: newsletter.name,
		subject: campaign.subject,
		previewText: campaign.previewText ?? "",
		html: preview?.html ?? null,
		segmentName: segment?.name ?? null,
		sendAt: sendAt?.toISOString() ?? null,
		scheduledAt: proposal.scheduledAt?.toISOString() ?? null,
	};
}

// The link's answer: the same decision as the dashboard's and the API's, for the one proposal the link names.
export async function decideByLink(token, decision, { now = new Date() } = {}) {
	const link = await openApprovalLink(token, { now: now.getTime() });
	if (!link) throw actionError("not_found", "This link doesn't work anymore");
	return decideProposal({ account: link.account, proposalId: link.proposal._id, decision, via: "link", now });
}

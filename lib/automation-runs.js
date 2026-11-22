import "server-only";
import { getFirstStep, getNextStep, getWaitMs } from "@/lib/automation-rules";
import { findPlaceholder } from "@/lib/automations";
import { getAppUrl } from "@/lib/config";
import { connectDb } from "@/lib/db";
import { compileSegment } from "@/lib/segments";
import { publishJob, queueCampaign, sendToMoreContacts } from "@/lib/sending";
import { isObjectIdString } from "@/lib/validation";
import Automation from "@/models/Automation";
import AutomationRun from "@/models/AutomationRun";
import Campaign from "@/models/Campaign";
import Contact from "@/models/Contact";
import Message from "@/models/Message";
import Segment from "@/models/Segment";

// guestmail: automations on the move. An event (someone joins, gets a tag, clicks an issue's link, books, or is added by
// hand) puts people on an automation's path, once per automation ever, and a job walks them along it within the minute:
// past waits that are over and conditions, to the next email. Each email step is a campaign of its own, sent with the
// campaign engine (lib/sending.js) to the people its step holds now (lib/segment-queries.js findCampaignSegmentFilter):
// its plan limit, content check, suppressions and one email per contact come with it. The hourly run picks up the
// waits that ended and anything a job couldn't finish.
const JOB_PATH = "/api/jobs/run-automation";
// A job's work: this many people at a time, this many rounds of walking and sending.
const BATCH = 500;
const ROUNDS = 5;
// An email step that couldn't go out (its campaign busy sending, paused, or failing) tries again after this.
const RETRY_SECONDS = 120;
const QUIET_CODES = new Set(["no_recipients"]);
// The triggers each event starts. Joining starts the tag automations too, for the tags someone joins with.
const TRIGGERS = { join: ["join", "tag"], tag: ["tag"], click: ["click"], booking: ["booking"] };
// Why someone left a path, by the status that took them off it.
const LEFT_REASONS = {
	unsubscribed: "They unsubscribed",
	bounced: "Their address bounced",
	complained: "They marked an email as spam",
	dormant: "They went dormant",
	pending: "They haven't confirmed",
};

// The automations that start this way take these contacts in. contacts: { _id, newsletterId, tags }, their tags as they
// were before (tags: the ones they just got). campaignId: the issue clicked. Never throws: a signup, a click or a booking
// goes on whatever happens here.
export async function startAutomations({ accountId, event, contacts, tags = [], campaignId = null }) {
	try {
		if (!contacts?.length || !TRIGGERS[event]) return;
		await connectDb();
		const newsletterIds = [...new Set(contacts.map(({ newsletterId }) => String(newsletterId)))];
		const automations = await Automation.find({ accountId, newsletterId: { $in: newsletterIds }, enabled: true, "trigger.type": { $in: TRIGGERS[event] } })
			.select({ accountId: 1, newsletterId: 1, trigger: 1, steps: 1 })
			.lean();
		for (const automation of automations) {
			const picked = contacts.filter(
				(contact) => String(contact.newsletterId) === String(automation.newsletterId) && isStartedBy(automation.trigger, { event, contact, tags, campaignId })
			);
			if (picked.length > 0) await enter(automation, picked.map(({ _id }) => _id));
		}
	} catch (error) {
		console.error(`[automations] ${event} not handled: ${error.message}`);
	}
}

function isStartedBy(trigger, { event, contact, tags, campaignId }) {
	if (trigger.type === "tag") {
		const got = event === "join" ? (contact.tags ?? []) : tags.filter((tag) => !contact.tags?.includes(tag));
		return got.includes(trigger.tag);
	}
	if (trigger.type === "click") return String(trigger.campaignId) === String(campaignId);
	return trigger.type === event;
}

// Someone added by hand (add_contact_to_automation): whether they're on its path now.
export async function addToAutomation(automation, contactId) {
	return (await enter(automation, [contactId])) > 0;
}

// The contacts still active go on the path from its first step; anyone who was ever on it stays out. How many went on.
async function enter(automation, contactIds, now = new Date()) {
	const { accountId, newsletterId } = automation;
	const contacts = await Contact.find({ accountId, newsletterId, _id: { $in: contactIds }, status: "active" }).select({ _id: 1 }).lean();
	if (contacts.length === 0) return 0;
	const first = getFirstStep(automation.steps);
	const start = first ? { status: "active", stepId: first.id, stepAt: now, nextAt: now } : { status: "done", finishedAt: now };
	let entered = 0;
	try {
		const result = await AutomationRun.bulkWrite(
			contacts.map(({ _id }) => ({
				updateOne: {
					filter: { accountId, automationId: automation._id, contactId: _id },
					update: { $setOnInsert: { newsletterId, ...start } },
					upsert: true,
				},
			})),
			{ ordered: false }
		);
		entered = result.upsertedCount;
	} catch (error) {
		// Two events at once for the same person: one puts them on, the other finds them there.
		const codes = (error?.writeErrors ?? []).map((writeError) => writeError.code ?? writeError.err?.code);
		if (codes.length === 0 || codes.some((code) => code !== 11000)) throw error;
		entered = error.result?.upsertedCount ?? 0;
	}
	if (entered > 0 && first) await wakeAutomation(automation);
	return entered;
}

// A job for the automation, now or as a retry later. Without QStash (development) the hourly run does it.
export async function wakeAutomation(automation, delaySeconds = 0) {
	try {
		await publishJob({
			url: `${getAppUrl()}${JOB_PATH}`,
			body: { accountId: String(automation.accountId), automationId: String(automation._id), ...(delaySeconds > 0 && { retry: true }) },
			flowControl: { key: `automation-${automation._id}`, parallelism: 1 },
			...(delaySeconds > 0 && { notBefore: Math.floor(Date.now() / 1000) + delaySeconds }),
		});
	} catch (error) {
		console.error(`[automations] No job for automation ${automation._id}, the hourly run takes it: ${error.message}`);
	}
}

// An automation that's on walks the people it has due, then sends the emails they reached, and walks again, a few
// rounds. An email that couldn't go out waits RETRY_SECONDS, and one retry job follows (isRetry: this is it).
export async function processAutomation({ accountId, automationId, isRetry = false }) {
	if (!isObjectIdString(String(accountId)) || !isObjectIdString(String(automationId))) return { skipped: "invalid job" };
	await connectDb();
	const automation = await Automation.findOne({ accountId, _id: automationId }).lean();
	if (!automation) return { skipped: "automation not found" };
	if (!automation.enabled) return { skipped: "automation is off" };
	const result = { walked: 0, sent: 0, waiting: 0 };
	for (let round = 0; round < ROUNDS; round++) {
		const now = new Date();
		const runs = await AutomationRun.find({ accountId: automation.accountId, automationId: automation._id, status: "active", nextAt: { $lte: now } })
			.sort({ nextAt: 1 })
			.limit(BATCH)
			.lean();
		if (runs.length === 0) break;
		const contacts = await Contact.find({ accountId: automation.accountId, _id: { $in: runs.map(({ contactId }) => contactId) } })
			.select({ status: 1, tags: 1 })
			.lean();
		const byId = new Map(contacts.map((contact) => [String(contact._id), contact]));
		const atEmail = new Set();
		for (const run of runs) {
			const stepId = await walk(automation, run, byId.get(String(run.contactId)), now);
			if (stepId) atEmail.add(stepId);
		}
		result.walked += runs.length;
		let sent = 0;
		for (const stepId of atEmail) {
			const outcome = await sendStep(automation, stepId, now);
			if (outcome === "sent") sent += 1;
			else if (outcome !== "none") result.waiting += 1;
		}
		result.sent += sent;
		if (sent === 0) break;
	}
	if (result.waiting > 0 && !isRetry) await wakeAutomation(automation, RETRY_SECONDS);
	return result;
}

// Every hour (app/api/cron/hourly): the automations that are on with someone due, a wait that ended or an email that
// couldn't go out before.
export async function runDueAutomations(now = new Date()) {
	await connectDb();
	const automations = await Automation.find({ enabled: true }).setOptions({ crossAccount: true }).select({ accountId: 1 }).lean();
	const result = { processed: 0, failed: 0 };
	for (const { _id, accountId } of automations) {
		if (!(await AutomationRun.exists({ accountId, automationId: _id, status: "active", nextAt: { $lte: now } }))) continue;
		try {
			await processAutomation({ accountId, automationId: _id, isRetry: true });
			result.processed += 1;
		} catch (error) {
			result.failed += 1;
			console.error(`[automations] Automation ${_id} not run: ${error.message}`);
		}
	}
	return result;
}

// One person as far along the path as they go now. Stops at a wait that isn't over, or at an email they haven't got:
// that step's id, for the send that follows.
async function walk(automation, run, contact, now) {
	let current = run;
	for (let moves = 0; moves <= automation.steps.length; moves++) {
		const step = automation.steps.find(({ id }) => id === current.stepId);
		if (!step) return void (await leave(current, "Its step was removed", now));
		if (contact?.status !== "active") return void (await leave(current, contact ? (LEFT_REASONS[contact.status] ?? "They stopped getting emails") : "They were deleted", now));
		let branch = null;
		if (step.type === "wait") {
			const due = new Date(new Date(current.stepAt).getTime() + getWaitMs(step));
			if (due > now) {
				await AutomationRun.updateOne({ accountId: current.accountId, _id: current._id, stepId: step.id }, { $set: { nextAt: due } });
				return null;
			}
		} else if (step.type === "email") {
			const got = step.campaignId && (await Message.exists({ accountId: current.accountId, campaignId: step.campaignId, contactId: current.contactId }));
			if (!got) return step.id;
		} else {
			branch = (await meetsCondition(automation, step, current, contact)) ? "yes" : "no";
		}
		current = await advance(current, step, branch, automation.steps, now);
		if (!current) return null;
	}
	return null;
}

// Past a step, down a branch for a condition: the run where it is now, or null once its path ended or another run of
// the job moved it first.
async function advance(run, step, branch, steps, now) {
	const next = getNextStep(steps, step.id, branch);
	const moved = await AutomationRun.findOneAndUpdate(
		{ accountId: run.accountId, _id: run._id, status: "active", stepId: step.id },
		{
			...(next ? { $set: { stepId: next.id, stepAt: now, nextAt: now } } : { $set: { status: "done", finishedAt: now }, $unset: { stepId: 1, nextAt: 1 } }),
			$push: { history: { stepId: step.id, ...(branch && { branch }), at: now } },
		},
		{ returnDocument: "after" }
	).lean();
	return moved?.status === "active" ? moved : null;
}

function leave(run, reason, now) {
	return AutomationRun.updateOne(
		{ accountId: run.accountId, _id: run._id, status: "active" },
		{ $set: { status: "left", reason, finishedAt: now }, $unset: { nextAt: 1 } }
	);
}

// opened and clicked look at an email before the condition on its path: a click counts as an open.
async function meetsCondition(automation, step, run, contact) {
	const { accountId } = run;
	if (step.check === "tag") return Boolean(contact.tags?.includes(step.tag));
	if (step.check === "segment") {
		const segment = step.segmentId && (await Segment.findOne({ accountId, _id: step.segmentId, deletedAt: null }).select({ match: 1, conditions: 1 }).lean());
		return Boolean(segment && (await Contact.exists({ accountId, _id: run.contactId, $and: [compileSegment(segment)] })));
	}
	const email = automation.steps.find(({ id }) => id === step.email);
	if (!email?.campaignId) return false;
	const engaged = step.check === "clicked" ? { clickedAt: { $ne: null } } : { $or: [{ openedAt: { $ne: null } }, { clickedAt: { $ne: null } }] };
	return Boolean(await Message.exists({ accountId, campaignId: email.campaignId, contactId: run.contactId, ...engaged }));
}

// An email step's campaign out to the people its step holds: "sent", or the reason it waits ("busy" while a send of it
// is going out, "held" while it's paused, "problem" when it can't go, kept on the automation for its page).
async function sendStep(automation, stepId, now) {
	const step = automation.steps.find(({ id }) => id === stepId);
	const { accountId } = automation;
	const campaign = step?.campaignId && (await Campaign.findOne({ accountId, _id: step.campaignId }).select({ status: 1, subject: 1, previewText: 1, markdown: 1, html: 1 }).lean());
	let outcome;
	let problem = null;
	const placeholder = campaign && findPlaceholder([campaign.subject, campaign.previewText, campaign.markdown || campaign.html].join("\n"));
	if (!campaign) problem = "One of its emails was deleted: remove its step";
	else if (placeholder) problem = `Fill in ${placeholder} in "${campaign.subject || "Untitled"}"`;
	else if (campaign.status === "sending") outcome = "busy";
	else if (!["draft", "sent"].includes(campaign.status)) outcome = "held";
	else {
		try {
			await (campaign.status === "draft" ? queueCampaign : sendToMoreContacts)({ accountId, campaignId: campaign._id });
			outcome = "sent";
		} catch (error) {
			if (QUIET_CODES.has(error.code)) outcome = "none";
			else problem = String(error.message).slice(0, 300);
		}
	}
	if (problem) outcome = "problem";
	await Automation.updateOne({ accountId, _id: automation._id }, problem ? { $set: { problem } } : { $unset: { problem: 1 } });
	if (outcome !== "sent") {
		await AutomationRun.updateMany(
			{ accountId, automationId: automation._id, status: "active", stepId },
			{ $set: { nextAt: new Date(now.getTime() + RETRY_SECONDS * 1000) } }
		);
	}
	return outcome;
}

// Where each person is: on an email of the path ("email 2"), past one ("after email 2"), finished or left.
export function describeRun(run, steps) {
	if (run.status === "done") return "finished";
	if (run.status === "left") return "left";
	const emails = (run.history ?? []).filter(({ stepId }) => steps.find(({ id }) => id === stepId)?.type === "email").length;
	const step = steps.find(({ id }) => id === run.stepId);
	if (step?.type === "email") return `email ${emails + 1}`;
	return emails > 0 ? `after email ${emails}` : "starting";
}

// A contact's page: the automations they're on or went through, and the ones that are on that they could be added to.
export async function listContactAutomations(account, contact) {
	const [runs, automations] = await Promise.all([
		AutomationRun.find({ accountId: account._id, contactId: contact._id }).sort({ createdAt: -1 }).limit(20).lean(),
		Automation.find({ accountId: account._id, newsletterId: contact.newsletterId }).select({ name: 1, enabled: 1, steps: 1 }).sort({ createdAt: -1 }).limit(100).lean(),
	]);
	const byId = new Map(automations.map((automation) => [String(automation._id), automation]));
	const on = runs.filter(({ automationId }) => byId.has(String(automationId)));
	const taken = new Set(on.map(({ automationId }) => String(automationId)));
	return {
		runs: on.map((run) => {
			const automation = byId.get(String(run.automationId));
			return { automationId: String(automation._id), name: automation.name, where: describeRun(run, automation.steps), status: run.status };
		}),
		available: automations.filter(({ _id, enabled }) => enabled && !taken.has(String(_id))).map(({ _id, name }) => ({ id: String(_id), name })),
	};
}

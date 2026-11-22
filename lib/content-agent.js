import "server-only";
import { scoped } from "@/lib/account-scope";
import { findOwnerEmail } from "@/lib/accounts";
import { campaignActions } from "@/lib/actions/campaigns";
import { getAppUrl } from "@/lib/config";
import { connectDb } from "@/lib/db";
import { isPlacesConfigured, readPlace } from "@/lib/google-places";
import { notify } from "@/lib/notifications";
import { canSendPlatformEmail, sendPlatformEmail } from "@/lib/platform-email";
import { getAccountPlan } from "@/lib/plans";
import Account from "@/models/Account";
import ContentIdea from "@/models/ContentIdea";
import Newsletter from "@/models/Newsletter";

// guestmail: the content agent. GuestMail keeps the owner's brief, the ideas and their decisions, and turns approved ideas
// into draft campaigns. The writing itself happens in a separate service at AGENT_URL, which researches the area and
// answers ideas and drafts as JSON: GuestMail sends it the brief and the venue's live reputation, and keeps neither the
// service's prompts nor Google's data. Nothing is ever sent to readers: every draft waits for its owner.
export const AGENT_PATH = "/agent";
export const IDEAS_PER_ROUND = 5;
export const ROUND_DAYS = 7;
export const MAX_BRIEF_LENGTH = 8000;
const MAX_ATTEMPTS = 2;
const DRAFTING_STALE_MS = 30 * 60_000;
const TIMEOUT_MS = 10 * 60_000;
const createCampaign = campaignActions.find(({ name }) => name === "create_campaign");

export function isAgentConfigured(env = process.env) {
	return Boolean(env.AGENT_URL && env.AGENT_TOKEN);
}

// A first brief from what the owner already told GuestMail. Nothing from Google Maps: the agent reads it live.
export function buildStarterBrief(newsletter) {
	const kind = { hotel: "Hotel", restaurant: "Restaurant", other: "Business" }[newsletter.venue?.kind] ?? "Business";
	const lines = [
		`# ${newsletter.name}`,
		"",
		`- Type: ${kind}`,
		`- Address: ${newsletter.postalAddress?.trim() || "(add the street, the neighborhood and the city)"}`,
		...(newsletter.venue?.bookingUrl ? [`- Book: ${newsletter.venue.bookingUrl}`] : []),
		"",
		"## Who we are",
		"(Two or three lines: category, style, what makes the place different.)",
		"",
		newsletter.venue?.kind === "other" ? "## Who our customers are" : "## Who our guests are",
		newsletter.venue?.kind === "other" ? "(Who buys from you, what they care about, where they are.)" : "(Couples, families, business travelers, locals... and where they come from.)",
		"",
		"## What to write about",
		"(The neighborhood, seasons, local events, food, day trips. Topics to avoid.)",
		"",
		"## Voice",
		"Warm and concrete. We write as the venue, in first person plural. No hype, no prices we can't back up.",
	];
	return lines.join("\n");
}

export async function callAgent(path, body) {
	const response = await fetch(new URL(path, process.env.AGENT_URL), {
		method: "POST",
		headers: { authorization: `Bearer ${process.env.AGENT_TOKEN}`, "content-type": "application/json" },
		body: JSON.stringify(body),
		signal: AbortSignal.timeout(TIMEOUT_MS),
	});
	const json = await response.json().catch(() => ({}));
	if (!response.ok) throw Object.assign(new Error(String(json.error ?? `the agent answered ${response.status}`).slice(0, 300)), { status: response.status });
	return json;
}

// What the agent needs to know about the venue: the newsletter's own data, plus its reputation read live from Google Maps.
export async function readVenue(newsletter) {
	const venue = {
		name: newsletter.name,
		kind: newsletter.venue?.kind ?? null,
		address: newsletter.postalAddress ?? null,
		bookingUrl: newsletter.venue?.bookingUrl ?? null,
		rating: null,
		reviewCount: null,
		category: null,
		website: newsletter.venue?.website ?? null,
	};
	if (!newsletter.venue?.placeId || !isPlacesConfigured()) return venue;
	try {
		const place = await readPlace(newsletter.venue.placeId, { language: newsletter.agent?.language ?? "en" });
		return { ...venue, name: place.name || venue.name, address: venue.address ?? place.address, rating: place.rating, reviewCount: place.reviewCount, category: place.category, website: place.website ?? venue.website };
	} catch (error) {
		console.error(`[agent] Couldn't read the place of ${newsletter._id}: ${error.message}`);
		return venue;
	}
}

function cleanText(value, max) {
	return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanSources(sources) {
	return [...new Set((Array.isArray(sources) ? sources : []).map(String).filter((url) => /^https:\/\/[^\s]+$/.test(url)))].slice(0, 8);
}

async function tellOwner(newsletter, { key, kind, title, body, path, lines = [] }) {
	await notify({ accountId: newsletter.accountId, key, kind, title, body, path });
	if (!canSendPlatformEmail()) return;
	const to = await findOwnerEmail(newsletter.accountId);
	if (!to) return;
	const url = new URL(path, getAppUrl()).toString();
	const text = [`${title}.`, "", body, "", ...lines, ...(lines.length > 0 ? [""] : []), url, "", `GuestMail's content agent for ${newsletter.name}`].join("\n");
	await sendPlatformEmail({ to, subject: `${title} · ${newsletter.name}`, text }).catch((error) => console.error(`[agent] Couldn't email the owner: ${error.message}`));
}

async function proposeIdeas(newsletter, now, { count = IDEAS_PER_ROUND } = {}) {
	const recent = await ContentIdea.find(scoped(newsletter.accountId, { newsletterId: newsletter._id })).sort({ createdAt: -1 }).limit(60).select({ title: 1 }).lean();
	const venue = await readVenue(newsletter);
	const answer = await callAgent("/ideas", {
		venue,
		brief: newsletter.agent?.brief ?? "",
		language: newsletter.agent?.language ?? "en",
		count,
		avoid: recent.map(({ title }) => title),
		topics: newsletter.agent?.topics ?? [],
	});
	const ideas = (Array.isArray(answer.ideas) ? answer.ideas : [])
		.map((idea) => ({ title: cleanText(idea.title, 200), angle: cleanText(idea.angle, 600), keyword: cleanText(idea.keyword, 200), sources: cleanSources(idea.sources) }))
		.filter(({ title }) => title)
		.slice(0, count);
	await Newsletter.updateOne(scoped(newsletter.accountId, { _id: newsletter._id }), { $set: { "agent.lastRoundAt": now }, $unset: { "agent.nextRoundAt": 1 } });
	if (ideas.length === 0) return { step: "ideas", count: 0 };
	await ContentIdea.insertMany(ideas.map((idea) => ({ ...idea, accountId: newsletter.accountId, newsletterId: newsletter._id, status: "proposed" })));
	await tellOwner(newsletter, {
		key: `agent-ideas:${newsletter._id}`,
		kind: "agent-ideas",
		title: `${ideas.length} new ideas to approve`,
		body: "Approve the ones you like and the agent writes each one as a draft campaign. Nothing is sent without you.",
		path: AGENT_PATH,
		lines: ideas.map(({ title, angle }) => `- ${title}${angle ? `: ${angle}` : ""}`),
	});
	return { step: "ideas", count: ideas.length };
}

async function writeDraft(newsletter, idea) {
	await ContentIdea.updateOne(scoped(newsletter.accountId, { _id: idea._id }), { $set: { status: "drafting" }, $inc: { attempts: 1 } });
	try {
		const venue = await readVenue(newsletter);
		const draft = await callAgent("/draft", {
			venue,
			brief: newsletter.agent?.brief ?? "",
			language: newsletter.agent?.language ?? "en",
			idea: { title: idea.title, angle: idea.angle, keyword: idea.keyword, sources: idea.sources ?? [] },
		});
		const account = await Account.findById(newsletter.accountId).lean();
		const campaign = await createCampaign.handler({
			account,
			via: "api",
			input: {
				newsletter: String(newsletter._id),
				subject: cleanText(draft.subject, 200) || idea.title,
				previewText: cleanText(draft.previewText, 200),
				format: "markdown",
				content: String(draft.markdown ?? "").slice(0, 100_000),
			},
		});
		await ContentIdea.updateOne(scoped(newsletter.accountId, { _id: idea._id }), {
			$set: { status: "drafted", campaignId: campaign.id, sources: cleanSources(draft.sources ?? idea.sources), note: cleanText((draft.warnings ?? []).join(" "), 500) },
		});
		await tellOwner(newsletter, {
			key: `agent-draft:${idea._id}`,
			kind: "agent-draft",
			title: "A new draft is ready",
			body: `“${idea.title}” is written. Read it, change what you want, then send it or schedule it.`,
			path: `/campaigns/${campaign.id}`,
		});
		return { step: "draft", idea: String(idea._id), campaign: campaign.id };
	} catch (error) {
		const isLast = idea.attempts + 1 >= MAX_ATTEMPTS || error.status === 422;
		await ContentIdea.updateOne(scoped(newsletter.accountId, { _id: idea._id }), {
			$set: { status: isLast ? "failed" : "approved", note: cleanText(error.message, 500) },
		});
		return { step: "draft", idea: String(idea._id), error: error.message };
	}
}

// The owner's first context.md, written by the agent from the venue's website and the web. Replaces the brief.
export async function generateBrief(newsletter) {
	const venue = await readVenue(newsletter);
	const answer = await callAgent("/brief", { venue, language: newsletter.agent?.language ?? "en" });
	const brief = String(answer.brief ?? "").trim().slice(0, MAX_BRIEF_LENGTH);
	if (!brief) throw new Error("The agent wrote no brief");
	await Newsletter.updateOne(scoped(newsletter.accountId, { _id: newsletter._id }), { $set: { "agent.brief": brief } });
	return brief;
}

// The round every new venue gets at sign-up, plan or not: its brief, 3 ideas, and the first one written as a draft, so
// the owner finds work done. Once per newsletter: firstRoundAt is set before anything runs.
export const FIRST_ROUND_IDEAS = 3;
export async function runFirstRound(newsletterId, accountId, { now = new Date() } = {}) {
	await connectDb();
	const newsletter = await Newsletter.findOneAndUpdate(
		scoped(accountId, { _id: newsletterId, "agent.firstRoundAt": { $exists: false } }),
		{ $set: { "agent.firstRoundAt": now } },
		{ returnDocument: "after" }
	).lean();
	if (!newsletter || !isAgentConfigured()) return { step: "first-round", skipped: true };
	try {
		if (!newsletter.agent?.brief?.trim()) newsletter.agent = { ...newsletter.agent, brief: await generateBrief(newsletter) };
	} catch (error) {
		console.error(`[agent] No brief for ${newsletter._id}: ${error.message}`);
	}
	const ideas = await proposeIdeas(newsletter, now, { count: FIRST_ROUND_IDEAS });
	const first = await ContentIdea.findOneAndUpdate(
		scoped(accountId, { newsletterId: newsletter._id, status: "proposed" }),
		{ $set: { status: "approved", decidedAt: now } },
		{ sort: { createdAt: 1 }, returnDocument: "after" }
	).lean();
	const draft = first ? await writeDraft(newsletter, first) : null;
	return { step: "first-round", ideas: ideas.count, draft: draft?.campaign ?? null };
}

// One step for one newsletter: write the oldest approved idea, or, when nothing waits for the owner, propose new ones
// once a round is due. One step per newsletter per run keeps each run short.
export async function runAgentStep(newsletter, { now = new Date() } = {}) {
	const filter = (extra) => scoped(newsletter.accountId, { newsletterId: newsletter._id, ...extra });
	await ContentIdea.updateMany(filter({ status: "drafting", updatedAt: { $lt: new Date(now.getTime() - DRAFTING_STALE_MS) } }), { $set: { status: "approved" } });
	const approved = await ContentIdea.findOne(filter({ status: "approved" })).sort({ decidedAt: 1 }).lean();
	if (approved) return writeDraft(newsletter, approved);
	if (await ContentIdea.exists(filter({ status: { $in: ["proposed", "drafting"] } }))) return { step: "waiting" };
	const last = newsletter.agent?.lastRoundAt;
	const isDue = !last || newsletter.agent?.nextRoundAt || now - new Date(last) >= ROUND_DAYS * 86_400_000;
	return isDue ? proposeIdeas(newsletter, now) : { step: "idle" };
}

// ponytail: newsletters one after another in one run; a queue per newsletter once there are dozens of them.
export async function runAgentRound({ now = new Date() } = {}) {
	if (!isAgentConfigured()) return { off: true };
	await connectDb();
	const newsletters = await Newsletter.find({ "agent.enabled": true }, null, { crossAccount: true }).select({ accountId: 1, name: 1, postalAddress: 1, venue: 1, agent: 1 }).lean();
	const results = [];
	for (const newsletter of newsletters) {
		const account = await Account.findById(newsletter.accountId).lean();
		if (!account) continue;
		if (!newsletter.agent?.firstRoundAt) {
			results.push({ newsletter: String(newsletter._id), ...(await runFirstRound(newsletter._id, newsletter.accountId, { now }).catch((error) => ({ error: error.message }))) });
			continue;
		}
		if (!getAccountPlan(account)) {
			results.push({ newsletter: String(newsletter._id), step: "no-plan" });
			continue;
		}
		try {
			results.push({ newsletter: String(newsletter._id), ...(await runAgentStep(newsletter, { now })) });
		} catch (error) {
			console.error(`[agent] ${newsletter._id}: ${error.message}`);
			results.push({ newsletter: String(newsletter._id), error: error.message });
		}
	}
	return { newsletters: newsletters.length, results };
}

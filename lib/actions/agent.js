import "server-only";
import * as z from "zod";
import { scoped } from "@/lib/account-scope";
import { defineAction } from "@/lib/actions/define-action";
import { actionError } from "@/lib/actions/errors";
import { dateOutput, findNewsletter, idInput, newsletterInput, toIso } from "@/lib/actions/shared";
import { pilotActions } from "@/lib/actions/pilot";
import { IDEAS_PER_ROUND, MAX_BRIEF_LENGTH, ROUND_DAYS, generateBrief, isAgentConfigured } from "@/lib/content-agent";
import { isObjectIdString } from "@/lib/validation";
import ContentIdea, { IDEA_STATUSES } from "@/models/ContentIdea";
import Newsletter from "@/models/Newsletter";

// guestmail: the content agent's settings and ideas (lib/content-agent.js). The owner writes the brief and decides each
// idea; the agent proposes and writes on its own schedule, so no action here calls it.
const GROUP = "Content agent";
const LANGUAGES = ["en", "es"];

const AgentSchema = z.object({
	available: z.boolean().describe("Whether this server runs the content agent"),
	enabled: z.boolean(),
	language: z.enum(LANGUAGES),
	brief: z.string().describe("The owner's context.md: what the agent knows about the venue and how it writes"),
	topics: z.array(z.string()).describe("What the owner asked it to write about, first in every round"),
	lastRoundAt: dateOutput,
	nextRoundAt: dateOutput.describe(`When it proposes new ideas next: every ${ROUND_DAYS} days once nothing waits for the owner`),
});

const IdeaSchema = z.object({
	id: z.string(),
	title: z.string(),
	angle: z.string().nullable().describe("Why it fits this venue"),
	keyword: z.string().nullable().describe("What guests search for"),
	sources: z.array(z.string()),
	status: z.enum(IDEA_STATUSES),
	campaignId: z.string().nullable().describe("The draft campaign written from it"),
	note: z.string().nullable(),
	createdAt: dateOutput,
});

function toAgent(newsletter) {
	const agent = newsletter.agent ?? {};
	const next = agent.nextRoundAt ?? (agent.lastRoundAt ? new Date(new Date(agent.lastRoundAt).getTime() + ROUND_DAYS * 86_400_000) : null);
	return {
		available: isAgentConfigured(),
		enabled: Boolean(agent.enabled),
		language: agent.language ?? "en",
		brief: agent.brief ?? "",
		topics: agent.topics ?? [],
		lastRoundAt: toIso(agent.lastRoundAt),
		nextRoundAt: agent.enabled ? toIso(next) : null,
	};
}

function toIdea(idea) {
	return {
		id: String(idea._id),
		title: idea.title,
		angle: idea.angle || null,
		keyword: idea.keyword || null,
		sources: idea.sources ?? [],
		status: idea.status,
		campaignId: idea.campaignId ? String(idea.campaignId) : null,
		note: idea.note || null,
		createdAt: toIso(idea.createdAt),
	};
}

const getAgent = defineAction({
	name: "get_agent",
	role: "member",
	tryWithoutPlan: true,
	title: "Get the content agent",
	group: GROUP,
	description: `The content agent's settings for a newsletter: whether it's on, the language it writes in and the brief it works from. Once on, it proposes ${IDEAS_PER_ROUND} topics about the venue's area when nothing waits for the owner, and writes each approved one as a draft campaign.`,
	http: { method: "GET", path: "/agent" },
	readOnly: true,
	input: z.object({ newsletter: newsletterInput }),
	output: AgentSchema,
	handler: async ({ account, input }) => toAgent(await findNewsletter(account, input.newsletter, { agent: 1 })),
});

const updateAgent = defineAction({
	name: "update_agent",
	role: "admin",
	tryWithoutPlan: true,
	title: "Update the content agent",
	group: GROUP,
	description: "Turns the content agent on or off, sets its language and replaces its brief. newIdeas: true asks for a new round of ideas at its next run. Send only the fields to change.",
	http: { method: "PATCH", path: "/agent" },
	idempotent: true,
	example: { enabled: true, language: "es" },
	input: z.object({
		newsletter: newsletterInput,
		enabled: z.boolean().optional().describe("true turns the agent on: it proposes ideas at its next run. false stops it"),
		language: z.enum(LANGUAGES).optional().describe("en or es"),
		brief: z.string().max(MAX_BRIEF_LENGTH).optional().describe(`Markdown, up to ${MAX_BRIEF_LENGTH} characters`),
		topics: z.array(z.string().trim().min(2).max(80)).max(12).optional().describe("What to write about, first in every round, like the neighborhood or food. [] clears them"),
		newIdeas: z.boolean().optional().describe("true: propose new ideas at the next run, without waiting for the round"),
	}),
	output: AgentSchema,
	handler: async ({ account, input: { newsletter: reference, newIdeas, ...changes } }) => {
		const newsletter = await findNewsletter(account, reference, { _id: 1 });
		if (changes.enabled && !isAgentConfigured()) throw actionError("unavailable", "The content agent isn't available on this server yet");
		const set = Object.fromEntries(
			Object.entries(changes)
				.filter(([, value]) => value !== undefined)
				.map(([key, value]) => [`agent.${key}`, key === "brief" ? value.trim() : value])
		);
		if (newIdeas) set["agent.nextRoundAt"] = new Date();
		const saved = await Newsletter.findOneAndUpdate(scoped(account, { _id: newsletter._id }), Object.keys(set).length > 0 ? { $set: set } : {}, { returnDocument: "after" })
			.select({ agent: 1 })
			.lean();
		return toAgent(saved);
	},
});

const listIdeas = defineAction({
	name: "list_ideas",
	role: "member",
	tryWithoutPlan: true,
	title: "List the agent's ideas",
	group: GROUP,
	description: "The topics the content agent proposed for a newsletter, newest first, with what became of each: proposed (waiting for the owner), approved, drafting, drafted (with its draft campaign), rejected or failed.",
	http: { method: "GET", path: "/agent/ideas" },
	readOnly: true,
	input: z.object({ newsletter: newsletterInput, status: z.enum(IDEA_STATUSES).optional().describe("Only the ideas in this status") }),
	output: z.object({ ideas: z.array(IdeaSchema) }),
	handler: async ({ account, input }) => {
		const newsletter = await findNewsletter(account, input.newsletter, { _id: 1 });
		const ideas = await ContentIdea.find(scoped(account, { newsletterId: newsletter._id, ...(input.status && { status: input.status }) }))
			.sort({ createdAt: -1 })
			.limit(100)
			.lean();
		return { ideas: ideas.map(toIdea) };
	},
});

const decideIdea = defineAction({
	name: "decide_idea",
	role: "admin",
	tryWithoutPlan: true,
	title: "Approve or reject an idea",
	group: GROUP,
	description: "approved: the agent writes the idea as a draft campaign at its next run. rejected: it's dropped. Only a proposed idea can be decided.",
	http: { method: "PATCH", path: "/agent/ideas/{id}" },
	idempotent: true,
	input: z.object({ newsletter: newsletterInput, id: idInput("idea"), decision: z.enum(["approved", "rejected"]).describe("approved: write it as a draft. rejected: drop it") }),
	output: IdeaSchema,
	handler: async ({ account, input }) => {
		const newsletter = await findNewsletter(account, input.newsletter, { _id: 1 });
		if (!isObjectIdString(input.id)) throw actionError("not_found", "No idea has this ID");
		const idea = await ContentIdea.findOneAndUpdate(
			scoped(account, { _id: input.id, newsletterId: newsletter._id, status: { $in: ["proposed", input.decision] } }),
			{ $set: { status: input.decision, decidedAt: new Date() } },
			{ returnDocument: "after" }
		).lean();
		if (!idea) {
			const exists = await ContentIdea.exists(scoped(account, { _id: input.id, newsletterId: newsletter._id }));
			throw exists ? actionError("conflict", "This idea was already decided") : actionError("not_found", "No idea has this ID");
		}
		return toIdea(idea);
	},
});

const writeBrief = defineAction({
	name: "generate_brief",
	role: "admin",
	tryWithoutPlan: true,
	title: "Write the brief from the venue",
	group: GROUP,
	description: "The agent reads the venue's website and what the web says about it, and writes the brief: who it is, rooms and services, what it can sell, its guests and what to write about. What it isn't sure of says to confirm. Replaces the current brief: read it and edit it.",
	http: { method: "POST", path: "/agent/brief" },
	openWorld: true,
	rateLimit: { limit: 10, window: "1 h" },
	input: z.object({ newsletter: newsletterInput }),
	output: AgentSchema,
	handler: async ({ account, input }) => {
		if (!isAgentConfigured()) throw actionError("unavailable", "The content agent isn't available on this server yet");
		const newsletter = await findNewsletter(account, input.newsletter, { _id: 1, accountId: 1, name: 1, postalAddress: 1, venue: 1, agent: 1 });
		try {
			await generateBrief(newsletter);
		} catch (error) {
			throw actionError(error.status === 422 ? "conflict" : "unavailable", error.status === 422 ? "The agent found nothing about this venue on the web: write the brief yourself" : "The agent couldn't write the brief right now. Try again in a minute");
		}
		return toAgent(await findNewsletter(account, input.newsletter, { agent: 1 }));
	},
});

export const agentActions = [getAgent, updateAgent, writeBrief, listIdeas, decideIdea, ...pilotActions];

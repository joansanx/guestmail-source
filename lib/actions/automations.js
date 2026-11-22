import "server-only";
import * as z from "zod";
import { scoped } from "@/lib/account-scope";
import { campaignActions } from "@/lib/actions/campaigns";
import { defineAction } from "@/lib/actions/define-action";
import { actionError } from "@/lib/actions/errors";
import { findNewsletter, newsletterInput } from "@/lib/actions/shared";
import { AUTOMATIONS, AUTOMATION_KINDS, findPlaceholder, getAutomation } from "@/lib/automations";
import { CAMPAIGN_TEMPLATES, fillTemplate } from "@/lib/campaign-templates";
import { checkSegmentRules } from "@/lib/segments";
import { getVenueLanguage } from "@/lib/venue-legal";
import Campaign from "@/models/Campaign";
import Segment from "@/models/Segment";

// guestmail: a hotel's automatic emails (lib/automations.js): before arrival, after the stay, birthday and come back.
const GROUP = "Automations";
const createCampaign = campaignActions.find(({ name }) => name === "create_campaign");
const NEWSLETTER_FIELDS = { _id: 1, name: 1, venue: 1, "agent.language": 1 };
const CAMPAIGN_FIELDS = "subject previewText markdown html status pauseReason automation stats.recipients";

const AutomationSchema = z.object({
	kind: z.enum(AUTOMATION_KINDS),
	label: z.string(),
	description: z.string().describe("Who gets it and when"),
	enabled: z.boolean(),
	campaign: z.string().nullable().describe("Its email, a campaign to edit like any other (get_campaign, update_campaign). Null until it's set up"),
	subject: z.string().nullable(),
	sent: z.number().int().describe("Guests it went to"),
	status: z.string().nullable().describe("Its campaign's status: draft until its first send, then sent between runs, sending during one, or paused"),
	paused: z.string().nullable().describe("Why it's paused: it sends nothing until its campaign is resumed"),
	placeholder: z.string().nullable().describe("A [square bracket] left in the email to fill in before it can be turned on"),
	problem: z.string().nullable().describe("Why its last hourly run failed"),
});

function findCurrent(account, newsletterId, kind) {
	return Campaign.findOne(scoped(account, { newsletterId, "automation.kind": kind }))
		.sort({ createdAt: -1 })
		.select(CAMPAIGN_FIELDS)
		.lean();
}

function readPlaceholder(campaign) {
	return findPlaceholder([campaign.subject, campaign.previewText, campaign.markdown ?? campaign.html].join("\n"));
}

function toAutomation(automation, campaign) {
	return {
		kind: automation.kind,
		label: automation.label,
		description: automation.description,
		enabled: Boolean(campaign?.automation?.enabled),
		campaign: campaign ? String(campaign._id) : null,
		subject: campaign?.subject ?? null,
		sent: campaign?.stats?.recipients ?? 0,
		status: campaign?.status ?? null,
		paused: campaign?.status === "paused" ? (campaign.pauseReason ?? "Paused") : null,
		placeholder: campaign ? readPlaceholder(campaign) : null,
		problem: campaign?.automation?.problem ?? null,
	};
}

// The first time: the template in the venue's language as a draft, email only, with a segment of its own.
async function setUp({ account, newsletter, automation, context }) {
	const template = CAMPAIGN_TEMPLATES.find(({ id }) => id === automation.template);
	const draft = fillTemplate(template, getVenueLanguage(newsletter), {
		venue: newsletter.name,
		bookingUrl: newsletter.venue?.bookingUrl ?? newsletter.venue?.website,
	});
	const { rules } = checkSegmentRules({ match: "all", conditions: automation.conditions });
	const segment = await Segment.create({ accountId: account._id, newsletterId: newsletter._id, name: `Automatic: ${automation.label.toLowerCase()}`, ...rules });
	const created = await createCampaign.handler({
		...context,
		account,
		input: { newsletter: String(newsletter._id), format: "markdown", subject: draft.subject, previewText: draft.previewText, content: draft.markdown },
	});
	await Campaign.updateOne(scoped(account, { _id: created.id }), {
		$set: { publishTo: "email", segmentId: segment._id, automation: { kind: automation.kind, enabled: false } },
	});
	return findCurrent(account, newsletter._id, automation.kind);
}

const listAutomations = defineAction({
	name: "list_automations",
	role: "member",
	tryWithoutPlan: true,
	title: "List the automatic emails",
	group: GROUP,
	description:
		"A hotel's automatic emails: before arrival, after the stay, birthday and come back. Each is an email-only campaign sent every hour between 9:00 and 20:00 (Madrid) to the guests who joined its segment since. A guest gets each one once, and its words can't change once it starts going out. Only hotels have them.",
	http: { method: "GET", path: "/automations" },
	readOnly: true,
	input: z.object({ newsletter: newsletterInput }),
	output: z.object({ available: z.boolean().describe("Whether the newsletter is a hotel's"), automations: z.array(AutomationSchema) }),
	handler: async ({ account, input }) => {
		const newsletter = await findNewsletter(account, input.newsletter, NEWSLETTER_FIELDS);
		if (newsletter.venue?.kind !== "hotel") return { available: false, automations: [] };
		const campaigns = await Promise.all(AUTOMATIONS.map(({ kind }) => findCurrent(account, newsletter._id, kind)));
		return { available: true, automations: AUTOMATIONS.map((automation, index) => toAutomation(automation, campaigns[index])) };
	},
});

const updateAutomation = defineAction({
	name: "update_automation",
	role: "admin",
	tryWithoutPlan: true,
	title: "Set up or turn an automatic email on or off",
	group: GROUP,
	description:
		"Sets up the automatic email the first time, as a draft from its template in the venue's language: edit it like any campaign. enabled turns it on or off; it turns on only once no [square bracket] is left to fill in. Turned on, it sends real emails to guests from the next hourly run, and its words can't change after: ask the user to confirm first, showing them the email and who gets it.",
	http: { method: "PATCH", path: "/automations/{kind}" },
	idempotent: true,
	destructive: true,
	openWorld: true,
	rateLimit: { limit: 30, window: "1 h" },
	input: z.object({
		newsletter: newsletterInput,
		kind: z.enum(AUTOMATION_KINDS).describe("pre_arrival, post_stay, birthday or win_back"),
		enabled: z.boolean().optional().describe("On or off. Leave it out to only set up the draft"),
	}),
	output: AutomationSchema,
	handler: async ({ account, input, ...context }) => {
		const newsletter = await findNewsletter(account, input.newsletter, NEWSLETTER_FIELDS);
		if (newsletter.venue?.kind !== "hotel") throw actionError("validation_failed", "Automatic emails are for hotels for now");
		const automation = getAutomation(input.kind);
		let campaign = (await findCurrent(account, newsletter._id, input.kind)) ?? (await setUp({ account, newsletter, automation, context }));
		if (input.enabled !== undefined && input.enabled !== Boolean(campaign.automation?.enabled)) {
			const placeholder = input.enabled ? readPlaceholder(campaign) : null;
			if (placeholder) throw actionError("validation_failed", `Fill in ${placeholder} in the email first, then turn it on`);
			await Campaign.updateOne(scoped(account, { _id: campaign._id }), {
				$set: { "automation.enabled": input.enabled },
				$unset: { "automation.problem": 1 },
			});
			campaign = await findCurrent(account, newsletter._id, input.kind);
		}
		return toAutomation(automation, campaign);
	},
});

export const automationActions = [listAutomations, updateAutomation];

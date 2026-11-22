import "server-only";
import * as z from "zod";
import { campaignActions } from "@/lib/actions/campaigns";
import { defineAction } from "@/lib/actions/define-action";
import { actionError } from "@/lib/actions/errors";
import { findNewsletter, newsletterFilterInput, newsletterInput } from "@/lib/actions/shared";
import { CAMPAIGN_DESIGNS, findDesign, fillDesign, listDesigns } from "@/lib/campaign-designs";
import { CAMPAIGN_TEMPLATES, TEMPLATE_GOALS, TEMPLATE_LANGUAGES, fillTemplate } from "@/lib/campaign-templates";
import { getAppUrl } from "@/lib/config";
import { getDesignPreview } from "@/lib/design-gallery";
import { getVenueLanguage } from "@/lib/venue-legal";

// guestmail: revenue templates for hotels and restaurants, words only (lib/campaign-templates.js) or laid out with photos
// (lib/campaign-designs.js), and a draft from one.
const GROUP = "Templates";
const createCampaign = campaignActions.find(({ name }) => name === "create_campaign");
const languageInput = z.enum(TEMPLATE_LANGUAGES).optional().describe("en (the default) or es");
const TemplateSchema = z.object({
	id: z.string(),
	kind: z.enum(["hotel", "restaurant", "other"]),
	goal: z.enum(Object.keys(TEMPLATE_GOALS)),
	title: z.string(),
	when: z.string().describe("When it works best"),
	subject: z.string(),
});

function toListed(template, language) {
	const { title, when, subject } = template[language];
	return { id: template.id, kind: template.kind, goal: template.goal, title, when, subject };
}

const listTemplates = defineAction({
	name: "list_templates",
	role: "member",
	tryWithoutPlan: true,
	title: "List the campaign templates",
	group: GROUP,
	description: "Ready campaigns for hotels and restaurants, built to bring revenue: upgrades before arrival, extras, direct bookings, last-minute and seasonal offers, and loyalty. Each says what it's for and when to send it. templates are words only. designs are laid out like a brochure: a header with the venue's name, a banner photo, rows of photos with captions and a button, with stock photos to swap for the venue's own. With newsletter, the designs are those for its kind of venue, in its language.",
	http: { method: "GET", path: "/templates" },
	readOnly: true,
	input: z.object({
		kind: z.enum(["hotel", "restaurant", "other"]).optional().describe("Only a hotel's, a restaurant's or any other business's"),
		language: z.enum(TEMPLATE_LANGUAGES).optional().describe("en or es. Default: the newsletter's language when newsletter is given, else en"),
		newsletter: newsletterFilterInput.describe(
			"A newsletter's ID or slug: without kind, the designs are those for its kind of venue and for any business, and every design when it hasn't said what it is"
		),
		previews: z.boolean().optional().describe("true, with newsletter: each design comes with preview. They're long, so only ask when they'll be shown"),
	}),
	output: z.object({
		language: z.enum(TEMPLATE_LANGUAGES).describe("The language the titles are in"),
		templates: z.array(TemplateSchema),
		designs: z.array(
			TemplateSchema.extend({
				blocks: z.array(z.string()).describe("What it's laid out with, like header, banner, 3 photos, box and button"),
				preview: z.string().optional().describe("With previews: its email as HTML, in the newsletter's own design and with its name, as create_campaign_from_template would draft it"),
			})
		),
	}),
	handler: async ({ account, input }) => {
		if (input.previews && !input.newsletter) throw actionError("validation_failed", "previews: send newsletter with it");
		const newsletter = input.newsletter ? await findNewsletter(account, input.newsletter, { _id: 1, name: 1, venue: 1, agent: 1, theme: 1 }) : null;
		const language = input.language ?? (newsletter ? getVenueLanguage(newsletter) : "en");
		const isListed = ({ kind }) => !input.kind || kind === input.kind;
		const designs = newsletter && !input.kind ? listDesigns(newsletter.venue?.kind) : CAMPAIGN_DESIGNS.filter(isListed);
		return {
			language,
			templates: CAMPAIGN_TEMPLATES.filter(isListed).map((template) => toListed(template, language)),
			designs: designs.map((design) => ({
				...toListed(design, language),
				blocks: design.blocks,
				...(input.previews && { preview: getDesignPreview(design, language, newsletter) }),
			})),
		};
	},
});

const useTemplate = defineAction({
	name: "create_campaign_from_template",
	role: "member",
	tryWithoutPlan: true,
	title: "Draft a campaign from a template",
	group: GROUP,
	description: "Creates a draft from a template or a design, with the venue's name and booking link filled in. Square brackets mark what to fill: a price, a date, a perk. A design's draft is rich content with stock photos to swap, and its button has no link until the venue has a booking link or a website. Nothing is sent.",
	http: { method: "POST", path: "/templates/{id}/campaigns", status: 201 },
	example: { language: "es" },
	input: z.object({ newsletter: newsletterInput, id: z.string().trim().min(1).max(60).describe("The template's or the design's id, from list_templates"), language: languageInput }),
	output: createCampaign.output,
	handler: async ({ account, input, ...context }) => {
		const design = findDesign(input.id);
		const template = CAMPAIGN_TEMPLATES.find(({ id }) => id === input.id);
		if (!design && !template) throw actionError("not_found", "No template or design has this id: list_templates lists them");
		const newsletter = await findNewsletter(account, input.newsletter, { _id: 1, name: 1, venue: 1 });
		const venue = { venue: newsletter.name, bookingUrl: newsletter.venue?.bookingUrl ?? newsletter.venue?.website };
		const language = input.language ?? "en";
		const draft = design ? fillDesign(design, language, { ...venue, baseUrl: getAppUrl() }) : fillTemplate(template, language, venue);
		const content = design ? { format: "rich", content: draft.html } : { format: "markdown", content: draft.markdown };
		return createCampaign.handler({ ...context, account, input: { newsletter: String(newsletter._id), ...content, subject: draft.subject, previewText: draft.previewText } });
	},
});

export const templateActions = [listTemplates, useTemplate];

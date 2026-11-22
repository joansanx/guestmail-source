import "server-only";
import * as z from "zod";
import { scoped } from "@/lib/account-scope";
import { defineAction } from "@/lib/actions/define-action";
import { actionError } from "@/lib/actions/errors";
import { findNewsletter, newsletterInput } from "@/lib/actions/shared";
import { LEGAL_LIMITS, getMissingLegal, readLegalInput } from "@/lib/venue-legal";
import Newsletter from "@/models/Newsletter";

// guestmail: who the venue is in law (lib/venue-legal.js), which its forms, privacy page and emails show.
const GROUP = "Legal";

const LegalSchema = z.object({
	name: z.string().describe("Legal name, like Hoteles Sol SL"),
	taxId: z.string().describe("Tax ID (NIF or VAT number)"),
	email: z.string().describe("Where people write to exercise their data rights"),
	privacyUrl: z.string().describe("The venue's own privacy policy. Empty: GuestMail's generated page on its website"),
	missing: z.array(z.string()).describe("What the notice still lacks to name the controller fully"),
});

function toLegal(newsletter) {
	const legal = newsletter.legal ?? {};
	return { name: legal.name ?? "", taxId: legal.taxId ?? "", email: legal.email ?? "", privacyUrl: legal.privacyUrl ?? "", missing: getMissingLegal(newsletter) };
}

const getLegal = defineAction({
	name: "get_legal_details",
	role: "admin",
	tryWithoutPlan: true,
	title: "Get the venue's legal details",
	group: GROUP,
	description: "The venue's legal name, tax ID, privacy email and privacy policy, which the notice under its forms, its privacy page and its emails' footer show.",
	http: { method: "GET", path: "/legal" },
	readOnly: true,
	input: z.object({ newsletter: newsletterInput }),
	output: LegalSchema,
	handler: async ({ account, input }) => toLegal(await findNewsletter(account, input.newsletter, { legal: 1, postalAddress: 1 })),
});

const updateLegal = defineAction({
	name: "update_legal_details",
	role: "admin",
	tryWithoutPlan: true,
	title: "Update the venue's legal details",
	group: GROUP,
	description: "Saves the venue's legal name, tax ID, privacy email and privacy policy URL. Send all four: an empty one clears it.",
	http: { method: "PATCH", path: "/legal" },
	idempotent: true,
	input: z.object({
		newsletter: newsletterInput,
		name: z.string().max(LEGAL_LIMITS.name).describe("Legal name, like Hoteles Sol SL"),
		taxId: z.string().max(LEGAL_LIMITS.taxId).describe("Tax ID, like B12345678"),
		email: z.string().max(LEGAL_LIMITS.email).describe("Email for privacy requests"),
		privacyUrl: z.string().max(LEGAL_LIMITS.privacyUrl).describe("The venue's own privacy policy, https. Empty: GuestMail's generated page"),
	}),
	output: LegalSchema,
	handler: async ({ account, input }) => {
		const { legal, problem } = readLegalInput(input);
		if (problem) throw actionError("validation_failed", problem);
		const newsletter = await findNewsletter(account, input.newsletter, { _id: 1 });
		const updated = await Newsletter.findOneAndUpdate(scoped(account, { _id: newsletter._id }), { $set: { legal } }, { returnDocument: "after" })
			.select({ legal: 1, postalAddress: 1 })
			.lean();
		return toLegal(updated);
	},
});

export const legalActions = [getLegal, updateLegal];

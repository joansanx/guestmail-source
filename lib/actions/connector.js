import "server-only";
import * as z from "zod";
import { scoped } from "@/lib/account-scope";
import { defineAction } from "@/lib/actions/define-action";
import { actionError } from "@/lib/actions/errors";
import { dateOutput, findNewsletter, newsletterInput, toIso } from "@/lib/actions/shared";
import { disableConnector, enableConnector, getConnectorUrl } from "@/lib/connector";
import Newsletter from "@/models/Newsletter";

// guestmail: the universal reservations connector's settings (lib/connector.js).
const GROUP = "Connector";

const ConnectorSchema = z.object({
	enabled: z.boolean(),
	url: z.string().nullable().describe("Where a PMS, booking engine or no-code tool posts each reservation, as JSON. Keep it secret"),
	consentAt: dateOutput,
	lastEventAt: dateOutput,
	events: z.array(z.object({ at: dateOutput, event: z.string(), ok: z.boolean(), email: z.string().nullable(), reservation: z.string().nullable(), error: z.string().nullable() })),
});

function toConnector(newsletter) {
	const connector = newsletter.connector ?? {};
	return {
		enabled: Boolean(connector.token),
		url: connector.token ? getConnectorUrl(connector.token) : null,
		consentAt: toIso(connector.consentAt),
		lastEventAt: toIso(connector.lastEventAt),
		events: [...(connector.events ?? [])].reverse().map((event) => ({
			at: toIso(event.at),
			event: event.event ?? "reservation",
			ok: Boolean(event.ok),
			email: event.email ?? null,
			reservation: event.reservation ?? null,
			error: event.error ?? null,
		})),
	};
}

const getConnector = defineAction({
	name: "get_connector",
	role: "admin",
	tryWithoutPlan: true,
	title: "Get the reservations connector",
	group: GROUP,
	description: "The newsletter's reservations connector: its private URL and the last reservations it received, newest first, without guest data.",
	http: { method: "GET", path: "/connector" },
	readOnly: true,
	input: z.object({ newsletter: newsletterInput }),
	output: ConnectorSchema,
	handler: async ({ account, input }) => toConnector(await findNewsletter(account, input.newsletter, { connector: 1 })),
});

const turnOn = defineAction({
	name: "enable_connector",
	role: "admin",
	title: "Turn on the reservations connector",
	group: GROUP,
	description: "Gives the newsletter a private URL that takes reservations as JSON: each one adds the guest as a contact with the stay. Again, a new URL replaces the old one. consent must be true: the guests it brings were told about your emails and can opt out.",
	http: { method: "POST", path: "/connector" },
	input: z.object({
		newsletter: newsletterInput,
		consent: z.boolean().describe("Must be true: the guests from my reservations were told about my emails and can unsubscribe from each one"),
	}),
	output: ConnectorSchema,
	handler: async ({ account, input }) => {
		if (input.consent !== true) throw actionError("validation_failed", "Confirm that your guests were told about your emails and can unsubscribe");
		const newsletter = await findNewsletter(account, input.newsletter, { _id: 1 });
		await enableConnector(account, newsletter._id);
		return toConnector(await Newsletter.findOne(scoped(account, { _id: newsletter._id })).select({ connector: 1 }).lean());
	},
});

const turnOff = defineAction({
	name: "disable_connector",
	role: "admin",
	whileBlocked: true,
	title: "Turn off the reservations connector",
	group: GROUP,
	description: "Its URL stops working at once. The contacts it added stay.",
	http: { method: "DELETE", path: "/connector" },
	idempotent: true,
	input: z.object({ newsletter: newsletterInput }),
	output: ConnectorSchema,
	handler: async ({ account, input }) => {
		const newsletter = await findNewsletter(account, input.newsletter, { _id: 1 });
		await disableConnector(account, newsletter._id);
		return toConnector({});
	},
});

export const connectorActions = [getConnector, turnOn, turnOff];

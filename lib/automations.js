import "server-only";
import { connectDb } from "@/lib/db";
import { queueCampaign, sendToMoreContacts } from "@/lib/sending";
import Campaign from "@/models/Campaign";

// guestmail: a hotel's automatic emails. Each is an email-only campaign the owner writes like any other, sent to a segment
// of its own: every hour between 9:00 and 20:00 (Madrid), the guests who joined the segment since get it. A campaign
// reaches each contact once, so a guest gets each automatic email once, and its words are set once it starts going out.
// ponytail: once ever, not once a stay or a year. A stamp on the contact per automation (guest.automations.<kind>) read
// by its segment, with a fresh copy of the campaign every ~300 days, sends again to guests who come back, lets the owner
// change the email, and never sends twice at the change (_state/revision_codex.md). Madrid hours for every venue: a
// newsletter timezone when venues outside Spain sign up.
export const AUTOMATIONS = [
	{
		kind: "pre_arrival",
		template: "pre-arrival-extras",
		label: "Before arrival",
		description: "Guests arriving in the next 3 days: dinner, spa and experiences to book ahead.",
		conditions: [{ field: "stay", op: "arriving_in", value: 3 }],
	},
	{
		kind: "post_stay",
		template: "post-stay",
		label: "After the stay",
		description: "Guests who left in the last 2 days: thanks, a review and a reason to come back.",
		conditions: [{ field: "stay", op: "left_in", value: 2 }],
	},
	{
		kind: "birthday",
		template: "celebration",
		label: "Birthday",
		description: "Guests whose birthday is in the next 14 days: an offer to celebrate with you.",
		conditions: [{ field: "birthday", op: "in_next", value: 14 }],
	},
	{
		kind: "win_back",
		template: "direct-booking-return",
		label: "Come back",
		description: "Guests who stayed before but not in the last 12 months, with nothing booked: a reason to return.",
		conditions: [
			{ field: "visits", op: "at_least", value: 1 },
			{ field: "last_visit", op: "not_within", value: 365 },
			{ field: "stay", op: "none_upcoming" },
		],
	},
];
export const AUTOMATION_KINDS = AUTOMATIONS.map(({ kind }) => kind);
const SEND_HOURS = { from: 9, to: 20, timeZone: "Europe/Madrid" };
// A template's square brackets are for the owner: a price, a code, a link. An automation never sends them as they are.
// A bracket followed by "(" is a link's text.
const PLACEHOLDER = /\[[^\][\n]{1,160}\](?!\()/;

export function findPlaceholder(text) {
	return String(text ?? "").match(PLACEHOLDER)?.[0] ?? null;
}

export function getAutomation(kind) {
	return AUTOMATIONS.find((automation) => automation.kind === kind) ?? null;
}

export function isSendingHour(now = new Date()) {
	const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: SEND_HOURS.timeZone }).format(now));
	return hour >= SEND_HOURS.from && hour < SEND_HOURS.to;
}

const QUIET_CODES = new Set(["no_recipients"]);

// Every hour (app/api/cron/hourly): each automation that's on sends to whoever joined its segment since its last run. A
// failure is kept on the automation for its page and tried again next hour. One that's going out or paused waits.
export async function runAutomations(now = new Date()) {
	if (!isSendingHour(now)) return { skipped: "outside sending hours" };
	await connectDb();
	const campaigns = await Campaign.find({ "automation.enabled": true, status: { $in: ["draft", "sent"] } })
		.setOptions({ crossAccount: true })
		.select("accountId status")
		.lean();
	const result = { sent: 0, failed: 0 };
	for (const campaign of campaigns) {
		const one = { accountId: campaign.accountId, _id: campaign._id };
		try {
			const send = campaign.status === "draft" ? queueCampaign : sendToMoreContacts;
			await send({ accountId: campaign.accountId, campaignId: campaign._id });
			result.sent += 1;
			await Campaign.updateOne(one, { $unset: { "automation.problem": 1 } });
		} catch (error) {
			if (QUIET_CODES.has(error.code)) {
				await Campaign.updateOne(one, { $unset: { "automation.problem": 1 } });
				continue;
			}
			result.failed += 1;
			await Campaign.updateOne(one, { $set: { "automation.problem": String(error.message).slice(0, 300) } });
		}
	}
	return result;
}

// guestmail: the actions that put an email in front of contacts. A campaign's send and schedule tools, and those that
// send without being one: approving an autopilot proposal (lib/actions/pilot.js), turning on an automation or a hotel's
// automatic email and adding someone to an automation (lib/actions/automations.js). The MCP server tells an assistant to
// confirm before these, and the website counts them.
const ALSO_SEND = new Set(["decide_proposal", "turn_on_automation", "add_contact_to_automation", "update_hotel_automation"]);

export function isSendAction(action) {
	return Boolean(action.destructive && action.openWorld && (action.group === "Campaigns" || ALSO_SEND.has(action.name)));
}

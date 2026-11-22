// guestmail: the actions that put an email in front of contacts. A campaign's send and schedule tools, and the two that
// send without being one: turning on an automatic email (lib/actions/automations.js) and approving an autopilot proposal
// (lib/actions/pilot.js). The MCP server tells an assistant to confirm before these, and the website counts them.
const ALSO_SEND = new Set(["update_automation", "decide_proposal"]);

export function isSendAction(action) {
	return Boolean(action.destructive && action.openWorld && (action.group === "Campaigns" || ALSO_SEND.has(action.name)));
}

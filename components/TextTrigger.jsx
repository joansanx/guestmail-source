// guestmail: who starts an automation (lib/automation-rules.js TRIGGER_TYPES), in a sentence. campaign: the subject of the
// campaign a click trigger watches.
export default function TextTrigger({ trigger, campaign = "" }) {
	if (trigger.type === "tag") return <>When someone gets the tag {trigger.tag}</>;
	if (trigger.type === "click") return <>When someone clicks a link in {campaign ? `"${campaign}"` : "a campaign"}</>;
	if (trigger.type === "manual") return <>When you add someone by hand</>;
	if (trigger.type === "booking") return <>When a booking comes in</>;
	return <>When someone joins your list</>;
}

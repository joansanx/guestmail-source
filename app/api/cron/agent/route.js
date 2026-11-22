import { withCronSecret } from "@/lib/cron";
import { runAgentRound } from "@/lib/content-agent";
import { runPilotRound } from "@/lib/pilot";

export const dynamic = "force-dynamic";
export const maxDuration = 900;

// guestmail: every few minutes, one step of the content agent for each newsletter that has it on (lib/content-agent.js),
// then one of the autopilot for each that has that on (lib/pilot.js): the campaign its cycle doesn't have yet.
export const GET = withCronSecret(async () => {
	const result = { ...(await runAgentRound()), pilot: await runPilotRound() };
	console.info(`[agent] ${JSON.stringify(result)}`);
	return result;
});

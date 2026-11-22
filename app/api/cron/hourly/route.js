import { announceTelegram } from "@/lib/alerts";
import { runAutomations } from "@/lib/automations";
import { reconcileBillingPauses } from "@/lib/billing-pause";
import { withCronSecret } from "@/lib/cron";
import { recheckDomains } from "@/lib/domains";
import { mendStalledImports } from "@/lib/import-jobs";
import { checkPostshibaStatus } from "@/lib/postshiba-status";
import { queueDueSummaries } from "@/lib/summary-send";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Every hour: PostShiba's word on whether GuestMail can send, Telegram's first message once it's set up, the summary
// emails due this hour in their owners' timezones, the daily look at verified sending domains' DNS records, the
// imports nobody looked at since they stalled, blocked accounts' billing, plans blocked too long included, and guestmail's
// automatic emails (lib/automations.js).
export const GET = withCronSecret(async () => {
	const [postshiba, telegram, summaries, domains, imports, billing, automations] = await Promise.all([
		checkPostshibaStatus(),
		announceTelegram(),
		queueDueSummaries(),
		recheckDomains(),
		mendStalledImports(),
		reconcileBillingPauses(),
		runAutomations().catch((error) => ({ error: error.message })),
	]);
	console.info(`[hourly] ${JSON.stringify({ postshiba, telegram, summaries, domains, imports, billing, automations })}`);
	return { postshiba, telegram, summaries, domains, imports, billing, automations };
});

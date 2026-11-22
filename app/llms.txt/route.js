import { getAppUrl, isCloud } from "@/lib/config";
import { getLlmsIndex } from "@/lib/docs/llms";
import { getSiteIndex } from "@/lib/marketing/content-render";

export const dynamic = "force-static";

// guestmail: on GuestMail Cloud the index ends with the marketing site's pages, each by its twin in Markdown.
export function GET() {
	const index = [getLlmsIndex(getAppUrl()), ...(isCloud() ? [getSiteIndex()] : [])].join("\n");
	return new Response(index, { headers: { "content-type": "text/plain; charset=utf-8" } });
}

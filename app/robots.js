import { AI_AGENTS } from "@/lib/ai-agents";
import { getAppUrl } from "@/lib/config";

// The dashboard and the newsletter setup, the admin, the APIs, apps' consent and tracked links. / stays open: on
// GuestMail Cloud, signed-out visitors get the landing page there. Sign-in stays open too: GuestMail Cloud's is
// indexed, and crawlers read a self-hosted server's noindex. Archive hosts get their own robots.txt (proxy.js).
// guestmail: exported for proxy.js, which sends a signed-out visitor to sign-in from these pages only.
export const PRIVATE_PATHS = [
	"/account",
	"/admin",
	"/api/",
	"/api-keys",
	"/billing",
	"/campaigns",
	"/automations",
	"/contacts",
	"/reputation",
	"/agent",
	"/templates",
	"/integrations",
	"/domains",
	"/mcp",
	"/newsletters",
	"/oauth/",
	"/restore",
	"/welcome",
	"/c/",
	"/o/",
];

export default function robots() {
	return {
		// guestmail: /agents is a public page, which the dashboard's /agent would close with it: the longer rule wins.
		// AI agents are named in the same group as everyone else: a group of their own would replace these rules for
		// them, and open the dashboard and the APIs.
		rules: { userAgent: ["*", ...AI_AGENTS], allow: ["/", "/agents"], disallow: PRIVATE_PATHS },
		sitemap: `${getAppUrl()}/sitemap.xml`,
	};
}

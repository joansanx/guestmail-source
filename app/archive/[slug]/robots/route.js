import { AI_AGENTS } from "@/lib/ai-agents";
import { getArchiveNewsletter } from "@/lib/archive-data";
import { getArchiveUrls } from "@/lib/archive-hosts";

// guestmail: what a newsletter's host serves besides its pages (proxy.js ARCHIVE_HOST_PATHS): the links of its emails,
// each with its reader's token, which a crawler has no business following, and its APIs.
const CLOSED_PATHS = ["/api/", "/c/", "/o/", "/confirm", "/keep", "/unsubscribe"];
// AI agents share everyone's group: one of their own would replace these rules for them.
const RULES = [...["*", ...AI_AGENTS].map((agent) => `User-agent: ${agent}`), "Allow: /", ...CLOSED_PATHS.map((path) => `Disallow: ${path}`)].join("\n");

// Served as /robots.txt on the newsletter's own domain (see proxy.js).
export async function GET(_request, { params }) {
	const newsletter = await getArchiveNewsletter((await params).slug);
	if (!newsletter) return new Response("Not found", { status: 404 });

	const { siteIndex } = getArchiveUrls(newsletter);
	// The newsletter's own domain serves the sitemap as /sitemap.xml; without one it stays under /archive.
	const sitemap = siteIndex.endsWith("/") ? new URL("/sitemap.xml", siteIndex) : `${siteIndex}/sitemap`;
	return new Response(`${RULES}\n\nSitemap: ${sitemap}\n`, {
		headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, s-maxage=86400" },
	});
}

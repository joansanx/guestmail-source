import { getAppUrl, isCloud } from "@/lib/config";
import { DOC_PAGES } from "@/lib/docs/llms";
import { HELP_PATH, getHelpArticles, getHelpHref } from "@/lib/help";
import { listSitemapEntries } from "@/lib/marketing/content";

// The app domain's pages: the docs, the help center, and on GuestMail Cloud its marketing site's. Archive hosts get
// their own sitemap.xml (proxy.js).
export default function sitemap() {
	const appUrl = getAppUrl();
	return [
		// guestmail: the marketing site's pages and its blog's articles are files, listed with the day each was last
		// reviewed (lib/marketing/content.js). The pages are siteExtensions.publicPages, in the same order.
		...(isCloud() ? listSitemapEntries() : []),
		...[...DOC_PAGES.map(({ href }) => href), HELP_PATH, ...getHelpArticles().map(({ slug }) => getHelpHref(slug))].map((path) => ({ path })),
	].map(({ path, updated }) => ({
		url: path === "/" ? appUrl : `${appUrl}${path}`,
		...(updated && { lastModified: updated }),
	}));
}

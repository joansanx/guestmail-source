import { siteExtensions as defaults } from "../site-extensions.js";
import { SOURCE_URL } from "../site.js";
import { ATTRIBUTION_PARAMS } from "./attribution.js";
import { getLegalEntity } from "./legal.js";
import { BLOG_SLUG, LANGS, LEGAL_SLUGS, SITE_PAGES, STRINGS, getPagePath, getTwinRoute, isBlogPath } from "./site-pages.js";

// guestmail: the public site of the hosted version, for hotels and restaurants. next.config.mjs resolves
// @/lib/site-extensions to this file because it exists; what it doesn't set keeps the open source's default.
export const LANDING_PATH = "/landing";

// The header's and the footer's links in one language. siteLinks takes the place of the header's own (Help, API, Sign in).
function getChrome(lang) {
	const strings = STRINGS[lang];
	const link = (slug) => ({ href: getPagePath(lang, slug), label: strings.nav[slug] });
	const homePath = getPagePath(lang, "home");
	return {
		homePath,
		headerLinks: [link("pricing"), link("agents")],
		siteLinks: [
			{ href: "/help", label: strings.help },
			{ href: "/docs", label: strings.api },
			{ href: "/signin", label: strings.signIn },
		],
		headerAction: { href: "/signin", label: strings.start },
		footer: {
			homePath,
			tagline: strings.tagline,
			columns: [
				{
					title: strings.product,
					links: [
						link("pricing"),
						link("agents"),
						link(BLOG_SLUG),
						{ href: "/help", label: strings.help },
						{ href: "/docs", label: strings.apiAndMcp },
						{ href: SOURCE_URL, label: strings.sourceCode, isExternal: true },
						{ href: getPagePath(strings.otherLanguage.lang, "home"), label: strings.otherLanguage.label },
					],
				},
				{ title: strings.legal, links: LEGAL_SLUGS.map(link) },
			],
			// Who runs the service, from the environment (lib/marketing/legal.js). Null without it: the legal pages' build fails then.
			company: getLegalEntity(),
		},
	};
}

export const siteExtensions = {
	...defaults,
	...getChrome("en"),
	// The same header and footer for the site's other languages: HeaderSite and FooterSite take a lang (app/(site-es)).
	langs: Object.fromEntries(LANGS.filter((lang) => lang !== "en").map((lang) => [lang, getChrome(lang)])),
	landingPath: LANDING_PATH,
	// Every page of content/site, in every language; the blog's pages are on the disk, so isPublicPath opens their paths
	// and each page answers 404 for an article that isn't published.
	publicPages: SITE_PAGES,
	isPublicPath: isBlogPath,
	// A public page's twin in Markdown, /pricing.md: where proxy.js renders it.
	getTwinRoute,
	adminLinks: [
		{ href: "/admin/coupons", label: "Coupons" },
		{ href: "/admin/sources", label: "Sources" },
	],
	// Where the paying account came from, on its Checkout session's metadata, so Stripe shows the source of each payment.
	readCheckoutAttribution: async () => {
		const { getCurrentAccount } = await import("@/lib/auth");
		const source = (await getCurrentAccount())?.account?.signupSource ?? {};
		return Object.fromEntries(ATTRIBUTION_PARAMS.filter((key) => source[key]).map((key) => [key, source[key]]));
	},
};

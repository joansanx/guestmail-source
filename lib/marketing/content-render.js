import "server-only";
import { Marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { DELETION_GRACE_DAYS } from "@/lib/account-deletion";
import { MAX_ACTIVE_API_KEYS } from "@/lib/actions/api-keys";
import { TRIAL_CONTACTS } from "@/lib/actions/contacts";
import { canKeyUse } from "@/lib/actions/define-action";
import { CLICK_WINDOW_DAYS } from "@/lib/booking-attribution-rules";
import { ACTIONS } from "@/lib/actions/registry";
import { REQUESTS_PER_KEY } from "@/lib/api/rest";
import { APP_NAME, SUPPORT_EMAIL, areSalesPaused, getAppUrl, isCloud } from "@/lib/config";
import { isSendAction } from "@/lib/send-actions";
import { getMcpClients, getMcpConnectors, getMcpUrl } from "@/lib/docs/mcp-clients";
import { formatUsd } from "@/lib/format";
import { INTERVALS_ON_SALE, PLANS, getIntervalTerms, getPrice } from "@/lib/plans";
import { SOURCE_URL } from "@/lib/site";
import { slugify } from "@/lib/slug";
import { getPage, getPost, listPosts } from "./content.js";
import { PROVIDERS, requireLegalEntity } from "./legal.js";
import { BLOG_SLUG, LANGS, PAGE_SLUGS, STRINGS, getFeedPath, getPagePath, getTwinPath } from "./site-pages.js";

// guestmail: what the pages make of a content file (lib/marketing/content.js): its HTML, its twin in Markdown, its
// metadata and its structured data. Numbers the product decides, like a price or how many tools an agent gets, are
// written in the files as {{tokens}} and filled from the code here, so the site can't say one thing and the app another.
function formatCount(lang, value) {
	return new Intl.NumberFormat(STRINGS[lang].locale).format(value);
}

function formatPrice(lang, value) {
	return lang === "en" ? formatUsd(value) : `${formatCount(lang, value)} USD`;
}

function toTable(head, rows) {
	return [head, head.map(() => "---"), ...rows].map((cells) => `| ${cells.join(" | ")} |`).join("\n");
}

function toCodeList(actions) {
	return actions.map(({ name }) => `\`${name}\``).join(", ");
}

const STARTER = PLANS[0];
const SALES_NOTE = {
	en: "Plans aren't on sale yet: they open soon. Until then you can sign up, set up your venue and write drafts. Imports, sending and your AI agent turn on with a plan.",
	es: "Los planes todavía no están a la venta: saldrán pronto. Mientras tanto puedes darte de alta, configurar tu establecimiento y escribir borradores. La importación, los envíos y tu agente de IA se activan con un plan.",
};
// The tools the MCP server's instructions tell an assistant to confirm first (SEND_TOOLS in lib/mcp/server.js).
const SEND_ACTIONS = ACTIONS.filter(isSendAction);
const TOKENS = {
	legal_name: () => requireLegalEntity().name,
	legal_tax_id: () => requireLegalEntity().taxId,
	legal_address: () => requireLegalEntity().address,
	support_email: () => SUPPORT_EMAIL,
	source_url: () => SOURCE_URL,
	mcp_url: () => getMcpUrl(getAppUrl()),
	deletion_grace_days: () => String(DELETION_GRACE_DAYS),
	// One MCP tool per action, as lib/mcp/server.js registers them for a full access key or a connected app.
	tool_count: (lang) => formatCount(lang, ACTIONS.length),
	read_tool_count: (lang) => formatCount(lang, ACTIONS.filter(({ readOnly }) => readOnly).length),
	signup_tools: () => toCodeList(ACTIONS.filter((action) => canKeyUse("signups", action))),
	send_tools: () => toCodeList(SEND_ACTIONS),
	send_tool_count: () => String(SEND_ACTIONS.length),
	// While plans are off sale (SALES_PAUSED), the pages say so instead of sending people to buy what they can't.
	sales_note: (lang) => (areSalesPaused() ? SALES_NOTE[lang] : ""),
	// The assistants whose setup the docs cover (/docs/mcp).
	client_count: () => String(getMcpConnectors(getAppUrl()).length + getMcpClients(getAppUrl()).length),
	max_api_keys: () => String(MAX_ACTIVE_API_KEYS),
	requests_per_minute: () => String(REQUESTS_PER_KEY.limit),
	trial_contacts: () => String(TRIAL_CONTACTS.limit),
	// guestmail: how long after a click a booking counts for a campaign (lib/booking-attribution-rules.js).
	click_window_days: () => String(CLICK_WINDOW_DAYS),
	starter_price: (lang) => formatPrice(lang, STARTER.monthlyPrice),
	starter_quarter: (lang) => formatPrice(lang, getPrice(STARTER, "quarter")),
	starter_emails: (lang) => formatCount(lang, STARTER.emailsPerMonth),
	starter_contacts: (lang) => formatCount(lang, STARTER.subscribers),
	plans: (lang) => {
		const { plan, emails, contacts, perMonth, perQuarter, upTo } = STRINGS[lang].plans;
		const rows = PLANS.map((item) => [
			item.name,
			formatCount(lang, item.emailsPerMonth),
			`${upTo} ${formatCount(lang, item.subscribers)}`,
			formatPrice(lang, item.monthlyPrice),
			formatPrice(lang, getPrice(item, "quarter")),
		]);
		return toTable([plan, emails, contacts, perMonth, perQuarter], rows);
	},
	providers: (lang) => {
		const { name, role, data, place } = STRINGS[lang].providers;
		return toTable([name, role, data, place], PROVIDERS.map((provider) => [provider.name, provider.role[lang], provider.data[lang], provider.place[lang]]));
	},
};

// On a page of the site, a token nobody defined is a typo: it throws instead of reaching the page as {{braces}}. An
// article can write braces of its own, like the {{first_name}} of a campaign it explains, so there they stay as written.
export function fillTokens(text, lang, { isArticle = false } = {}) {
	return String(text).replace(/\{\{(\w+)\}\}/g, (written, name) => {
		if (TOKENS[name]) return TOKENS[name](lang);
		if (isArticle) return written;
		throw new Error(`Unknown token {{${name}}} in the site's content (lib/marketing/content-render.js lists them)`);
	});
}

function fillFor(doc) {
	return (text) => fillTokens(text, doc.lang, { isArticle: doc.kind === "blog" });
}

// Headings get an id from their words, so a link can point at a section.
const marked = new Marked(
	{ gfm: true, async: false },
	{
		renderer: {
			heading({ tokens, depth, text }) {
				return `<h${depth} id="${slugify(text, 60)}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
			},
		},
	}
);

function fillDoc(doc) {
	const fill = fillFor(doc);
	return {
		...doc,
		title: fill(doc.title),
		description: fill(doc.description),
		body: fill(doc.body),
		faq: (doc.faq ?? []).map(({ q, a }) => ({ q: fill(q), a: fill(a) })),
		sources: doc.sources ?? [],
	};
}

// A page or an article ready to show, tokens filled. Null where getPost has none; getPage throws instead.
export function readPage(lang, slug) {
	return fillDoc(getPage(lang, slug));
}

export function readPost(lang, slug) {
	const post = getPost(lang, slug);
	return post && fillDoc(post);
}

// Markdown can carry HTML of its own, and the blog's files are written by a robot: what a file renders to is cleaned
// before it reaches a page of the app's own origin. No scripts, no handlers, links to the web and to email only.
const CLEAN = {
	allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
	allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, "*": ["id"] },
	allowedSchemes: ["http", "https", "mailto"],
	allowProtocolRelative: false,
};

export function toHtml(markdown) {
	return sanitizeHtml(marked.parse(markdown), CLEAN);
}

// The landing and the pricing page have sections with a design of their own. Their words still come from the body:
// what's before the first h2, then each h2 with its paragraphs, its h3s (each with the paragraph under it) and its
// list items, as HTML. A table is left to the page, which draws its own.
export function readSections(doc) {
	const inline = (text) => sanitizeHtml(marked.parseInline(text), CLEAN);
	const sections = [{ title: null, paragraphs: [], items: [], list: [] }];
	for (const token of marked.lexer(doc.body)) {
		const section = sections.at(-1);
		if (token.type === "heading" && token.depth === 2) sections.push({ title: token.text, paragraphs: [], items: [], list: [] });
		else if (token.type === "heading" && token.depth === 3) section.items.push({ title: token.text, html: "" });
		else if (token.type === "paragraph" && section.items.length > 0) section.items.at(-1).html += inline(token.text);
		else if (token.type === "paragraph") section.paragraphs.push(inline(token.text));
		else if (token.type === "list") section.list.push(...token.items.map((item) => inline(item.text)));
	}
	return sections;
}

export function formatDay(lang, day) {
	return new Date(`${day}T00:00:00Z`).toLocaleDateString(STRINGS[lang].locale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

// A title that names GuestMail stands alone; the rest get the app's "· GuestMail" (app/layout.js). Each page names its
// other language for search engines, with English as the default, and its twin in Markdown. It takes a file as read,
// and fills the title and the description only: a route's metadata is read without rendering the page.
export function getContentMetadata(doc) {
	const other = LANGS.find((lang) => lang !== doc.lang);
	const english = doc.lang === "en" ? doc.path : doc.translation;
	const fill = fillFor(doc);
	const title = fill(doc.title);
	return {
		title: title.includes(APP_NAME) ? { absolute: title } : title,
		description: fill(doc.description),
		alternates: {
			canonical: doc.path,
			...(doc.translation && { languages: { [doc.lang]: doc.path, [other]: doc.translation, "x-default": english } }),
			types: { "text/markdown": getTwinPath(doc.path) },
		},
	};
}

function toUrl(path) {
	return path === "/" ? getAppUrl() : `${getAppUrl()}${path}`;
}

// Who GuestMail is: the company and the product, the same two nodes on every page of the site. Each has one @id, so
// a page's other nodes point at them and no page describes a second GuestMail. The price is the plans' own
// (lib/plans.js): from the cheapest plan's price for a month to the dearest one's, billed for as many months at a time
// as the interval on sale has. No aggregateRating: GuestMail has no reviews. No sameAs: it has no profile anywhere else yet.
export function getEntityNodes(lang) {
	const appUrl = getAppUrl();
	const organizationId = `${appUrl}/#organization`;
	const prices = PLANS.map((plan) => plan.monthlyPrice);
	return [
		{ "@type": "Organization", "@id": organizationId, name: APP_NAME, url: appUrl, logo: `${appUrl}/icon-512.png` },
		{
			"@type": "SoftwareApplication",
			"@id": `${appUrl}/#software`,
			name: APP_NAME,
			url: appUrl,
			description: STRINGS[lang].tagline,
			applicationCategory: "BusinessApplication",
			operatingSystem: "Web",
			publisher: { "@id": organizationId },
			// No offer while plans are off sale (SALES_PAUSED): structured data never announces what can't be bought.
			...(!areSalesPaused() && { offers: {
				"@type": "AggregateOffer",
				url: toUrl(getPagePath(lang, "pricing")),
				priceCurrency: "USD",
				lowPrice: Math.min(...prices),
				highPrice: Math.max(...prices),
				offerCount: PLANS.length,
				// The cheapest plan's price for a month, charged for a quarter at a time.
				priceSpecification: {
					"@type": "UnitPriceSpecification",
					price: Math.min(...prices),
					priceCurrency: "USD",
					unitCode: "MON",
					billingIncrement: getIntervalTerms(INTERVALS_ON_SALE[0]).months,
				},
			} }),
		},
	];
}

// One graph per page: who GuestMail is, the questions exactly as the page shows them, and for an article, what it is
// and where it sits.
export function getStructuredData(doc, { crumbs = [], isArticle = false } = {}) {
	const [organization, software] = getEntityNodes(doc.lang);
	const publisher = { "@id": organization["@id"] };
	const graph = [
		organization,
		software,
		isArticle && {
			"@type": "Article",
			headline: doc.title,
			description: doc.description,
			datePublished: doc.date,
			dateModified: doc.updated,
			inLanguage: doc.lang,
			mainEntityOfPage: toUrl(doc.path),
			author: publisher,
			publisher,
		},
		crumbs.length > 0 && {
			"@type": "BreadcrumbList",
			itemListElement: [...crumbs, { label: doc.title, href: doc.path }].map(({ label, href }, index) => ({
				"@type": "ListItem",
				position: index + 1,
				name: label,
				...(href && { item: toUrl(href) }),
			})),
		},
		doc.faq.length > 0 && {
			"@type": "FAQPage",
			// The site's own pages are about GuestMail; an article is about its topic, which its header doesn't name.
			...(!isArticle && { about: { "@id": software["@id"] } }),
			mainEntity: doc.faq.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
		},
	].filter(Boolean);
	return { "@context": "https://schema.org", "@graph": graph };
}

// The page as plain Markdown, for answer engines and agents: the same words the HTML page shows, in the same order,
// with its links made absolute so they still lead somewhere once the text is read away from the site.
export function toTwin(doc, { posts = [] } = {}) {
	const strings = STRINGS[doc.lang];
	const appUrl = getAppUrl();
	return [
		`# ${doc.title}`,
		`> ${doc.description}`,
		doc.body.replaceAll("](/", `](${appUrl}/`),
		posts.map((post) => `- [${post.title}](${appUrl}${getTwinPath(post.path)}): ${post.description}`).join("\n"),
		doc.faq.length > 0 && [`## ${strings.faq}`, ...doc.faq.map(({ q, a }) => `### ${q}\n\n${a}`)].join("\n\n"),
		doc.sources.length > 0 &&
			[`## ${strings.sources}`, doc.sources.map(({ title, url, checked }) => `- [${title}](${url})${checked ? ` (${checked})` : ""}`).join("\n")].join("\n\n"),
		"---",
		`${strings.twin} ${toUrl(doc.path)}. ${strings.updated}: ${doc.updated}.`,
	]
		.filter(Boolean)
		.join("\n\n")
		.concat("\n");
}

// The twin behind /md/<segments> (proxy.js sends /pricing.md there): a page, the blog's list or an article. Null for
// anything else, a draft included.
export function getTwin(segments) {
	const [lang, ...rest] = LANGS.includes(segments[0]) && segments[0] !== "en" ? segments : ["en", ...segments];
	const [first, second, ...more] = rest;
	if (more.length > 0) return null;
	if (second === undefined) {
		if (first === undefined || first === "index") return toTwin(readPage(lang, "home"));
		if (first === BLOG_SLUG) return toTwin(readPage(lang, BLOG_SLUG), { posts: listPosts(lang) });
		return PAGE_SLUGS.includes(first) && first !== "home" ? toTwin(readPage(lang, first)) : null;
	}
	const post = first === BLOG_SLUG ? readPost(lang, second) : null;
	return post && toTwin(post);
}

// What /llms.txt says about the marketing site: where each page's Markdown is, in each language.
export function getSiteIndex() {
	const appUrl = getAppUrl();
	const pages = LANGS.flatMap((lang) => PAGE_SLUGS.map((slug) => getPage(lang, slug)));
	return [
		"## The site in Markdown",
		"",
		`Every page of GuestMail's site, in English and in Spanish, has a twin in plain Markdown at the same address with .md, and so does every article of its blog (${appUrl}${getTwinPath(getPagePath("en", BLOG_SLUG))}).`,
		"",
		...pages.map(({ title, description, path, lang }) => `- [${fillTokens(title, lang)}](${appUrl}${getTwinPath(path)}) (${lang}): ${fillTokens(description, lang)}`),
		"",
	].join("\n");
}

function escapeXml(text) {
	return String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

// The blog's feed in one language, RSS 2.0, published articles only.
export function toFeed(lang) {
	const blog = readPage(lang, BLOG_SLUG);
	const items = listPosts(lang).map(
		(post) =>
			`<item><title>${escapeXml(post.title)}</title><link>${toUrl(post.path)}</link><guid>${toUrl(post.path)}</guid><pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate><description>${escapeXml(post.description)}</description></item>`
	);
	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>',
		`<title>${escapeXml(blog.title)}</title><link>${toUrl(blog.path)}</link><description>${escapeXml(blog.description)}</description><language>${lang}</language>`,
		`<atom:link href="${toUrl(getFeedPath(lang))}" rel="self" type="application/rss+xml"/>`,
		...items,
		"</channel></rss>",
	].join("\n");
}

// What the two text routes answer. Neither is a page of its own for a search engine: the twin is another form of its
// page, so it stays out of the index and out of the sitemap.
function respond(body, type, headers = {}) {
	if (!isCloud() || !body) return new Response("Not found", { status: 404 });
	return new Response(body, { headers: { "content-type": `${type}; charset=utf-8`, "cache-control": "public, max-age=300", ...headers } });
}

export function respondTwin(segments) {
	return respond(isCloud() ? getTwin(segments) : null, "text/markdown", { "x-robots-tag": "noindex" });
}

export function respondFeed(lang) {
	return respond(isCloud() ? toFeed(lang) : null, "application/rss+xml");
}

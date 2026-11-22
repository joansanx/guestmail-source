// guestmail: the public site's pages, their addresses and the words around them (buttons, labels). The pages' own words
// are the Markdown files of content/, which lib/marketing/content.js reads. Nothing here touches the disk: proxy.js and
// the dashboard's bundles reach this module through lib/marketing/site-extensions.js.
export const LANGS = ["en", "es"];
export const LEGAL_SLUGS = ["terms", "privacy", "acceptable-use", "ai", "legal-notice", "dpa", "subprocessors", "cookies"];
// content/site/<lang>/<slug>.md, in the sitemap's order. "home" is the landing page, at / and /es.
export const PAGE_SLUGS = ["home", "pricing", "agents", ...LEGAL_SLUGS];
// The blog's index has its words in content/site/<lang>/blog.md too, and is only listed once it has an article.
export const BLOG_SLUG = "blog";

// English at the root, as before there was another language; the rest under their code. No redirect picks one for the
// visitor: each address is one language, whatever the browser asks for.
export function getLangPrefix(lang) {
	return lang === "en" ? "" : `/${lang}`;
}

export function getPagePath(lang, slug) {
	return slug === "home" ? getLangPrefix(lang) || "/" : `${getLangPrefix(lang)}/${slug}`;
}

export function getPostPath(lang, slug) {
	return `${getLangPrefix(lang)}/${BLOG_SLUG}/${slug}`;
}

export function getFeedPath(lang) {
	return `${getLangPrefix(lang)}/${BLOG_SLUG}/rss.xml`;
}

// A page's twin in plain Markdown: the same address with .md, and /index.md for a home page.
export function getTwinPath(path) {
	return LANGS.some((lang) => getPagePath(lang, "home") === path) ? `${path === "/" ? "" : path}/index.md` : `${path}.md`;
}

export const SITE_PAGES = LANGS.flatMap((lang) => PAGE_SLUGS.map((slug) => getPagePath(lang, slug)));

const BLOG_PATH_PATTERN = new RegExp(`^(?:/(?:${LANGS.filter((lang) => lang !== "en").join("|")}))?/${BLOG_SLUG}(?:/(?:rss\\.xml|[a-z0-9][a-z0-9-]*))?$`);

// The blog's index, articles and feeds: which ones exist is on the disk, so the page answers 404 for the rest.
export function isBlogPath(pathname) {
	return BLOG_PATH_PATTERN.test(pathname);
}

// Where a twin is served from: /pricing.md is /md/pricing, one route for all of them (app/(site)/md). Null for
// anything that isn't the twin of a public page.
export function getTwinRoute(pathname) {
	if (!pathname.endsWith(".md")) return null;
	const page = pathname.slice(0, -3);
	const path = page.replace(/\/index$/, "") || "/";
	return SITE_PAGES.includes(path) || (isBlogPath(path) && !path.endsWith(".xml")) ? `/md${page}` : null;
}

// The words the site's own markup needs, per language. A page's text never goes here.
export const STRINGS = {
	en: {
		locale: "en-US",
		tagline: "Email marketing for hotels and restaurants.",
		nav: {
			pricing: "Pricing",
			agents: "AI agents",
			blog: "Blog",
			terms: "Terms",
			privacy: "Privacy",
			"acceptable-use": "Acceptable use",
			ai: "Terms of AI",
			"legal-notice": "Legal notice",
			dpa: "Data processing",
			subprocessors: "Subprocessors",
			cookies: "Cookies",
		},
		help: "Help",
		api: "API",
		apiAndMcp: "API and MCP",
		signIn: "Sign in",
		sourceCode: "Source code",
		product: "Product",
		legal: "Legal",
		home: "Home",
		start: "Get started",
		seePricing: "See pricing",
		otherLanguage: { lang: "es", label: "Español" },
		updated: "Last updated",
		published: "Published",
		reviewed: "Reviewed",
		faq: "Questions about GuestMail",
		faqArticle: "Frequently asked questions",
		sources: "Sources",
		noPosts: "The first articles are being written.",
		demo: { note: "Sample data from a made-up hotel." },
		plans: { plan: "Plan", emails: "Emails a month", contacts: "Active contacts", perMonth: "Per month", perQuarter: "Billed each quarter", upTo: "up to", contactsShort: "contacts" },
		providers: { name: "Provider", role: "What for", data: "Data it handles", place: "Where" },
		twin: "This is the text version of",
	},
	es: {
		locale: "es-ES",
		tagline: "Email marketing para hoteles y restaurantes.",
		nav: {
			pricing: "Precios",
			agents: "Agentes de IA",
			blog: "Blog",
			terms: "Términos",
			privacy: "Privacidad",
			"acceptable-use": "Uso aceptable",
			ai: "Términos de IA",
			"legal-notice": "Aviso legal",
			dpa: "Encargo del tratamiento",
			subprocessors: "Subencargados",
			cookies: "Cookies",
		},
		help: "Ayuda",
		api: "API",
		apiAndMcp: "API y MCP",
		signIn: "Entrar",
		sourceCode: "Código fuente",
		product: "Producto",
		legal: "Legal",
		home: "Inicio",
		start: "Empezar",
		seePricing: "Ver precios",
		otherLanguage: { lang: "en", label: "English" },
		updated: "Última actualización",
		published: "Publicado",
		reviewed: "Revisado",
		faq: "Preguntas sobre GuestMail",
		faqArticle: "Preguntas frecuentes",
		sources: "Fuentes",
		noPosts: "Los primeros artículos están en preparación.",
		demo: { note: "Datos de ejemplo de un hotel inventado." },
		plans: { plan: "Plan", emails: "Emails al mes", contacts: "Contactos activos", perMonth: "Al mes", perQuarter: "Cobro por trimestre", upTo: "hasta", contactsShort: "contactos" },
		providers: { name: "Proveedor", role: "Para qué", data: "Datos que trata", place: "Dónde" },
		twin: "Esta es la versión en texto de",
	},
};

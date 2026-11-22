import Link from "next/link";
import { notFound } from "next/navigation";
import { PROSE } from "@/components/ArticleHelp";
import ArticleContent from "@/components/marketing/ArticleContent";
import ScriptJsonLd from "@/components/ScriptJsonLd";
import {
	SectionAgents,
	SectionDemo,
	SectionFaq,
	SectionFeatures,
	SectionHero,
	SectionPricing,
	SectionText,
} from "@/components/marketing/SectionsLanding";
import { isCloud } from "@/lib/config";
import { getPage, getPost, listPosts } from "@/lib/marketing/content";
import { formatDay, getContentMetadata, getStructuredData, readPage, readPost, readSections, toHtml } from "@/lib/marketing/content-render";
import { BLOG_SLUG, LEGAL_SLUGS, STRINGS, getFeedPath, getPagePath } from "@/lib/marketing/site-pages";
import { cn } from "@/lib/utils";

// guestmail: the public site's pages, each drawn from its Markdown file (content/, lib/marketing/content.js). The route
// files in app/(site) and app/(site-es) only say which page and which language. A self-hosted server has none of them:
// proxy.js already answers 404 for the ones it knows by name, and this does for the rest.
function requireCloud() {
	if (!isCloud()) notFound();
}

export function getSiteMetadata(lang, slug) {
	return getContentMetadata(getPage(lang, slug));
}

// The landing page reads its file as a lead and a line about the price, then three sections in this order: what
// GuestMail gives (an h3 and a paragraph each), agents (a paragraph, the tools as a list, the links on), and the plans
// (a paragraph, the list of what every plan has). A file in another shape stops the build here.
export function PageLanding({ lang }) {
	requireCloud();
	const doc = readPage(lang, "home");
	const strings = STRINGS[lang];
	const [intro, features, agents, pricing, ...more] = readSections(doc);
	if (!pricing || more.length > 0 || intro.paragraphs.length !== 2 || features.items.length === 0 || agents.list.length === 0 || pricing.list.length === 0) {
		throw new Error(`content/site/${lang}/home.md isn't in the shape the landing page reads (components/marketing/PagesSite.jsx)`);
	}
	const [lead, price] = intro.paragraphs;
	return (
		<main lang={lang} className="flex flex-col gap-20 py-14 sm:gap-24 sm:py-20">
			<SectionHero title={doc.title} lead={lead} price={price} strings={strings} pricingHref={getPagePath(lang, "pricing")} />
			<SectionDemo strings={strings} />
			<SectionFeatures section={features} />
			<SectionAgents section={agents} />
			<SectionPricing section={pricing} strings={strings} lang={lang} />
			<SectionFaq faq={doc.faq} strings={strings} />
			<ScriptJsonLd data={getStructuredData(doc)} />
		</main>
	);
}

// The pricing page: what's before its first h2 around the table of plans, then each section as plain words.
export function PagePricing({ lang }) {
	requireCloud();
	const doc = readPage(lang, "pricing");
	const strings = STRINGS[lang];
	const [intro, ...sections] = readSections(doc);
	return (
		<main lang={lang} className="flex flex-col gap-20 py-14 sm:py-20">
			<SectionPricing section={intro} title={doc.title} strings={strings} lang={lang} headingLevel="h1" />
			{sections.map((section) => (
				<SectionText key={section.title} section={section} />
			))}
			<SectionFaq faq={doc.faq} strings={strings} />
			<ScriptJsonLd data={getStructuredData(doc)} />
		</main>
	);
}

// Any other page of the site, as an article. The legal ones sit under Legal and end without a call to action.
export function PageArticle({ lang, slug }) {
	requireCloud();
	const isLegal = LEGAL_SLUGS.includes(slug);
	return <ArticleContent doc={readPage(lang, slug)} section={isLegal ? { label: STRINGS[lang].legal } : null} hasAction={!isLegal} />;
}

export function PageSite({ lang, slug }) {
	if (slug === "home") return <PageLanding lang={lang} />;
	if (slug === "pricing") return <PagePricing lang={lang} />;
	return <PageArticle lang={lang} slug={slug} />;
}

// A blog without an article yet stays out of search engines, and out of the sitemap (listSitemapEntries).
export function getBlogMetadata(lang) {
	const metadata = getSiteMetadata(lang, BLOG_SLUG);
	return {
		...metadata,
		...(listPosts(lang).length === 0 && { robots: { index: false, follow: true } }),
		alternates: { ...metadata.alternates, types: { ...metadata.alternates.types, "application/rss+xml": getFeedPath(lang) } },
	};
}

export function PageBlog({ lang }) {
	requireCloud();
	const doc = readPage(lang, BLOG_SLUG);
	const strings = STRINGS[lang];
	const posts = listPosts(lang);
	return (
		<main lang={lang} className="mx-auto max-w-(--site-width) px-4 py-10 sm:px-6 lg:px-8">
			<div className="max-w-2xl pb-24">
				<nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
					<Link href={getPagePath(lang, "home")} className="transition-colors duration-150 hover:text-foreground">
						{strings.home}
					</Link>
					<span aria-hidden="true">/</span>
					<span>{strings.nav.blog}</span>
				</nav>
				<h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{doc.title}</h1>
				<div className={cn(PROSE, "mt-6")} dangerouslySetInnerHTML={{ __html: toHtml(doc.body) }} />
				{posts.length === 0 ? (
					<p className="mt-10 text-sm text-muted-foreground">{strings.noPosts}</p>
				) : (
					<ul className="mt-10 flex flex-col divide-y divide-border/60">
						{posts.map((post) => (
							<li key={post.slug} className="flex flex-col gap-1.5 py-5">
								<h2 className="text-lg font-semibold tracking-tight text-balance">
									<Link href={post.path} className="hover:underline hover:underline-offset-4">
										{post.title}
									</Link>
								</h2>
								<p className="text-[15px] leading-6 text-pretty text-muted-foreground">{post.description}</p>
								<time dateTime={post.date} className="text-xs text-muted-foreground">
									{formatDay(lang, post.date)}
								</time>
							</li>
						))}
					</ul>
				)}
			</div>
		</main>
	);
}

// A draft, or an article that doesn't exist, answers 404 from its metadata on.
function requirePost(lang, slug) {
	requireCloud();
	return readPost(lang, slug) ?? notFound();
}

export function getPostMetadata(lang, slug) {
	requireCloud();
	return getContentMetadata(getPost(lang, slug) ?? notFound());
}

export function PagePost({ lang, slug }) {
	const strings = STRINGS[lang];
	return <ArticleContent doc={requirePost(lang, slug)} section={{ label: strings.nav.blog, href: getPagePath(lang, BLOG_SLUG) }} isArticle />;
}

export function getPostParams(lang) {
	return listPosts(lang).map(({ slug }) => ({ slug }));
}

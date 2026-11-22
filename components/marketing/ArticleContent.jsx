import { Fragment } from "react";
import Link from "next/link";
import { PROSE } from "@/components/ArticleHelp";
import { ButtonsStart, ListFaq } from "@/components/marketing/SectionsLanding";
import ScriptJsonLd from "@/components/ScriptJsonLd";
import { formatDay, getStructuredData, toHtml } from "@/lib/marketing/content-render";
import { STRINGS, getPagePath } from "@/lib/marketing/site-pages";
import { cn } from "@/lib/utils";

const CRUMB_LINK = "transition-colors duration-150 hover:text-foreground";

// guestmail: a page or an article written in Markdown (content/), with the help articles' typography: where it sits,
// its title, its dates, its words, then its questions as answers that open in place, its sources and a way to start.
// section: the crumb between the home and the title, as { label, href }. isArticle: a blog's, with both its dates.
export default function ArticleContent({ doc, section, isArticle = false, hasAction = true, children }) {
	const strings = STRINGS[doc.lang];
	const crumbs = [{ label: strings.home, href: getPagePath(doc.lang, "home") }, ...(section ? [section] : [])];
	const dates = isArticle
		? [
				{ label: strings.published, day: doc.date },
				{ label: strings.reviewed, day: doc.updated },
			]
		: [{ label: strings.updated, day: doc.updated }];

	return (
		<main lang={doc.lang} className="mx-auto max-w-(--site-width) px-4 py-10 sm:px-6 lg:px-8">
			<article className="max-w-2xl pb-24">
				<nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
					{crumbs.map(({ label, href }) => (
						<Fragment key={label}>
							{href ? (
								<Link href={href} className={CRUMB_LINK}>
									{label}
								</Link>
							) : (
								<span>{label}</span>
							)}
							<span aria-hidden="true">/</span>
						</Fragment>
					))}
					<span>{doc.title}</span>
				</nav>
				<h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{doc.title}</h1>
				<p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
					{dates.map(({ label, day }) => (
						<span key={label}>
							{label}: <time dateTime={day}>{formatDay(doc.lang, day)}</time>
						</span>
					))}
					{doc.translation && (
						<Link href={doc.translation} hrefLang={strings.otherLanguage.lang} className="underline underline-offset-4 hover:text-foreground">
							{strings.otherLanguage.label}
						</Link>
					)}
				</p>
				<div className={cn(PROSE, "mt-10")} dangerouslySetInnerHTML={{ __html: toHtml(doc.body) }} />
				{children}
				{doc.faq.length > 0 && (
					<section className="mt-14 flex flex-col gap-5">
						<h2 className="text-xl font-semibold tracking-tight">{isArticle ? strings.faqArticle : strings.faq}</h2>
						<ListFaq faq={doc.faq} />
					</section>
				)}
				{doc.sources.length > 0 && (
					<section className={cn(PROSE, "mt-14")}>
						<h2>{strings.sources}</h2>
						<ul>
							{doc.sources.map(({ title, url, checked }) => (
								<li key={url}>
									<a href={url} rel="noopener">
										{title}
									</a>
									{checked && ` (${formatDay(doc.lang, checked)})`}
								</li>
							))}
						</ul>
					</section>
				)}
				{hasAction && (
					<div className="mt-14">
						<ButtonsStart strings={strings} pricingHref={getPagePath(doc.lang, "pricing")} />
					</div>
				)}
			</article>
			<ScriptJsonLd data={getStructuredData(doc, { crumbs: crumbs.every(({ href }) => href) ? crumbs : [], isArticle })} />
		</main>
	);
}

import Link from "next/link";
import { ArrowRight, Check, ChevronDown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS, getPrice } from "@/lib/plans";

// guestmail: the sections of the public site (the landing and the pricing page, in each language). Their words come
// from the page's Markdown file, as lib/marketing/content-render.js reads its sections; strings are the few words of
// the markup itself (lib/marketing/site-pages.js). Server components only: no script ships for them, so the pages load
// as plain HTML and CSS.
const WIDTH = "mx-auto w-full max-w-(--site-width) px-4 sm:px-6 lg:px-8";
const HEADING = "font-display text-3xl leading-[1.1] font-[480] tracking-[-0.02em] text-balance sm:text-4xl";
const CARD = "rounded-xl bg-card shadow-border";
const TEXT = "max-w-2xl text-[15px] leading-6 text-pretty text-muted-foreground";
const LINKS = "[&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-foreground";
const CODE = "[&_code]:mr-1.5 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_code]:text-foreground";

// A paragraph or a list item of a content file, already HTML: the repository's own files, never a visitor's words.
function Html({ as: Tag = "p", html, className }) {
	return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function ButtonsStart({ strings, pricingHref }) {
	return (
		<div className="flex flex-wrap items-center gap-3">
			<Button asChild size="lg">
				<Link href="/signin">
					{strings.start} <ArrowRight data-icon="inline-end" />
				</Link>
			</Button>
			{pricingHref && (
				<Button asChild size="lg" variant="outline">
					<Link href={pricingHref}>{strings.seePricing}</Link>
				</Button>
			)}
		</div>
	);
}

// The landing's top: the page's title, its first paragraph, the way in, and its line about the price.
export function SectionHero({ title, lead, price, strings, pricingHref }) {
	return (
		<section className={`${WIDTH} flex flex-col gap-6`}>
			<h1 className="max-w-3xl font-display text-[2.6rem] leading-[1.04] font-[480] tracking-[-0.03em] text-balance sm:text-6xl">{title}</h1>
			<Html html={lead} className={`max-w-2xl text-lg leading-7 text-pretty text-muted-foreground ${LINKS}`} />
			<ButtonsStart strings={strings} pricingHref={pricingHref} />
			<Html html={price} className="text-sm text-muted-foreground" />
		</section>
	);
}

// What the product looks like, drawn with a venue that doesn't exist: three of its screens, side by side on a
// computer and one under the other on a phone. The screens stay in English in every language, as the dashboard is.
export function SectionDemo({ strings }) {
	const { demo } = strings;
	return (
		<section aria-label={demo.label} className={`${WIDTH} flex flex-col gap-3`}>
			<p className="text-xs text-muted-foreground">{demo.note}</p>
			<div className="grid gap-4 lg:grid-cols-3">
			<figure className={`${CARD} flex flex-col gap-3 p-5`}>
				<figcaption className="text-xs font-medium text-muted-foreground">{demo.reputation}</figcaption>
				<p className="flex items-center gap-2 text-sm">
					<Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
					<span className="font-semibold tabular-nums">4.7</span>
					<span className="text-muted-foreground">1,234 reviews on Google Maps</span>
				</p>
				<blockquote className="border-l-2 border-border pl-3 text-sm leading-relaxed text-pretty text-muted-foreground">
					“Breakfast on the terrace was the best part of our week, and the staff knew our names from the first morning.”
					<span className="mt-1.5 block text-xs text-foreground">Ana G. · Recommended · 5 stars · mentions breakfast and staff</span>
				</blockquote>
				<span className="mt-auto inline-flex h-9 items-center justify-center rounded-lg bg-foreground px-3 text-sm font-medium text-background">
					Draft a campaign with 3
				</span>
			</figure>
			<figure className={`${CARD} flex flex-col gap-3 p-5`}>
				<figcaption className="text-xs font-medium text-muted-foreground">{demo.popup}</figcaption>
				<p className="text-lg font-semibold tracking-tight">10% off your next stay</p>
				<span className="flex gap-2">
					<span className="flex h-10 min-w-0 flex-1 items-center rounded-lg border border-border px-3 text-sm text-muted-foreground">you@example.com</span>
					<span className="inline-flex h-10 items-center rounded-lg bg-foreground px-4 text-sm font-medium text-background">Subscribe</span>
				</span>
				<span className="mt-auto rounded-lg border border-dashed border-border px-3.5 py-3 text-sm">
					10% off your next stay
					<span className="mt-1 block font-mono text-lg font-semibold tracking-wider">GUEST10-7K2P9Q</span>
				</span>
			</figure>
			<figure className={`${CARD} flex flex-col gap-3 p-5`}>
				<figcaption className="text-xs font-medium text-muted-foreground">{demo.guest}</figcaption>
				<p className="flex flex-col text-sm">
					<span className="font-medium">ana@example.com</span>
					<span className="text-xs text-muted-foreground">Ana · Stays and reservations 2</span>
				</p>
				<ul className="flex flex-col divide-y divide-border/60 text-sm">
					{[
						{ dates: "Sep 1 to Sep 4, 2026", detail: "Stay · direct · Double" },
						{ dates: "Mar 12 to Mar 14, 2026", detail: "Stay · booking.com · Double" },
					].map((visit) => (
						<li key={visit.dates} className="flex flex-col gap-0.5 py-2.5">
							<span className="font-medium tabular-nums">{visit.dates}</span>
							<span className="text-xs text-muted-foreground">{visit.detail}</span>
						</li>
					))}
				</ul>
				<span className="mt-auto text-xs text-muted-foreground">Segment: last visit in the last 90 days</span>
			</figure>
			</div>
		</section>
	);
}

export function SectionFeatures({ section }) {
	return (
		<section className={`${WIDTH} flex flex-col gap-8`}>
			<h2 className={HEADING}>{section.title}</h2>
			<ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
				{section.items.map(({ title, html }) => (
					<li key={title} className="flex flex-col gap-1.5">
						<h3 className="font-semibold tracking-tight">{title}</h3>
						<Html html={html} className={`text-[15px] leading-6 text-pretty text-muted-foreground ${LINKS}`} />
					</li>
				))}
			</ul>
		</section>
	);
}

// Its first paragraph, the tools as a list, then the paragraphs that lead on: to the agents' page and to the docs.
export function SectionAgents({ section }) {
	const [text, ...more] = section.paragraphs;
	return (
		<section className={`${WIDTH} flex flex-col gap-6`}>
			<h2 className={HEADING}>{section.title}</h2>
			<Html html={text} className={`${TEXT} ${LINKS}`} />
			<ul className={`${CARD} divide-y divide-border/60`}>
				{section.list.map((html) => (
					<Html key={html} as="li" html={html} className={`px-4 py-3 text-sm text-muted-foreground ${CODE}`} />
				))}
			</ul>
			{more.map((html) => (
				<Html key={html} html={html} className={`text-sm text-muted-foreground ${LINKS}`} />
			))}
		</section>
	);
}

// The same plans whatever the size of the list, each billed for a quarter at a time. The table is drawn from the plans
// themselves; the file's {{plans}} is the same table, for the page's twin in Markdown.
export function SectionPricing({ section, title = section.title, strings, lang, headingLevel: Heading = "h2" }) {
	const { plans } = strings;
	const number = new Intl.NumberFormat(strings.locale);
	const price = (value) => (lang === "en" ? `$${number.format(value)}` : `${number.format(value)} USD`);
	return (
		<section className={`${WIDTH} flex flex-col gap-6`}>
			<Heading className={HEADING}>{title}</Heading>
			{section.paragraphs.map((html) => (
				<Html key={html} html={html} className={`${TEXT} ${LINKS}`} />
			))}
			<div className={CARD}>
				<table className="w-full text-left text-sm tabular-nums">
					<thead className="text-xs text-muted-foreground">
						<tr className="border-b border-border/60">
							<th className="px-4 py-3 font-medium">{plans.plan}</th>
							<th className="px-4 py-3 font-medium">{plans.emails}</th>
							<th className="hidden px-4 py-3 font-medium sm:table-cell">{plans.contacts}</th>
							<th className="px-4 py-3 text-right font-medium">{plans.perMonth}</th>
							<th className="hidden px-4 py-3 text-right font-medium sm:table-cell">{plans.perQuarter}</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border/60">
						{PLANS.map((plan) => (
							<tr key={plan.id}>
								<th scope="row" className="px-4 py-3 font-medium">
									{plan.name}
								</th>
								<td className="px-4 py-3">
									{number.format(plan.emailsPerMonth)}
									<span className="block text-xs text-muted-foreground sm:hidden">
										{plans.upTo} {number.format(plan.subscribers)} {plans.contactsShort}
									</span>
								</td>
								<td className="hidden px-4 py-3 sm:table-cell">
									{plans.upTo} {number.format(plan.subscribers)}
								</td>
								<td className="px-4 py-3 text-right font-medium">{price(plan.monthlyPrice)}</td>
								<td className="hidden px-4 py-3 text-right text-muted-foreground sm:table-cell">{price(getPrice(plan, "quarter"))}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<ul className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
				{section.list.map((html) => (
					<li key={html} className="flex items-center gap-2">
						<Check className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
						<Html as="span" html={html} />
					</li>
				))}
			</ul>
			<ButtonsStart strings={strings} />
		</section>
	);
}

// A section of plain words: its heading, its paragraphs and its list.
export function SectionText({ section }) {
	return (
		<section className={`${WIDTH} flex flex-col gap-4`}>
			<h2 className={HEADING}>{section.title}</h2>
			{section.paragraphs.map((html) => (
				<Html key={html} html={html} className={`${TEXT} ${LINKS}`} />
			))}
			{section.list.length > 0 && (
				<ul className={`${TEXT} flex list-disc flex-col gap-1.5 pl-5 ${LINKS}`}>
					{section.list.map((html) => (
						<Html key={html} as="li" html={html} />
					))}
				</ul>
			)}
		</section>
	);
}

// Answers that open in place, with the browser's own details element: no script, and each answer is in the page
// whether it's open or not. The page's structured data repeats them word for word (getStructuredData).
export function ListFaq({ faq }) {
	return (
		<div className={`${CARD} divide-y divide-border/60`}>
			{faq.map(({ q, a }) => (
				<details key={q} className="group px-4">
					<summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
						<h3 className="font-medium">{q}</h3>
						<ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
					</summary>
					<p className="max-w-3xl pb-4 text-[15px] leading-6 text-pretty text-muted-foreground">{a}</p>
				</details>
			))}
		</div>
	);
}

export function SectionFaq({ faq, strings }) {
	return (
		<section className={`${WIDTH} flex flex-col gap-6`}>
			<h2 className={HEADING}>{strings.faq}</h2>
			<ListFaq faq={faq} />
		</section>
	);
}

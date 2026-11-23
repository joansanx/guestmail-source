import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, ChevronDown } from "lucide-react";
import { DEMO_ICONS, DEMO_PANELS, FEATURE_VISUALS } from "@/components/marketing/DemoLanding";
import GalleryTemplates from "@/components/marketing/GalleryTemplates";
import TabsPage, { PanelTab } from "@/components/TabsPage";
import { Button } from "@/components/ui/button";
import { getAppUrl } from "@/lib/config";
import { getMcpClients, getMcpConnectors } from "@/lib/docs/mcp-clients";
import { DEMO_TABS, getDemo } from "@/lib/marketing/landing-demo";
import { DEMO_VENUES, listLandingTemplates } from "@/lib/marketing/landing-templates";
import { PLANS, getPrice } from "@/lib/plans";
import { findStockPhoto, getStockPhotoUrl } from "@/lib/stock-photos";
import { cn } from "@/lib/utils";

// guestmail: the sections of the public site (the landing and the pricing page, in each language). Their words come
// from the page's Markdown file, as lib/marketing/content-render.js reads its sections; strings are the few words of
// the markup itself (lib/marketing/site-pages.js). Server components: the only script they ship is the demo's tabs
// (components/TabsPage.jsx) and the gallery's filter and dialog (components/marketing/GalleryTemplates.jsx), and every tab's
// panel and every card is in the HTML. The landing's sections are centered; the pricing page's stay as they were.
const WIDTH = "mx-auto w-full max-w-(--site-width) px-4 sm:px-6 lg:px-8";
const HEADING = "font-display text-3xl leading-[1.1] font-[480] tracking-[-0.02em] text-balance sm:text-4xl";
const CARD = "rounded-xl bg-card shadow-border";
const TEXT = "max-w-2xl text-[15px] leading-6 text-pretty text-muted-foreground";
const CENTERED = "mx-auto text-center";
// The landing's sections under the sticky header when the header's links lead to them.
const ANCHORED = "scroll-mt-20";
// The hero's photo, behind a dark veil that keeps white text above AA on any part of it.
const HERO_PHOTO = "terrace-sea";
const LINKS = "[&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-foreground";
const CODE = "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_code]:text-foreground";
// A feature's link to its help article, on a line of its own under its words.
const HELP_LINK = "[&_a]:mt-2 [&_a]:block [&_a]:w-fit [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4";

// A paragraph or a list item of a content file, already HTML: the repository's own files, never a visitor's words.
function Html({ as: Tag = "p", html, className }) {
	return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function ButtonsStart({ strings, pricingHref, className }) {
	return (
		<div className={cn("flex flex-wrap items-center gap-3", className)}>
			<Button asChild size="lg" className="rounded-full px-5">
				<Link href="/signin">
					{strings.start} <ArrowRight data-icon="inline-end" />
				</Link>
			</Button>
			{pricingHref && (
				<Button asChild size="lg" variant="outline" className="rounded-full px-5">
					<Link href={pricingHref}>{strings.seePricing}</Link>
				</Button>
			)}
		</div>
	);
}

// The landing's top, across the whole width over a photo: the page's title, its first paragraph, the way in, a demo,
// and its line about the price. Under it, a line that leads to the demos a visitor can subscribe to.
export function SectionHero({ title, lead, price, strip, strings }) {
	const demos = `#${strings.anchors.demos}`;
	return (
		<section className="flex flex-col">
			<div className="relative isolate flex min-h-[34rem] items-center justify-center overflow-hidden px-4 py-20 sm:min-h-[40rem] sm:px-6 lg:px-8">
				<Image src={getStockPhotoUrl(findStockPhoto(HERO_PHOTO), "")} alt="" fill sizes="100vw" fetchPriority="high" className="-z-20 object-cover" />
				<div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/60" />
				<div className="flex max-w-3xl flex-col items-center gap-6 text-center text-white">
					<h1 className="font-display text-[2.6rem] leading-[1.04] font-[480] tracking-[-0.03em] text-balance sm:text-6xl">{title}</h1>
					<Html html={lead} className="max-w-2xl text-lg leading-7 text-pretty text-white/90 [&_a]:underline [&_a]:underline-offset-4" />
					<div className="flex flex-wrap items-center justify-center gap-3">
						<Button asChild size="lg" className="rounded-full bg-white px-5 text-neutral-950 hover:bg-white/90 dark:bg-white dark:text-neutral-950 dark:hover:bg-white/90">
							<Link href="/signin">
								{strings.start} <ArrowRight data-icon="inline-end" />
							</Link>
						</Button>
						<Button
							asChild
							size="lg"
							variant="outline"
							className="rounded-full border-white/70 bg-transparent px-5 text-white hover:bg-white/10 hover:text-white dark:border-white/70 dark:bg-transparent dark:hover:bg-white/10"
						>
							<a href={demos}>{strings.seeDemo}</a>
						</Button>
					</div>
					<Html html={price} className="max-w-2xl text-sm text-pretty text-white/90" />
				</div>
			</div>
			<p className="border-b border-border/60 bg-card px-4 py-4 text-center text-[15px] leading-6 text-pretty">
				<Html as="span" html={strip} />{" "}
				<a href={demos} className="inline-flex items-center gap-1 font-medium whitespace-nowrap underline underline-offset-4">
					{strings.seeDemos} <ArrowRight className="size-3.5" aria-hidden="true" />
				</a>
			</p>
		</section>
	);
}

// The demo: a tab for each h3 of the section, its paragraph above the screen it opens (components/marketing/DemoLanding.jsx),
// every panel in the server's HTML. Then the section's own paragraph, that an agent can do all of it, and the AI
// assistants the docs set up (/docs/mcp), by name.
export function SectionDemo({ section, strings, lang }) {
	const demo = getDemo(lang);
	const tabs = section.items.map(({ title }, index) => ({ value: DEMO_TABS[index], label: title, icon: DEMO_ICONS[DEMO_TABS[index]] }));
	const clients = [...getMcpConnectors(getAppUrl()), ...getMcpClients(getAppUrl())].map(({ name }) => name);
	return (
		<section aria-labelledby="demo" className={`${WIDTH} flex flex-col gap-6`}>
			<h2 id="demo" className={`${HEADING} text-center`}>
				{section.title}
			</h2>
			<TabsPage tabs={tabs} className="gap-5 [&_[role=tablist]]:justify-center-safe">
				{section.items.map(({ title, html }, index) => {
					const Panel = DEMO_PANELS[DEMO_TABS[index]];
					return (
						<PanelTab key={title} value={DEMO_TABS[index]} className="flex flex-col gap-4">
							<Html html={html} className={`${TEXT} ${CENTERED} ${LINKS} ${CODE} sm:min-h-18`} />
							<Panel demo={demo} />
						</PanelTab>
					);
				})}
			</TabsPage>
			<p className="text-center text-xs text-muted-foreground">{strings.demo.note}</p>
			<div className="mt-4 flex flex-col items-center gap-3 text-center">
				<Html html={section.paragraphs[0]} className={`text-lg leading-7 font-medium text-pretty ${LINKS}`} />
				<ul className="flex flex-wrap justify-center gap-2">
					{clients.map((name) => (
						<li key={name} className="rounded-full bg-card px-3 py-1 text-sm text-muted-foreground shadow-border">
							{name}
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}

// The gallery of designs as the demo venues would send them: the section's first paragraph above it, its second, that
// the venues are made up, under it.
export function SectionTemplates({ section, strings, lang }) {
	const [line, note] = section.paragraphs;
	return (
		<section id={strings.anchors.templates} className={`${WIDTH} ${ANCHORED} flex flex-col items-center gap-8`}>
			<div className="flex flex-col items-center gap-3 text-center">
				<h2 className={HEADING}>{section.title}</h2>
				<Html html={line} className={`${TEXT} ${LINKS}`} />
			</div>
			<GalleryTemplates templates={listLandingTemplates(lang)} strings={strings.templates} />
			<Html html={note} className="max-w-2xl text-center text-xs text-pretty text-muted-foreground" />
		</section>
	);
}

// A card per h3, one per demo venue (DEMO_VENUES, in its order): its photo, the word Demo, its line and a way to its
// website. Then the section's paragraph, on what subscribing there does.
export function SectionDemos({ section, strings, lang }) {
	return (
		<section id={strings.anchors.demos} className={`${WIDTH} ${ANCHORED} flex flex-col items-center gap-8`}>
			<h2 className={`${HEADING} text-center`}>{section.title}</h2>
			<ul className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
				{section.items.map(({ title, html }, index) => {
					const venue = DEMO_VENUES[index];
					const photo = findStockPhoto(venue.photo);
					return (
						<li key={title} className={`${CARD} flex flex-col overflow-hidden`}>
							<div className="relative aspect-[3/2]">
								<Image src={getStockPhotoUrl(photo, "")} alt={photo.alt[lang]} fill sizes="(min-width: 768px) 34rem, 100vw" className="object-cover" />
								<span className="absolute top-4 left-4 rounded-full bg-white px-3 py-1 text-xs font-semibold tracking-wide text-neutral-950 uppercase shadow-sm">{strings.demoVenue.label}</span>
							</div>
							<div className="flex flex-1 flex-col items-center gap-3 p-6 text-center">
								<h3 className="text-xl font-semibold tracking-tight">{title}</h3>
								<Html html={html} className="text-[15px] leading-6 text-pretty text-muted-foreground" />
								<Button asChild size="lg" className="mt-2 rounded-full px-5">
									<a href={venue.url} aria-label={`${strings.demoVenue.visit}: ${title}`}>
										{strings.demoVenue.visit} <ArrowUpRight data-icon="inline-end" />
									</a>
								</Button>
							</div>
						</li>
					);
				})}
			</ul>
			<Html html={section.paragraphs[0]} className={`${TEXT} text-center ${LINKS}`} />
		</section>
	);
}

// A card per h3, with its small screen on top, in the section's order (FEATURE_VISUALS).
export function SectionFeatures({ section, strings, lang }) {
	const demo = getDemo(lang);
	return (
		<section className={`${WIDTH} flex flex-col gap-8`}>
			<div className="flex flex-col items-center gap-2 text-center">
				<h2 className={HEADING}>{section.title}</h2>
				<p className="text-xs text-muted-foreground">{strings.demo.note}</p>
			</div>
			<ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{section.items.map(({ title, html }, index) => {
					const Visual = FEATURE_VISUALS[index];
					return (
						<li key={title} className={`${CARD} flex min-w-0 flex-col gap-4 p-3`}>
							<Visual demo={demo} />
							<div className="flex flex-col gap-1.5 px-1 pb-1">
								<h3 className="font-semibold tracking-tight">{title}</h3>
								<Html html={html} className={`text-sm leading-6 text-pretty text-muted-foreground ${HELP_LINK}`} />
							</div>
						</li>
					);
				})}
			</ul>
		</section>
	);
}

// On a dark band: its first paragraph, then a tile per item, each an assistant doing one thing with the tool it uses
// (the item's bold name, its words, its code), then the paragraphs that lead on.
export function SectionAgents({ section }) {
	const [text, ...more] = section.paragraphs;
	return (
		<section className={WIDTH}>
			<div className="flex flex-col gap-8 rounded-2xl bg-foreground p-6 text-background sm:p-10">
				<div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
					<h2 className={HEADING}>{section.title}</h2>
					<Html html={text} className="text-[15px] leading-6 text-pretty text-background/70" />
				</div>
				<ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{section.list.map((html) => (
						<Html
							key={html}
							as="li"
							html={html}
							className="flex flex-col gap-2 rounded-xl bg-background/[0.06] p-4 text-[15px] leading-6 ring-1 ring-background/10 [&_code]:mt-auto [&_code]:w-fit [&_code]:rounded-md [&_code]:bg-background/10 [&_code]:px-2 [&_code]:py-1 [&_code]:font-mono [&_code]:text-[13px] [&_strong]:text-xs [&_strong]:font-medium [&_strong]:text-background/60"
						/>
					))}
				</ul>
				{more.map((html) => (
					<Html key={html} html={html} className="mx-auto max-w-2xl text-center text-sm text-pretty text-background/70 [&_a]:text-background [&_a]:underline [&_a]:underline-offset-4" />
				))}
			</div>
		</section>
	);
}

// The same plans whatever the size of the list, each billed for a quarter at a time. The table is drawn from the plans
// themselves; the file's {{plans}} is the same table, for the page's twin in Markdown.
export function SectionPricing({ section, title = section.title, strings, lang, headingLevel: Heading = "h2", isCentered = false }) {
	const { plans } = strings;
	const number = new Intl.NumberFormat(strings.locale);
	const price = (value) => (lang === "en" ? `$${number.format(value)}` : `${number.format(value)} USD`);
	return (
		<section className={`${WIDTH} flex flex-col gap-6`}>
			<Heading className={cn(HEADING, isCentered && "text-center")}>{title}</Heading>
			{section.paragraphs.map((html) => (
				<Html key={html} html={html} className={cn(TEXT, LINKS, isCentered && CENTERED)} />
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
			<ButtonsStart strings={strings} className={cn(isCentered && "justify-center")} />
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

// The page's last word: its heading, its paragraph and the way in.
export function SectionClosing({ section, strings, pricingHref }) {
	return (
		<section className={`${WIDTH} flex flex-col items-center gap-5 text-center`}>
			<h2 className={HEADING}>{section.title}</h2>
			{section.paragraphs.map((html) => (
				<Html key={html} html={html} className={`${TEXT} ${LINKS}`} />
			))}
			<ButtonsStart strings={strings} pricingHref={pricingHref} className="justify-center" />
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

export function SectionFaq({ faq, strings, isCentered = false }) {
	return (
		<section className={`${WIDTH} flex flex-col gap-6`}>
			<h2 className={cn(HEADING, isCentered && "text-center")}>{strings.faq}</h2>
			<div className={cn(isCentered && "mx-auto w-full max-w-3xl")}>
				<ListFaq faq={faq} />
			</div>
		</section>
	);
}

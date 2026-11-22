import { notFound } from "next/navigation";
import { Check, Gift } from "lucide-react";
import AvatarNewsletter from "@/components/AvatarNewsletter";
import CardIssue from "@/components/CardIssue";
import FormSubscribe from "@/components/FormSubscribe";
import NoticePrivacy from "@/components/NoticePrivacy";
import { getSiteNotice } from "@/lib/archive-notice";
import LinksSocial from "@/components/LinksSocial";
import ScriptJsonLd from "@/components/ScriptJsonLd";
import { countReaders, getArchiveNewsletter, listArchiveIssues } from "@/lib/archive-data";
import { getArchiveUrls } from "@/lib/archive-hosts";
import { getHomeSeo, isHomeIndexed } from "@/lib/archive-seo";
import { formatNumber } from "@/lib/format";
import { getLandingCopy } from "@/lib/landing";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

export function generateStaticParams() {
	return [];
}

export async function generateMetadata({ params }) {
	const newsletter = await getArchiveNewsletter((await params).slug);
	if (!newsletter) return {};
	// guestmail: a landing without issues yet stays out of search engines, so it never counts as an empty page.
	return { ...getHomeSeo(newsletter).metadata, ...(!isHomeIndexed(newsletter) && { robots: { index: false, follow: true } }) };
}

export default async function ArchivePage({ params }) {
	const newsletter = await getArchiveNewsletter((await params).slug);
	if (!newsletter) notFound();

	const [issues, readers] = await Promise.all([
		listArchiveIssues(newsletter),
		countReaders(newsletter),
	]);
	const urls = getArchiveUrls(newsletter);
	const landing = getLandingCopy(newsletter);
	const pinned = issues.filter((issue) => issue.archivePinned);
	const latest = pinned.length > 0 ? null : issues[0];
	const rest = pinned.length > 0 ? issues.filter((issue) => !issue.archivePinned) : issues.slice(1);

	return (
		<>
			<ScriptJsonLd data={getHomeSeo(newsletter).jsonLd} />
			<section className="relative isolate overflow-hidden">
				<div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-dots" />
				<div className="mx-auto flex max-w-2xl flex-col items-center px-5 pt-16 pb-14 text-center sm:pt-24 sm:pb-20">
					<AvatarNewsletter
						newsletter={newsletter}
						size={72}
						className="rounded-2xl shadow-[0_8px_24px_-8px_rgb(0_0_0/0.25)] animate-enter"
					/>
					{landing.kicker && (
						<p style={{ "--stagger": 1 }} className="mt-6 text-sm font-medium tracking-wide text-muted-foreground uppercase animate-enter">
							{landing.kicker}
						</p>
					)}
					<h1 style={{ "--stagger": 1 }} className={cn("text-4xl font-theme-heading animate-enter sm:text-5xl", landing.kicker ? "mt-2" : "mt-6")}>
						{newsletter.name}
					</h1>
					{landing.about && (
						<p
							style={{ "--stagger": 2 }}
							className="mt-4 max-w-xl text-lg text-muted-foreground text-balance animate-enter"
						>
							{landing.about}
						</p>
					)}
					{landing.offer && (
						<div style={{ "--stagger": 3 }} className="mt-8 flex w-full max-w-md items-start gap-3 rounded-2xl bg-card p-4 text-left shadow-border animate-enter">
							<span className="grid size-10 shrink-0 place-items-center rounded-full bg-foreground text-background">
								<Gift className="size-5" aria-hidden="true" />
							</span>
							<span className="flex flex-col">
								<span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{landing.offer.title}</span>
								<span className="text-base font-semibold text-pretty">{landing.offer.text}</span>
								<span className="text-sm text-muted-foreground">{landing.offer.note}</span>
							</span>
						</div>
					)}
					<div
						id="subscribe"
						style={{ "--stagger": 3 }}
						className={cn("w-full max-w-md scroll-mt-24 animate-enter", landing.offer ? "mt-3" : "mt-8")}
					>
						<FormSubscribe newsletterSlug={newsletter.slug} labels={landing.form} />
						<NoticePrivacy notice={getSiteNotice(newsletter)} className="mt-3 text-left" />
					</div>
					{landing.benefits.length > 0 && (
						<ul style={{ "--stagger": 4 }} className="mt-6 flex flex-col items-start gap-2 text-left text-sm text-muted-foreground animate-enter sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-5">
							{landing.benefits.map((benefit) => (
								<li key={benefit} className="flex items-center gap-1.5">
									<Check className="size-3.5 text-foreground" aria-hidden="true" /> {benefit}
								</li>
							))}
						</ul>
					)}
					<div style={{ "--stagger": 4 }} className="mt-4 flex flex-col items-center gap-4 animate-enter">
						{readers >= 100 && (
							<p className="text-sm text-muted-foreground tabular-nums">
								Join {formatNumber(readers)} readers. Free, unsubscribe anytime.
							</p>
						)}
						<LinksSocial links={newsletter.socialLinks} />
					</div>
				</div>
			</section>

			{pinned.length > 0 && (
				<section style={{ "--stagger": 5 }} className={cn("mx-auto max-w-5xl px-5 animate-enter", rest.length === 0 && "pb-24")}>
					<h2 className="mb-6 text-sm font-medium text-muted-foreground">Featured</h2>
					<ol className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
						{pinned.map((issue, index) => (
							<li key={issue._id.toString()}>
								<CardIssue
									issue={issue}
									newsletter={newsletter}
									href={urls.post(issue.archiveSlug)}
									isEager={index === 0}
								/>
							</li>
						))}
					</ol>
				</section>
			)}

			{latest && (
				<section style={{ "--stagger": 5 }} className={cn("mx-auto max-w-5xl px-5 animate-enter", rest.length === 0 && "pb-24")}>
					<h2 className="mb-4 text-sm font-medium text-muted-foreground">Latest issue</h2>
					<CardIssue
						issue={latest}
						newsletter={newsletter}
						href={urls.post(latest.archiveSlug)}
						isFeatured
						isEager
					/>
				</section>
			)}

			{issues.length === 0 && <p className="mx-auto max-w-md px-5 pb-24 text-center text-sm text-pretty text-muted-foreground">{landing.soon}</p>}

			{rest.length > 0 && (
				<section className="mx-auto max-w-5xl px-5 pt-20 pb-24">
					<h2 className="mb-6 border-b border-border/60 pb-4 text-sm font-medium text-muted-foreground">
						All issues
					</h2>
					<ol className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
						{rest.map((issue) => (
							<li key={issue._id.toString()}>
								<CardIssue issue={issue} newsletter={newsletter} href={urls.post(issue.archiveSlug)} />
							</li>
						))}
					</ol>
				</section>
			)}
		</>
	);
}

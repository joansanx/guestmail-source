import AvatarNewsletter from "@/components/AvatarNewsletter";
import LinksSocial from "@/components/LinksSocial";
import PickerMode from "@/components/PickerMode";
import { getAppUrl, isCloud } from "@/lib/config";
import { currentYear } from "@/lib/format";
import { getLandingLanguage } from "@/lib/landing";
import { POWERED_BY, getPoweredByUrl } from "@/lib/marketing/attribution";

export default function FooterArchive({ newsletter, indexHref }) {
	return (
		<footer className="border-t border-border/60">
			<div className="mx-auto grid max-w-5xl gap-6 px-5 pt-10 pb-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
				<div className="flex flex-col gap-3">
					<a href={indexHref} className="flex items-center gap-2.5 font-medium tracking-tight [font-family:var(--theme-font-heading)]">
						<AvatarNewsletter newsletter={newsletter} size={28} />
						{newsletter.name}
					</a>
					{newsletter.description && (
						<p className="max-w-sm text-sm text-muted-foreground text-pretty">{newsletter.description}</p>
					)}
				</div>
				<LinksSocial links={newsletter.socialLinks} className="-ml-2.5 sm:-mr-2.5 sm:ml-0" />
			</div>
			<div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 pb-10">
				<p className="text-xs text-muted-foreground tabular-nums">
					© {currentYear()} {newsletter.name}
					{isCloud() && (
						<>
							{" · "}
							<a href={getPoweredByUrl(getAppUrl(), { slug: newsletter.slug, medium: "website" })} className="underline-offset-4 hover:text-foreground hover:underline">
								{POWERED_BY[getLandingLanguage(newsletter)].made} · {POWERED_BY[getLandingLanguage(newsletter)].create}
							</a>
						</>
					)}
				</p>
				<PickerMode />
			</div>
		</footer>
	);
}

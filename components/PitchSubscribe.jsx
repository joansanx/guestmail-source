import AvatarNewsletter from "@/components/AvatarNewsletter";
import FormSubscribe from "@/components/FormSubscribe";
import NoticePrivacy from "@/components/NoticePrivacy";
import { formatNumber } from "@/lib/format";

// A handful of readers makes weak social proof, so small lists get the name instead.
const MIN_READERS_SHOWN = 100;

// guestmail: labels and form (lib/landing.js getSiteLabels and getLandingCopy) in the venue's language; English without them.
export default function PitchSubscribe({ newsletter, readers, labels, form, titleAs: Title = "h2" }) {
	return (
		<div className="flex flex-col items-center text-center">
			<AvatarNewsletter newsletter={newsletter} size={48} className="rounded-xl" />
			<Title className="mt-4 text-xl font-theme-heading text-balance">
				{readers >= MIN_READERS_SHOWN
					? (labels?.join ?? "Join {n} readers").replace("{n}", formatNumber(readers))
					: (labels?.subscribeTo ?? "Subscribe to {name}").replace("{name}", newsletter.name)}
			</Title>
			{newsletter.description && (
				<p className="mt-2 max-w-sm text-muted-foreground text-pretty">{newsletter.description}</p>
			)}
			<FormSubscribe newsletterSlug={newsletter.slug} labels={form} className="mt-6 max-w-sm" />
			<NoticePrivacy notice={newsletter.notice} className="mt-3 max-w-sm text-left" />
		</div>
	);
}

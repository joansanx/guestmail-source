import { cn } from "@/lib/utils";

// guestmail: the first layer of data protection information under a subscribe form (lib/venue-legal.js getPrivacyNotice):
// who is responsible, what for, that the person has rights, and the link to the rest.
export default function NoticePrivacy({ notice, className }) {
	if (!notice) return null;
	return (
		<p className={cn("text-[11px] leading-relaxed text-pretty text-muted-foreground", className)}>
			{notice.text}{" "}
			{notice.more && (
				<a href={notice.more.href} className="underline underline-offset-2 hover:text-foreground">
					{notice.more.label}
				</a>
			)}
		</p>
	);
}

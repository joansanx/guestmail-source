import { cn } from "@/lib/utils";

// guestmail: the first layer of data protection information under a subscribe form (lib/venue-legal.js getPrivacyNotice):
// who is responsible, what for, on what basis, who else gets the data, the person's rights and where to read more.
export default function NoticePrivacy({ notice, className }) {
	if (!notice) return null;
	return (
		<p className={cn("text-[11px] leading-relaxed text-pretty text-muted-foreground", className)}>
			{notice.lines.map(([label, text]) => (
				<span key={label}>
					<span className="font-medium">{label}:</span> {text}{" "}
				</span>
			))}
			{notice.more && (
				<>
					<a href={notice.more.href} className="underline underline-offset-2 hover:text-foreground">
						{notice.more.label}
					</a>
					.{" "}
				</>
			)}
			{notice.age}
		</p>
	);
}

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { listLiveSegments } from "@/lib/segment-queries";
import { findSegmentSuggestions } from "@/lib/segment-suggestions";

// guestmail: on the contacts list, a line saying which segments GuestMail would make from them, with a way to the
// suggestions. Nothing when there's none worth making.
export default async function NoticeSegmentSuggestions({ account, newsletterId }) {
	const suggestions = await findSegmentSuggestions(account, newsletterId, await listLiveSegments(account, newsletterId));
	if (suggestions.length === 0) return null;
	const examples = suggestions
		.slice(0, 2)
		.map(({ name, contacts }) => `${name} (${formatNumber(contacts)})`)
		.join(" and ");
	return (
		<Link
			href="/contacts/segments"
			className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm shadow-border transition-colors duration-150 hover:bg-muted/40"
		>
			<Sparkles className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
			<span className="flex-1 text-pretty">
				GuestMail found {suggestions.length === 1 ? "a segment" : `${suggestions.length} segments`} worth making from your contacts, like{" "}
				{examples}.
			</span>
			<span className="flex shrink-0 items-center gap-1 font-medium">
				See them <ArrowRight className="size-4" aria-hidden="true" />
			</span>
		</Link>
	);
}

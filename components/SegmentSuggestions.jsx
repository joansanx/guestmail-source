"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { saveSegment } from "@/app/(app)/contacts/actions";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import { toast } from "@/lib/toast";

// guestmail: the segments GuestMail proposes from the newsletter's contacts (lib/segment-suggestions.js), each with what
// it's for, its rule in a sentence and how many it picks now. One click makes it; nothing is sent.
export default function SegmentSuggestions({ newsletterId, suggestions }) {
	const router = useRouter();
	const [creating, setCreating] = useState(null);
	const [isPending, startTransition] = useTransition();

	function create(suggestion) {
		setCreating(suggestion.id);
		startTransition(async () => {
			const result = await saveSegment(null, {
				newsletterId,
				name: suggestion.name,
				...suggestion.rules,
			});
			setCreating(null);
			if (result?.error) return void toast.error(result.error);
			toast.success(`${suggestion.name} created`);
			router.refresh();
		});
	}

	return (
		<section aria-labelledby="suggested-segments" className="flex flex-col gap-3">
			<div className="flex items-center gap-2">
				<Sparkles className="size-4 text-muted-foreground" aria-hidden="true" />
				<h2 id="suggested-segments" className="text-sm font-medium">
					Suggested for your contacts
				</h2>
			</div>
			<ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
				{suggestions.map((suggestion, index) => (
					<li key={suggestion.id} style={{ "--stagger": index }} className="animate-enter">
						<div className="flex h-full flex-col gap-3 rounded-xl p-4 shadow-border">
							<div className="flex items-start justify-between gap-3">
								<span className="font-medium text-pretty">{suggestion.name}</span>
								<span className="shrink-0 text-sm text-muted-foreground tabular-nums">{formatNumber(suggestion.contacts)}</span>
							</div>
							<p className="text-sm text-pretty">{suggestion.why}</p>
							<p className="text-xs text-pretty text-muted-foreground">{suggestion.description}</p>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="mt-auto self-start"
								disabled={isPending}
								onClick={() => create(suggestion)}
							>
								{creating === suggestion.id ? (
									<Loader2 className="size-4 animate-spin" aria-hidden="true" />
								) : (
									<Plus className="size-4" aria-hidden="true" />
								)}
								Create segment
							</Button>
						</div>
					</li>
				))}
			</ul>
		</section>
	);
}

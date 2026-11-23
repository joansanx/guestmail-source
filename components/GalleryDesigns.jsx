"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { draftFromTemplate } from "@/app/(app)/templates/actions";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

// The email is laid out at its full width and shown at this share of it: a page 240px wide.
const EMAIL_WIDTH = 600;
const SCALE = 0.4;
const SHOWN_HEIGHT = 280;

// guestmail: the designs a venue starts a campaign from (lib/campaign-designs.js), on the Templates page and in the New
// campaign dialog: each one's email in small, as it would go out in the newsletter's own theme and with its name
// (lib/design-gallery.js), and a button that makes a draft of it, which opens in the editor. designs: { id, title, when,
// preview }, in language, the one the draft is written in.
export default function GalleryDesigns({ newsletterId, designs, language, className }) {
	const router = useRouter();
	const [pending, setPending] = useState(null);
	const [, startUsing] = useTransition();

	function use(id) {
		setPending(id);
		startUsing(async () => {
			const result = await draftFromTemplate(newsletterId, id, language);
			if (result?.error) {
				setPending(null);
				return void toast.error(result.error);
			}
			router.push(`/campaigns/${result.id}`);
		});
	}

	return (
		<ul className={cn("grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3", className)}>
			{designs.map((design) => (
				<li key={design.id} className="flex flex-col overflow-hidden rounded-xl bg-card shadow-border">
					<EmailThumbnail title={design.title} html={design.preview} />
					<div className="flex flex-1 flex-col gap-2 p-4">
						<p className="text-sm font-medium text-pretty">{design.title}</p>
						<p className="flex-1 text-xs text-muted-foreground">{design.when}</p>
						<Button size="sm" variant="outline" className="self-start" disabled={pending !== null} onClick={() => use(design.id)}>
							{pending === design.id && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />} Use this design
						</Button>
					</div>
				</li>
			))}
		</ul>
	);
}

// An email in small, its top part, for a gallery card: the designs' here and the text templates' (components/PanelTemplates.jsx).
export function EmailThumbnail({ title, html }) {
	return (
		<div aria-hidden="true" className="flex justify-center border-b border-border/60 bg-muted/60 pt-4">
			<div style={{ width: EMAIL_WIDTH * SCALE, height: SHOWN_HEIGHT }} className="overflow-hidden rounded-t-md bg-white shadow-border">
				{/* Without allow-scripts nothing in it runs, and same origin loads the theme's fonts. */}
				<iframe
					title={title}
					srcDoc={html}
					sandbox="allow-same-origin"
					loading="lazy"
					tabIndex={-1}
					style={{ width: EMAIL_WIDTH, height: SHOWN_HEIGHT / SCALE, transform: `scale(${SCALE})` }}
					className="pointer-events-none origin-top-left border-0"
				/>
			</div>
		</div>
	);
}

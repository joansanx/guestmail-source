"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { draftFromTemplate } from "@/app/(app)/templates/actions";
import GalleryDesigns from "@/components/GalleryDesigns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const KINDS = { hotel: "Hotel", restaurant: "Restaurant", other: "Other business" };
const LANGUAGES = { en: "English", es: "Español" };

// guestmail: revenue templates (lib/campaign-templates.js). One click makes a draft with the venue's name and booking
// link filled in; square brackets are what's left to fill. gallery: { designs, language }, the venue's designs with
// photos (components/GalleryDesigns.jsx), which come first, or { error } when they couldn't be listed.
export default function PanelTemplates({ newsletterId, templates, goals, defaultKind, defaultLanguage, gallery }) {
	const router = useRouter();
	const [kind, setKind] = useState(defaultKind);
	const [language, setLanguage] = useState(defaultLanguage);
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
		<div className="flex flex-col gap-6">
			<section aria-labelledby="designs-title" className="flex flex-col gap-3">
				<h2 id="designs-title" className="text-sm font-medium">
					Designs
				</h2>
				<p className="text-sm text-pretty text-muted-foreground">
					A header with your name, a banner, photos and a button, in your newsletter&apos;s colors. Each one opens as a draft: change the words, swap the
					photos for your own and send it.
				</p>
				{gallery.error ? (
					<p role="alert" className="text-sm text-destructive">
						Couldn&apos;t load the designs: {gallery.error}
					</p>
				) : (
					<GalleryDesigns newsletterId={newsletterId} designs={gallery.designs} language={gallery.language} />
				)}
			</section>
			<h2 className="text-sm font-medium">Text templates</h2>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<Toggle options={KINDS} value={kind} onChange={setKind} label="Venue" />
				<Toggle options={LANGUAGES} value={language} onChange={setLanguage} label="Language" />
			</div>
			<p className="text-sm text-pretty text-muted-foreground">
				Each one opens as a draft with your venue&apos;s name and booking link. Fill what&apos;s in [square brackets], like a price or a perk, then send
				it or schedule it.
			</p>
			<ul className="grid gap-3 sm:grid-cols-2">
				{templates
					.filter((template) => template.kind === kind)
					.map((template) => {
						const text = template[language];
						return (
							<li key={template.id} className="flex flex-col gap-3 rounded-xl bg-card p-4 shadow-border">
								<div className="flex items-start justify-between gap-2">
									<p className="text-sm font-medium text-pretty">{text.title}</p>
									<Badge variant="secondary">{goals[template.goal][language]}</Badge>
								</div>
								<p className="text-xs text-muted-foreground">{text.when}</p>
								<p className="flex-1 text-sm text-pretty text-muted-foreground">“{text.subject.replaceAll("{{venue}}", "…")}”</p>
								<Button size="sm" variant="outline" className="self-start" disabled={pending !== null} onClick={() => use(template.id)}>
									{pending === template.id && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />} Use this template
								</Button>
							</li>
						);
					})}
			</ul>
		</div>
	);
}

function Toggle({ options, value, onChange, label }) {
	return (
		<div role="group" aria-label={label} className="inline-flex rounded-full bg-muted p-1">
			{Object.entries(options).map(([id, text]) => (
				<button
					key={id}
					type="button"
					aria-pressed={value === id}
					onClick={() => onChange(id)}
					className={cn("rounded-full px-3 py-1 text-sm", value === id ? "bg-background font-medium shadow-sm" : "text-muted-foreground")}
				>
					{text}
				</button>
			))}
		</div>
	);
}

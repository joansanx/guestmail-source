"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// The email is laid out at its full width and shown at this share of it, as the dashboard's gallery does
// (components/GalleryDesigns.jsx).
const EMAIL_WIDTH = 600;
const SCALE = 0.4;
const SHOWN_HEIGHT = 300;
const KINDS = ["hotel", "restaurant"];

// guestmail: the landing's gallery of designs (lib/marketing/landing-templates.js): a card per design with its email in
// small, those of one kind at a time, every card in the server's HTML. A card opens its email whole in a dialog, which
// leads to sign-up. The email is a picture: nothing in its frame runs, takes a click or a tab.
export default function GalleryTemplates({ templates, strings }) {
	const [kind, setKind] = useState(KINDS[0]);
	const [open, setOpen] = useState(null);

	return (
		<div className="flex w-full flex-col items-center gap-6">
			<div role="group" aria-label={strings.filter} className="inline-flex gap-1 rounded-full bg-muted p-1">
				{KINDS.map((value) => (
					<button
						key={value}
						type="button"
						aria-pressed={kind === value}
						onClick={() => setKind(value)}
						className={cn(
							"h-9 rounded-full px-5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
							kind === value ? "bg-background text-foreground shadow-border" : "text-muted-foreground hover:text-foreground"
						)}
					>
						{strings[value]}
					</button>
				))}
			</div>
			{/* Rows that wrap from the middle, so a kind with fewer designs than a row holds stays centered. */}
			<ul className="flex w-full flex-wrap justify-center gap-4">
				{templates.map((template) => (
					<li
						key={template.id}
						className={cn(
							"relative flex w-full flex-col overflow-hidden rounded-xl bg-card shadow-border transition-shadow hover:shadow-border-hover sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]",
							template.kind !== kind && "hidden"
						)}
					>
						<div aria-hidden="true" className="flex justify-center border-b border-border/60 bg-muted/60 pt-4">
							<div style={{ width: EMAIL_WIDTH * SCALE, height: SHOWN_HEIGHT }} className="overflow-hidden rounded-t-md bg-white shadow-border">
								{/* Without allow-scripts nothing in it runs, and same origin loads the theme's fonts. */}
								<iframe
									title={template.title}
									srcDoc={template.preview}
									sandbox="allow-same-origin"
									loading="lazy"
									tabIndex={-1}
									style={{ width: EMAIL_WIDTH, height: SHOWN_HEIGHT / SCALE, transform: `scale(${SCALE})` }}
									className="pointer-events-none origin-top-left border-0"
								/>
							</div>
						</div>
						<div className="flex flex-col gap-1 p-4 text-left">
							{/* The whole card is this button's to click. */}
							<button type="button" onClick={() => setOpen(template)} className="text-left text-sm font-medium text-pretty outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50">
								{template.title}
							</button>
							<p className="text-xs text-muted-foreground">{template.when}</p>
						</div>
					</li>
				))}
			</ul>
			<Dialog open={open !== null} onOpenChange={(isOpen) => !isOpen && setOpen(null)}>
				{open && (
					<DialogContent showCloseButton={false} className="gap-0 p-0 sm:max-w-2xl">
						<div className="flex items-start justify-between gap-4 border-b border-border/60 p-4">
							<div className="flex flex-col gap-1.5">
								<DialogTitle className="text-base">{open.title}</DialogTitle>
								<DialogDescription>{open.when}</DialogDescription>
							</div>
							<DialogClose asChild>
								<Button variant="ghost" size="icon-sm" className="rounded-full">
									<X aria-hidden="true" />
									<span className="sr-only">{strings.close}</span>
								</Button>
							</DialogClose>
						</div>
						<div className="bg-muted/60 p-3 sm:p-6">
							{/* At its full height, which it says once it's loaded: the dialog scrolls, never the email. */}
							<iframe
								title={open.title}
								srcDoc={open.preview.replaceAll("/stock/thumbs/", "/stock/")}
								sandbox="allow-same-origin"
								tabIndex={-1}
								onLoad={(event) => {
									const frame = event.currentTarget;
									frame.style.height = `${frame.contentDocument?.documentElement.scrollHeight ?? 0}px`;
								}}
								className="pointer-events-none mx-auto block h-[600px] w-full max-w-[600px] rounded-md border-0 bg-white shadow-border"
							/>
						</div>
						<div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-border/60 bg-popover p-4">
							<DialogClose asChild>
								<Button variant="outline" className="rounded-full">
									{strings.close}
								</Button>
							</DialogClose>
							<Button asChild className="rounded-full">
								<Link href="/signin">
									{strings.use} <ArrowRight data-icon="inline-end" />
								</Link>
							</Button>
						</div>
					</DialogContent>
				)}
			</Dialog>
		</div>
	);
}

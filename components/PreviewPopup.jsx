"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Eye, RotateCcw } from "lucide-react";
import { Segmented } from "@/components/FieldsTheme";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { renderFormPage } from "@/lib/signup-form-page";

const DEVICE_OPTIONS = [
	{ value: "desktop", label: "Desktop", content: "Desktop" },
	{ value: "mobile", label: "Mobile", content: "Mobile" },
];
const OPEN_AFTER_MS = 1000;

// guestmail: the popup over a stand-in for the owner's site, as public/popup.js draws it (same overlay, box and close
// button), with the form as it is in the editor, saved or not. Submitting shows the code a reader gets, signing no one up.
export default function PreviewPopup({ newsletter, settings, notice = null }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<Button type="button" variant="outline" size="sm" className="self-start" onClick={() => setIsOpen(true)}>
				<Eye className="size-4" aria-hidden="true" /> See it on a page
			</Button>
			<DialogContent className="flex h-[min(860px,calc(100dvh-2rem))] flex-col gap-3 sm:max-w-5xl">
				{isOpen && <Stage newsletter={newsletter} settings={settings} notice={notice} />}
			</DialogContent>
		</Dialog>
	);
}

function Stage({ newsletter, settings, notice }) {
	const [device, setDevice] = useState("desktop");
	const [round, setRound] = useState(0);
	const isMobile = device === "mobile";
	const host = getHost(newsletter.venue?.website);

	return (
		<>
			<div className="flex flex-wrap items-center gap-3 pr-8">
				<div className="flex flex-1 flex-col">
					<DialogTitle>Popup preview</DialogTitle>
					<DialogDescription className="text-xs">
						On your site it opens after 6 seconds or when someone is about to leave. Here, after 1 second. Nothing is sent.
					</DialogDescription>
				</div>
				<Segmented size="sm" label="Device" value={device} options={DEVICE_OPTIONS} onChange={setDevice} />
				<Button type="button" variant="ghost" size="sm" onClick={() => setRound((value) => value + 1)}>
					<RotateCcw className="size-4" aria-hidden="true" /> Show again
				</Button>
			</div>
			<div className="flex min-h-0 flex-1 justify-center overflow-hidden rounded-lg bg-muted/50 p-3">
				<div className={`flex h-full w-full flex-col overflow-hidden rounded-lg bg-white shadow-border ${isMobile ? "max-w-[390px]" : ""}`}>
					<div className="flex h-9 shrink-0 items-center gap-2 border-b border-black/10 bg-neutral-100 px-3">
						{!isMobile && (
							<span className="flex gap-1.5" aria-hidden="true">
								{["#ff5f57", "#febc2e", "#28c840"].map((color) => (
									<span key={color} className="size-2.5 rounded-full" style={{ background: color }} />
								))}
							</span>
						)}
						<span className="mx-auto truncate rounded-md bg-white px-3 py-0.5 text-[11px] text-neutral-500">{host}</span>
					</div>
					<div className="relative min-h-0 flex-1 overflow-hidden">
						<FakeSite name={newsletter.name} kind={newsletter.venue?.kind} isMobile={isMobile} />
						<Popup key={`${round}-${device}`} newsletter={newsletter} settings={settings} notice={notice} />
					</div>
				</div>
			</div>
		</>
	);
}

// Grey blocks where the owner's own page would be: enough to see the popup over a page, not a design to judge.
function FakeSite({ name, kind, isMobile }) {
	const label = { hotel: "Rooms", restaurant: "Menu" }[kind] ?? "Services";
	return (
		<div className="flex h-full flex-col gap-5 overflow-hidden p-5 text-neutral-900" aria-hidden="true">
			<div className="flex items-center justify-between">
				<span className="font-display text-lg font-[480] tracking-tight">{name}</span>
				{!isMobile && (
					<span className="flex gap-5 text-xs text-neutral-500">
						<span>{label}</span>
						<span>Location</span>
						<span>Contact</span>
					</span>
				)}
			</div>
			<div className="grid min-h-40 flex-1 place-items-end rounded-lg bg-gradient-to-br from-neutral-200 to-neutral-300 p-5">
				<span className="h-6 w-3/5 rounded bg-white/70" />
			</div>
			<div className={`grid gap-3 ${isMobile ? "grid-cols-1" : "grid-cols-3"}`}>
				{[0, 1, 2].map((index) => (
					<div key={index} className="flex flex-col gap-2">
						<span className="h-20 rounded-md bg-neutral-200" />
						<span className="h-2.5 w-4/5 rounded bg-neutral-200" />
						<span className="h-2.5 w-3/5 rounded bg-neutral-200" />
					</div>
				))}
			</div>
		</div>
	);
}

// The overlay of public/popup.js, inside the stand-in page instead of the whole window. Its form is the card layout,
// as /embed/<id>?popup=1 serves it.
function Popup({ newsletter, settings, notice }) {
	const frameRef = useRef(null);
	const [isShown, setIsShown] = useState(false);
	const [height, setHeight] = useState(220);
	const settingsKey = useDeferredValue(JSON.stringify(settings));
	const html = useMemo(
		() =>
			renderFormPage({
				newsletter,
				settings: { ...JSON.parse(settingsKey), layout: "card" },
				endpoint: "#",
				isPreview: true,
				notice,
			}),
		[newsletter, settingsKey, notice],
	);

	useEffect(() => {
		const timer = setTimeout(() => setIsShown(true), OPEN_AFTER_MS);
		function onMessage(event) {
			if (event.source !== frameRef.current?.contentWindow || event.data?.type !== "mailcheap:height") return;
			if (event.data.height > 0) setHeight(Math.ceil(event.data.height));
		}
		window.addEventListener("message", onMessage);
		return () => {
			clearTimeout(timer);
			window.removeEventListener("message", onMessage);
		};
	}, []);

	if (!isShown) return null;
	return (
		<div
			className="absolute inset-0 flex animate-in items-center justify-center p-4 fade-in-0"
			style={{ background: "rgba(0,0,0,.45)" }}
			onClick={(event) => event.target === event.currentTarget && setIsShown(false)}
		>
			<div className="relative w-full max-w-[440px]">
				<iframe
					ref={frameRef}
					title="Popup preview"
					srcDoc={html}
					sandbox="allow-scripts allow-forms"
					style={{ height }}
					className="block w-full border-0 bg-transparent"
				/>
				<button
					type="button"
					aria-label="Close the popup"
					onClick={() => setIsShown(false)}
					className="absolute -top-3.5 -right-1.5 grid size-8 place-items-center rounded-full bg-white text-xl leading-none text-neutral-900 shadow-[0_2px_8px_rgba(0,0,0,.25)]"
				>
					×
				</button>
			</div>
		</div>
	);
}

function getHost(website) {
	try {
		return new URL(website).hostname.replace(/^www\./, "");
	} catch {
		return "your-site.com";
	}
}

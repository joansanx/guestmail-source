"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, FileUp, Loader2, Plane, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { decideProposal, readMenu, saveMenu, savePilot } from "@/app/(app)/agent/actions";
import CardSettings, { RowSettings } from "@/components/CardSettings";
import TimeLocal from "@/components/TimeLocal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { slugify } from "@/lib/slug";
import { toast } from "@/lib/toast";
import { MAX_UPLOAD_BYTES } from "@/lib/upload-image";

const FREQUENCIES = { weekly: "Every week", biweekly: "Every two weeks", monthly: "Every month" };
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY = { month: "short", day: "numeric" };
const DAY_AND_TIME = { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" };
const EVERYONE = "everyone";
const STATUS = {
	writing: { label: "Writing", variant: "secondary" },
	proposed: { label: "Waiting for you", variant: "secondary" },
	approved: { label: "Scheduled", variant: "default" },
	rejected: { label: "Not this one", variant: "outline" },
	expired: { label: "No answer", variant: "outline" },
	discarded: { label: "Couldn't write it", variant: "outline" },
};
// A restaurant gives its menu, a hotel or another business what it offers.
const WORDS = {
	menu: { title: "Your menu", thing: "menu", item: "Dish", section: "Starters", placeholder: "https://your-restaurant.com/menu" },
	services: { title: "Your services", thing: "services", item: "Service", section: "Spa", placeholder: "https://your-hotel.com/services" },
};
const WAITS_FOR = {
	menu: (thing) => `It waits for your ${thing}`,
	confirmation: (thing) => `It waits for you to confirm your ${thing}`,
	rhythm: () => "Pick how often and which day",
};

// guestmail: the autopilot (lib/actions/pilot.js). pilot: get_pilot's answer. proposals: list_proposals'. segments: the
// newsletter's, to pick who its campaigns go to.
export default function PanelPilot({ newsletterId, pilot, proposals, segments, canEdit }) {
	if (!pilot) return null;
	const words = WORDS[pilot.kind];
	return (
		<>
			<CardMenu key={`${pilot.menu?.readAt}:${pilot.menu?.confirmedAt}`} newsletterId={newsletterId} pilot={pilot} words={words} canEdit={canEdit} />
			<CardPilot newsletterId={newsletterId} pilot={pilot} words={words} segments={segments} canEdit={canEdit} />
			<CardProposals newsletterId={newsletterId} pilot={pilot} proposals={proposals} canEdit={canEdit} />
		</>
	);
}

function CardMenu({ newsletterId, pilot, words, canEdit }) {
	const router = useRouter();
	const fileRef = useRef(null);
	const { menu } = pilot;
	const [url, setUrl] = useState(menu?.url ?? "");
	const [sections, setSections] = useState(menu?.sections ?? []);
	const [isReading, startReading] = useTransition();
	const [isSaving, startSaving] = useTransition();
	const isChanged = JSON.stringify(sections) !== JSON.stringify(menu?.sections ?? []);
	const isLocked = !canEdit || isReading || isSaving;
	const isReadable = pilot.available && /^https:\/\/\S+$/.test(url.trim());

	function readFromUrl() {
		startReading(async () => {
			const result = await readMenu(newsletterId, url.trim());
			if (result?.error) return void toast.error(result.error);
			toast.success(`Read: check your ${words.thing} below, fix what's wrong and confirm`);
		});
	}

	function readFromPdf(file) {
		if (!file) return;
		if (file.size > MAX_UPLOAD_BYTES) return void toast.error("The PDF must be under 4 MB. A link to it works for any size");
		startReading(async () => {
			const response = await fetch("/api/agent/menu", {
				method: "POST",
				headers: { "content-type": "application/pdf", "x-file-name": `${slugify(file.name.replace(/\.pdf$/i, ""), 60) || "menu"}.pdf` },
				body: file,
			}).catch(() => null);
			const result = (await response?.json().catch(() => null)) ?? {};
			if (!response?.ok) return void toast.error(result.error ?? "The upload failed, try again");
			toast.success(`Read: check your ${words.thing} below, fix what's wrong and confirm`);
			router.refresh();
		});
	}

	function confirm() {
		startSaving(async () => {
			const result = await saveMenu(newsletterId, { ...(isChanged && { sections }), confirmed: true });
			if (result?.error) return void toast.error(result.error);
			toast.success("Confirmed: the autopilot writes from it");
		});
	}

	function changeSection(index, change) {
		setSections((current) => current.map((section, position) => (position === index ? { ...section, ...change } : section)));
	}

	function changeItem(index, itemIndex, change) {
		changeSection(index, { items: sections[index].items.map((item, position) => (position === itemIndex ? { ...item, ...change } : item)) });
	}

	return (
		<CardSettings title={words.title}>
			<div className="flex flex-col gap-3 px-4 py-4">
				<p className="text-sm text-pretty text-muted-foreground">
					Give a link to it, a page or a PDF, or upload the PDF. The agent reads it into the table below, and the autopilot only ever names what you confirm there.
				</p>
				{canEdit && (
					<div className="flex flex-col gap-2 sm:flex-row">
						<Input type="url" value={url} onChange={(event) => setUrl(event.target.value)} disabled={isLocked} placeholder={words.placeholder} maxLength={500} aria-label={`Link to your ${words.thing}`} />
						<Button size="sm" variant="outline" disabled={isLocked || !isReadable} onClick={readFromUrl} className="shrink-0">
							{isReading ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <RefreshCw className="size-3.5" aria-hidden="true" />}
							{isReading ? "Reading…" : menu?.url === url.trim() ? "Read it again" : "Read it"}
						</Button>
						<Button size="sm" variant="outline" disabled={isLocked || !pilot.available} onClick={() => fileRef.current?.click()} className="shrink-0">
							<FileUp className="size-3.5" aria-hidden="true" /> Upload a PDF
						</Button>
						<input
							ref={fileRef}
							type="file"
							accept="application/pdf"
							hidden
							onChange={(event) => {
								readFromPdf(event.target.files?.[0]);
								event.target.value = "";
							}}
						/>
					</div>
				)}
				{menu?.readAt && (
					<p className="text-xs text-muted-foreground">
						Read on <TimeLocal value={menu.readAt} options={DAY} /> from {menu.source === "pdf" ? menu.fileName : hostOf(menu.url)}
					</p>
				)}
			</div>

			{sections.map((section, index) => (
				<div key={index} className="flex flex-col gap-2 px-4 py-4">
					<div className="flex items-center gap-2">
						<Input value={section.name} onChange={(event) => changeSection(index, { name: event.target.value })} disabled={isLocked} placeholder={words.section} maxLength={120} aria-label="Section" className="font-medium" />
						{canEdit && (
							<Button size="icon-sm" variant="ghost" disabled={isLocked} onClick={() => setSections(sections.filter((_, position) => position !== index))} aria-label={`Remove ${section.name || "this section"}`}>
								<Trash2 className="size-3.5" aria-hidden="true" />
							</Button>
						)}
					</div>
					{section.items.map((item, itemIndex) => (
						<div key={itemIndex} className="grid gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_7rem_auto]">
							<Input value={item.name} onChange={(event) => changeItem(index, itemIndex, { name: event.target.value })} disabled={isLocked} placeholder={words.item} maxLength={120} aria-label={words.item} />
							<Input value={item.description} onChange={(event) => changeItem(index, itemIndex, { description: event.target.value })} disabled={isLocked} placeholder="What it is" maxLength={300} aria-label="Description" />
							<Input value={item.price} onChange={(event) => changeItem(index, itemIndex, { price: event.target.value })} disabled={isLocked} placeholder="Price" maxLength={40} aria-label="Price" />
							{canEdit && (
								<Button size="icon-sm" variant="ghost" disabled={isLocked} onClick={() => changeSection(index, { items: section.items.filter((_, position) => position !== itemIndex) })} aria-label={`Remove ${item.name || "this line"}`}>
									<X className="size-3.5" aria-hidden="true" />
								</Button>
							)}
						</div>
					))}
					{canEdit && (
						<Button size="sm" variant="ghost" disabled={isLocked} onClick={() => changeSection(index, { items: [...section.items, { name: "", description: "", price: "" }] })} className="self-start">
							<Plus className="size-3.5" aria-hidden="true" /> Add a line
						</Button>
					)}
				</div>
			))}

			{canEdit && (
				<div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
					<Button size="sm" variant="outline" disabled={isLocked} onClick={() => setSections([...sections, { name: "", items: [{ name: "", description: "", price: "" }] }])}>
						<Plus className="size-3.5" aria-hidden="true" /> Add a section
					</Button>
					{sections.length > 0 && (
						<span className="flex items-center gap-3">
							<span className="text-xs text-muted-foreground">
								{menu?.confirmedAt && !isChanged ? (
									<>
										Confirmed on <TimeLocal value={menu.confirmedAt} options={DAY} />
									</>
								) : (
									"Not confirmed: the autopilot waits"
								)}
							</span>
							<Button size="sm" disabled={isLocked || (Boolean(menu?.confirmedAt) && !isChanged)} onClick={confirm}>
								{isSaving ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Check className="size-3.5" aria-hidden="true" />}
								{isChanged ? "Save and confirm" : "Confirm"}
							</Button>
						</span>
					)}
				</div>
			)}
		</CardSettings>
	);
}

function hostOf(url) {
	return URL.canParse(url ?? "") ? new URL(url).hostname.replace(/^www\./, "") : "a link";
}

function CardPilot({ newsletterId, pilot, words, segments, canEdit }) {
	const [isSaving, startSaving] = useTransition();
	const isLocked = !canEdit || isSaving;

	function save(changes, success) {
		startSaving(async () => {
			const result = await savePilot(newsletterId, changes);
			if (result?.error) return void toast.error(result.error);
			toast.success(success);
		});
	}

	return (
		<CardSettings
			title={
				<span className="flex items-center gap-2">
					<Plane className="size-4" aria-hidden="true" /> Autopilot
				</span>
			}
		>
			<RowSettings label="On" hint={`It prepares one campaign from your ${words.thing} on your rhythm and emails it to you whole. Nothing is sent until you approve it.`}>
				<Switch
					checked={pilot.enabled}
					disabled={isLocked || (!pilot.available && !pilot.enabled)}
					onCheckedChange={(enabled) => save({ enabled }, enabled ? "The autopilot is on" : "The autopilot is off")}
					aria-label="Autopilot on"
				/>
			</RowSettings>
			<RowSettings label="How often">
				<Select value={pilot.frequency ?? undefined} disabled={isLocked} onValueChange={(frequency) => save({ frequency }, "Saved")}>
					<SelectTrigger className="w-48" aria-label="How often">
						<SelectValue placeholder="Pick one" />
					</SelectTrigger>
					<SelectContent>
						{Object.entries(FREQUENCIES).map(([value, label]) => (
							<SelectItem key={value} value={value}>
								{label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</RowSettings>
			<RowSettings label="Day" hint={pilot.frequency === "monthly" ? "The first one of each month." : undefined}>
				<Select value={pilot.weekday === null ? undefined : String(pilot.weekday)} disabled={isLocked} onValueChange={(weekday) => save({ weekday: Number(weekday) }, "Saved")}>
					<SelectTrigger className="w-48" aria-label="Which day">
						<SelectValue placeholder="Pick a day" />
					</SelectTrigger>
					<SelectContent>
						{[1, 2, 3, 4, 5, 6, 0].map((day) => (
							<SelectItem key={day} value={String(day)}>
								{WEEKDAYS[day]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</RowSettings>
			<RowSettings label="Goes to">
				<Select value={pilot.segmentId ?? EVERYONE} disabled={isLocked} onValueChange={(segment) => save({ segment: segment === EVERYONE ? null : segment }, "Saved")}>
					<SelectTrigger className="w-48" aria-label="Goes to">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={EVERYONE}>Every active contact</SelectItem>
						{segments.map(({ id, name }) => (
							<SelectItem key={id} value={id}>
								{name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</RowSettings>
			{pilot.enabled && (
				<RowSettings label="Next proposal">
					<span className="text-sm text-muted-foreground sm:pt-2">
						{pilot.waitsFor ? WAITS_FOR[pilot.waitsFor](words.thing) : pilot.nextProposalAt ? <TimeLocal value={pilot.nextProposalAt} options={DAY} /> : "At its next run"}
					</span>
				</RowSettings>
			)}
		</CardSettings>
	);
}

function CardProposals({ newsletterId, pilot, proposals, canEdit }) {
	const [pending, setPending] = useState(null);
	const [, startDeciding] = useTransition();

	function decide(id, decision) {
		setPending(id);
		startDeciding(async () => {
			const result = await decideProposal(newsletterId, id, decision);
			setPending(null);
			if (result?.error) return void toast.error(result.error);
			toast.success(decision === "approved" ? "Approved and scheduled" : "Dropped: nothing is sent");
		});
	}

	if (proposals.length === 0 && !pilot.enabled) return null;
	return (
		<CardSettings title="Autopilot's campaigns">
			{proposals.length === 0 ? (
				<p className="px-4 py-4 text-sm text-pretty text-muted-foreground">Its first campaign comes by email, for you to approve.</p>
			) : (
				<ul className="divide-y divide-border/60">
					{proposals.map((proposal) => (
						<li key={proposal.id} className="flex flex-col gap-2 px-4 py-3">
							<div className="flex flex-wrap items-start justify-between gap-2">
								<p data-no-translate={proposal.subject ? "" : undefined} /* guestmail: a customer's own words, never translated (lib/i18n/dom.js) */ className="min-w-0 flex-1 text-sm font-medium text-pretty">{proposal.subject ?? (proposal.status === "writing" ? "Being written" : "No campaign this time")}</p>
								<Badge variant={STATUS[proposal.status].variant}>{STATUS[proposal.status].label}</Badge>
							</div>
							{proposal.items.length > 0 && <p className="text-sm text-pretty text-muted-foreground">{proposal.items.join(", ")}</p>}
							{proposal.status === "approved" && proposal.scheduledAt && (
								<p className="text-xs text-muted-foreground">
									Goes out <TimeLocal value={proposal.scheduledAt} options={DAY_AND_TIME} />
								</p>
							)}
							{proposal.status === "discarded" && proposal.notes.length > 0 && <p className="text-xs text-pretty text-muted-foreground">{proposal.notes.at(-1)}</p>}
							<div className="flex flex-wrap items-center gap-2">
								{proposal.status === "proposed" && canEdit && (
									<>
										<Button size="sm" disabled={pending === proposal.id} onClick={() => decide(proposal.id, "approved")}>
											{pending === proposal.id ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Check className="size-3.5" aria-hidden="true" />} Approve and schedule
										</Button>
										<Button size="sm" variant="outline" disabled={pending === proposal.id} onClick={() => decide(proposal.id, "rejected")}>
											<X className="size-3.5" aria-hidden="true" /> Not this one
										</Button>
									</>
								)}
								{proposal.campaignId && (
									<Button size="sm" variant="outline" asChild>
										<Link href={`/campaigns/${proposal.campaignId}`}>{proposal.status === "proposed" ? "Read the draft" : "Open the campaign"}</Link>
									</Button>
								)}
							</div>
						</li>
					))}
				</ul>
			)}
		</CardSettings>
	);
}

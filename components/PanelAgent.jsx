"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, ExternalLink, Loader2, RefreshCw, Sparkles, X } from "lucide-react";
import { decideIdea, saveAgent, writeBriefFromVenue } from "@/app/(app)/agent/actions";
import CardSettings, { RowSettings } from "@/components/CardSettings";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";

const LANGUAGES = { en: "English", es: "Español" };
const STATUS = {
	proposed: { label: "Waiting for you", variant: "secondary" },
	approved: { label: "Approved, writing soon", variant: "secondary" },
	drafting: { label: "Writing", variant: "secondary" },
	drafted: { label: "Draft ready", variant: "default" },
	rejected: { label: "Rejected", variant: "outline" },
	failed: { label: "Couldn't write it", variant: "outline" },
};

// guestmail: the content agent (lib/actions/agent.js). agent: get_agent's answer. ideas: list_ideas'. starterBrief: a
// first brief from what the newsletter already knows, for an empty one.
export default function PanelAgent({ newsletterId, agent, ideas, starterBrief, hasPlace, problem, canEdit }) {
	if (!agent) return <Notice>{problem ?? "The content agent can't be read right now."}</Notice>;
	return (
		<div className="flex flex-col gap-6">
			{!agent.available && <Notice>The content agent isn&apos;t available on this server yet.</Notice>}
			{agent.available && !hasPlace && (
				<Notice>
					Add your venue on <Link href="/reputation" className="font-medium text-foreground underline underline-offset-4">Reputation</Link> so the agent knows its
					rating and category on Google Maps.
				</Notice>
			)}
			<CardAgent newsletterId={newsletterId} agent={agent} canEdit={canEdit} />
			<CardIdeas newsletterId={newsletterId} agent={agent} ideas={ideas} canEdit={canEdit} />
			<CardBrief newsletterId={newsletterId} brief={agent.brief} starterBrief={starterBrief} canWrite={agent.available && hasPlace} canEdit={canEdit} />
		</div>
	);
}

function Notice({ children }) {
	return <p className="rounded-xl bg-card px-4 py-3 text-sm text-pretty text-muted-foreground shadow-border">{children}</p>;
}

function useSave(newsletterId) {
	const [isSaving, startSaving] = useTransition();
	function save(changes, success) {
		startSaving(async () => {
			const result = await saveAgent(newsletterId, changes);
			if (result?.error) return void toast.error(result.error);
			if (success) toast.success(success);
		});
	}
	return [isSaving, save];
}

function CardAgent({ newsletterId, agent, canEdit }) {
	const [isSaving, save] = useSave(newsletterId);
	const next = agent.nextRoundAt ? new Date(agent.nextRoundAt) : null;

	return (
		<CardSettings
			title={
				<span className="flex items-center gap-2">
					<Sparkles className="size-4" aria-hidden="true" /> Agent
				</span>
			}
		>
			<RowSettings label="On" hint="It proposes topics about your area and writes the ones you approve as drafts. Nothing is sent without you.">
				<Switch
					checked={agent.enabled}
					disabled={!canEdit || isSaving || (!agent.available && !agent.enabled)}
					onCheckedChange={(enabled) => save({ enabled }, enabled ? "The agent is on: its first ideas arrive within the hour" : "The agent is off")}
					aria-label="Content agent on"
				/>
			</RowSettings>
			<RowSettings label="Writes in">
				<Select value={agent.language} disabled={!canEdit || isSaving} onValueChange={(language) => save({ language }, "Saved")}>
					<SelectTrigger className="w-40">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{Object.entries(LANGUAGES).map(([value, label]) => (
							<SelectItem key={value} value={value}>
								{label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</RowSettings>
			<RowSettings label="Topics" hint="What it writes about first, separated by commas: the neighborhood, food, events, day trips, your offers.">
				<TopicsInput topics={agent.topics} disabled={!canEdit || isSaving} onSave={(topics) => save({ topics }, "Topics saved")} />
			</RowSettings>
			{agent.enabled && (
				<RowSettings label="Next ideas">
					<span className="flex flex-wrap items-center gap-3 text-sm sm:pt-2">
						<span className="text-muted-foreground">{next && next > new Date() ? next.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "At its next run"}</span>
						{canEdit && (
							<Button size="sm" variant="outline" disabled={isSaving} onClick={() => save({ newIdeas: true }, "New ideas arrive at the agent's next run")}>
								<RefreshCw className="size-3.5" aria-hidden="true" /> New ideas now
							</Button>
						)}
					</span>
				</RowSettings>
			)}
		</CardSettings>
	);
}

function TopicsInput({ topics, disabled, onSave }) {
	const [text, setText] = useState(topics.join(", "));
	const parsed = text.split(",").map((topic) => topic.trim()).filter((topic) => topic.length >= 2).slice(0, 12);
	const isChanged = parsed.join("|") !== topics.join("|");
	return (
		<span className="flex flex-col gap-2 sm:flex-row">
			<Input value={text} onChange={(event) => setText(event.target.value)} disabled={disabled} placeholder="The Gothic Quarter, food markets, day trips" maxLength={600} />
			<Button size="sm" variant="outline" disabled={disabled || !isChanged} onClick={() => onSave(parsed)} className="shrink-0">
				Save
			</Button>
		</span>
	);
}

function CardIdeas({ newsletterId, agent, ideas, canEdit }) {
	const [pending, setPending] = useState(null);
	const [, startDeciding] = useTransition();

	function decide(id, decision) {
		setPending(id);
		startDeciding(async () => {
			const result = await decideIdea(newsletterId, id, decision);
			setPending(null);
			if (result?.error) toast.error(result.error);
		});
	}

	return (
		<CardSettings title="Ideas">
			{ideas.length === 0 ? (
				<p className="px-4 pb-4 text-sm text-pretty text-muted-foreground">
					{agent.enabled ? "The agent's first ideas arrive within the hour. You'll get an email." : "Turn the agent on and it proposes its first ideas within the hour."}
				</p>
			) : (
				<ul className="divide-y divide-border/60">
					{ideas.map((idea) => (
						<li key={idea.id} className="flex flex-col gap-2 px-4 py-3">
							<div className="flex flex-wrap items-start justify-between gap-2">
								<p data-no-translate /* guestmail: a customer's own words, never translated (lib/i18n/dom.js) */ className="min-w-0 flex-1 text-sm font-medium text-pretty">{idea.title}</p>
								<Badge variant={STATUS[idea.status].variant}>{STATUS[idea.status].label}</Badge>
							</div>
							{idea.angle && <p data-no-translate className="text-sm text-pretty text-muted-foreground">{idea.angle}</p>}
							{idea.note && idea.status === "failed" && <p className="text-xs text-pretty text-muted-foreground">{idea.note}</p>}
							<div className="flex flex-wrap items-center gap-2">
								{idea.status === "proposed" && canEdit && (
									<>
										<Button size="sm" disabled={pending === idea.id} onClick={() => decide(idea.id, "approved")}>
											{pending === idea.id ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Check className="size-3.5" aria-hidden="true" />} Approve
										</Button>
										<Button size="sm" variant="outline" disabled={pending === idea.id} onClick={() => decide(idea.id, "rejected")}>
											<X className="size-3.5" aria-hidden="true" /> Reject
										</Button>
									</>
								)}
								{idea.campaignId && (
									<Button size="sm" variant="outline" asChild>
										<Link href={`/campaigns/${idea.campaignId}`}>Open the draft</Link>
									</Button>
								)}
								{idea.sources.slice(0, 3).map((url) => (
									<a key={url} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
										{new URL(url).hostname.replace(/^www\./, "")} <ExternalLink className="size-3" aria-hidden="true" />
									</a>
								))}
							</div>
						</li>
					))}
				</ul>
			)}
		</CardSettings>
	);
}

function CardBrief({ newsletterId, brief, starterBrief, canWrite, canEdit }) {
	const [text, setText] = useState(brief || "");
	const [isSaving, save] = useSave(newsletterId);
	const [isWriting, startWriting] = useTransition();
	const isChanged = text.trim() !== (brief || "").trim();

	function writeFromVenue() {
		startWriting(async () => {
			const result = await writeBriefFromVenue(newsletterId);
			if (result?.error) return void toast.error(result.error);
			setText(result.brief);
			toast.success("Brief written from your venue: read it and fix what says to confirm");
		});
	}

	return (
		<CardSettings
			title="Brief (context.md)"
			action={
				canEdit &&
				(canWrite ? (
					<Button size="sm" variant="outline" disabled={isWriting} onClick={writeFromVenue}>
						{isWriting ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Sparkles className="size-3.5" aria-hidden="true" />}
						{isWriting ? "Reading your website…" : "Write it from my venue"}
					</Button>
				) : (
					!text.trim() && (
						<Button size="sm" variant="outline" onClick={() => setText(starterBrief)}>
							Start from my venue
						</Button>
					)
				))
			}
		>
			<div className="flex flex-col gap-3 px-4 pb-4">
				<p className="text-sm text-pretty text-muted-foreground">
					What the agent knows about your venue and how it writes, in Markdown. It reads your rating and category on Google Maps live at each run, so you don&apos;t need to
					copy them here.
				</p>
				<Textarea
					value={text}
					onChange={(event) => setText(event.target.value)}
					disabled={!canEdit}
					rows={14}
					maxLength={8000}
					spellCheck
					className="font-mono text-[13px] leading-6"
					placeholder={starterBrief}
					aria-label="Brief"
				/>
				{canEdit && (
					<div className="flex items-center justify-between gap-3">
						<span className="text-xs text-muted-foreground tabular-nums">{text.length.toLocaleString("en-US")} / 8,000</span>
						<Button size="sm" disabled={!isChanged || isSaving} onClick={() => save({ brief: text }, "Brief saved")}>
							{isSaving && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />} Save brief
						</Button>
					</div>
				)}
			</div>
		</CardSettings>
	);
}

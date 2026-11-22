"use client";

import { useState, useTransition } from "react";
import { CakeSlice, CalendarClock, HeartHandshake, Loader2, LogOut, Pencil, TriangleAlert } from "lucide-react";
import { editHotelAutomation, switchHotelAutomation } from "@/app/(app)/automations/actions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/lib/toast";

const ICONS = { pre_arrival: CalendarClock, post_stay: LogOut, birthday: CakeSlice, win_back: HeartHandshake };

// guestmail: the hotel's automatic emails (lib/actions/automations.js). Each card: who gets it, its email to edit, and
// its switch, which stays off while the email has a [square bracket] to fill in.
export default function PanelAutomations({ newsletterId, available, automations, problem }) {
	if (problem) return <p className="rounded-xl bg-card px-4 py-3 text-sm text-muted-foreground shadow-border">{problem}</p>;
	if (!available) {
		return (
			<p className="rounded-xl bg-card px-4 py-3 text-sm text-pretty text-muted-foreground shadow-border">
				Automatic emails are for hotels for now: before arrival, after the stay, birthdays and come back.
			</p>
		);
	}
	return (
		<div className="flex flex-col gap-4">
			<p className="text-sm text-pretty text-muted-foreground">
				Each one goes out on its own, every hour between 9:00 and 20:00, to the guests who just entered its window. A guest gets each one once. Write
				the email before you turn it on: once it starts going out, its words stay. They need guests with stays: import them or connect your booking
				system.
			</p>
			{automations.map((automation, index) => (
				<CardAutomation key={automation.kind} newsletterId={newsletterId} automation={automation} stagger={index} />
			))}
		</div>
	);
}

function CardAutomation({ newsletterId, automation, stagger }) {
	const [state, setState] = useState(automation);
	const [isSaving, startSaving] = useTransition();
	const Icon = ICONS[state.kind];

	function toggle(enabled) {
		startSaving(async () => {
			const result = await switchHotelAutomation(newsletterId, state.kind, enabled);
			if (result?.error) return void toast.error(result.error);
			setState(result);
			toast.success(enabled ? `${state.label} is on` : `${state.label} is off`);
		});
	}

	function edit() {
		startSaving(async () => {
			const result = await editHotelAutomation(newsletterId, state.kind);
			if (result?.error) toast.error(result.error);
		});
	}

	return (
		<section style={{ "--stagger": stagger }} className="rounded-xl bg-card shadow-border animate-enter">
			<div className="flex items-start gap-3 p-4">
				<span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
					<Icon className="size-4" aria-hidden="true" />
				</span>
				<div className="min-w-0 flex-1">
					<h2 className="text-sm font-semibold">{state.label}</h2>
					<p className="mt-0.5 text-sm text-pretty text-muted-foreground">{state.description}</p>
				</div>
				<Switch
					checked={state.enabled}
					disabled={isSaving || !state.campaign || Boolean(state.placeholder && !state.enabled)}
					onCheckedChange={toggle}
					aria-label={`${state.label}: on or off`}
				/>
			</div>
			<div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-4 py-3 text-sm">
				<span className="min-w-0 flex-1 basis-56 text-pretty text-muted-foreground">
					{!state.campaign
						? "Set up its email from a template in your language, then turn it on."
						: state.placeholder
							? `Fill in ${state.placeholder} in the email to turn it on.`
							: state.paused
								? `Paused, nothing goes out: ${state.paused}`
								: state.enabled
									? `On. Sent to ${state.sent} ${state.sent === 1 ? "guest" : "guests"}.`
									: `Off. "${state.subject}" is ready.`}
				</span>
				<Button size="sm" variant="outline" disabled={isSaving} onClick={edit}>
					{isSaving ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Pencil className="size-3.5" aria-hidden="true" />}
					{!state.campaign ? "Set up email" : state.status === "draft" ? "Edit email" : "Open email"}
				</Button>
			</div>
			{state.problem && (
				<p role="status" className="flex gap-2 border-t border-border/60 bg-amber-500/10 px-4 py-3 text-sm text-pretty">
					<TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
					<span>Last run didn&apos;t send: {state.problem}</span>
				</p>
			)}
		</section>
	);
}

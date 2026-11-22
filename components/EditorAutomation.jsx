"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Clock, Loader2, Mail, MoreHorizontal, Pencil, Plus, Split, Trash2, TriangleAlert, Users, Workflow, Zap } from "lucide-react";
import { deleteAutomation, saveAutomation, turnOffAutomation, turnOnAutomation } from "@/app/(app)/automations/actions";
import AvatarContact from "@/components/AvatarContact";
import BadgeStatus from "@/components/BadgeStatus";
import BarSave from "@/components/BarSave";
import HeaderPage from "@/components/HeaderPage";
import TabsPage, { PanelTab } from "@/components/TabsPage";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { BRANCHES, MAX_STEPS, MAX_WAIT, checkSteps, getLane, getStepsBefore, getStepsUnder } from "@/lib/automation-rules";
import { formatNumber } from "@/lib/format";
import { toast } from "@/lib/toast";

// guestmail: one automation (lib/actions/automations.js). The trigger on top, then its path down the page: a + between
// steps adds an email, a wait or a condition, and a condition opens its Yes and No side by side (one under the other on a
// phone). Steps move up and down within their lane; nothing is dragged. Changes wait for Save, the switch turns it on
// or off at once, and each email is written in the campaign editor once it's saved.
const TABS = [
	{ value: "path", icon: Workflow, label: "Path" },
	{ value: "people", icon: Users, label: "People" },
];
const EDITABLE = ["id", "type", "parent", "branch", "amount", "unit", "check", "email", "tag", "segment"];
const STEP_ICONS = { email: Mail, wait: Clock, condition: Split };
const TAG_LIST = "automation-tags";

function toEditable(steps) {
	return steps.map((step) => Object.fromEntries(EDITABLE.filter((key) => step[key] !== null && step[key] !== undefined).map((key) => [key, step[key]])));
}

function toTriggerInput({ type, tag, campaign }) {
	return { type, ...(tag && { tag }), ...(campaign && { campaign }) };
}

// The steps in an order the server takes: every condition before the steps of its branches.
function ordered(steps) {
	const walk = (parent, branch) => getLane(steps, parent, branch).flatMap((step) => (step.type === "condition" ? [step, ...walk(step.id, "yes"), ...walk(step.id, "no")] : [step]));
	return walk(null, null);
}

function newStep(type, parent, branch) {
	const step = { id: `${type}-${Math.random().toString(36).slice(2, 8)}`, type, ...(parent && { parent, branch }) };
	if (type === "wait") return { ...step, amount: 1, unit: "days" };
	return step;
}

// A step at a place in a lane. A condition takes the steps that were after it into its Yes, and looks at the last email
// before it when there's one.
function insertStep(steps, { parent, branch, index }, type) {
	const lane = getLane(steps, parent, branch);
	let step = newStep(type, parent, branch);
	const before = lane[index];
	let next = before ? [...steps.slice(0, steps.indexOf(before)), step, ...steps.slice(steps.indexOf(before))] : [...steps, step];
	if (type === "condition") {
		const moved = new Set(lane.slice(index).map(({ id }) => id));
		next = next.map((one) => (moved.has(one.id) ? { ...one, parent: step.id, branch: "yes" } : one));
		const email = getStepsBefore(next, step).filter((one) => one.type === "email").at(-1);
		step = email ? { ...step, check: "opened", email: email.id } : { ...step, check: "tag", tag: "" };
		next = next.map((one) => (one.id === step.id ? step : one));
	}
	return ordered(next);
}

function moveStep(steps, step, delta) {
	const lane = getLane(steps, step.parent, step.branch);
	const other = lane[lane.indexOf(step) + delta];
	if (!other || other.type === "condition" || step.type === "condition") return steps;
	const next = [...steps];
	const [from, to] = [next.indexOf(step), next.indexOf(other)];
	[next[from], next[to]] = [next[to], next[from]];
	return ordered(next);
}

function removeStep(steps, step) {
	const gone = new Set([step.id, ...getStepsUnder(steps, step.id)]);
	return steps.filter(({ id }) => !gone.has(id)).map((one) => (gone.has(one.email) ? { ...one, email: "" } : one));
}

export default function EditorAutomation({ automation, segments, campaigns, tags, isVenue }) {
	const [saved, setSaved] = useState(automation);
	const [name, setName] = useState(automation.name);
	const [trigger, setTrigger] = useState(toTriggerInput(automation.trigger));
	const [steps, setSteps] = useState(toEditable(automation.steps));
	const [savedAt, setSavedAt] = useState(null);
	const [confirm, setConfirm] = useState(null);
	const [isSaving, startSaving] = useTransition();
	const [isSwitching, startSwitching] = useTransition();
	const isDirty =
		JSON.stringify({ name, trigger, steps }) !==
		JSON.stringify({ name: saved.name, trigger: toTriggerInput(saved.trigger), steps: toEditable(saved.steps) });
	const info = new Map(saved.steps.map((step) => [step.id, step]));

	function reset(next) {
		setSaved((current) => ({ ...next, recent: next.recent ?? current.recent }));
		setName(next.name);
		setTrigger(toTriggerInput(next.trigger));
		setSteps(toEditable(next.steps));
	}

	function save(event) {
		event.preventDefault();
		const { problem } = checkSteps(steps);
		if (problem) return void toast.error(problem);
		startSaving(async () => {
			const result = await saveAutomation(saved.id, { name: name.trim() || saved.name, trigger, steps });
			if (result?.error) return void toast.error(result.error);
			reset(result);
			setSavedAt(Date.now());
		});
	}

	function toggle(enabled) {
		startSwitching(async () => {
			const result = await (enabled ? turnOnAutomation : turnOffAutomation)(saved.id);
			if (result?.error) return void toast.error(result.error);
			setSaved((current) => ({ ...result, recent: current.recent }));
			toast.success(enabled ? `${result.name} is on` : `${result.name} is off`);
		});
	}

	function askRemove(step) {
		const under = getStepsUnder(steps, step.id).length;
		if (under === 0) return setSteps(removeStep(steps, step));
		setConfirm({
			title: "Delete this condition?",
			description:
				under === 1 ? "The step under it goes too, with its draft email, once you save." : `The ${under} steps under it go too, with their draft emails, once you save.`,
			label: "Delete",
			run: () => setSteps(removeStep(steps, step)),
		});
	}

	function askDelete() {
		setConfirm({
			title: "Delete this automation?",
			description: "Its path, its draft emails and the list of who's on it go for good. Emails it already sent stay in each contact's history.",
			label: "Delete",
			run: async () => {
				const result = await deleteAutomation(saved.id);
				if (result?.error) toast.error(result.error);
			},
		});
	}

	const editor = {
		steps,
		info,
		segments,
		tags,
		change: (step, values) => setSteps(steps.map((one) => (one.id === step.id ? { ...one, ...values } : one))),
		insert: (place, type) => setSteps(insertStep(steps, place, type)),
		move: (step, delta) => setSteps(moveStep(steps, step, delta)),
		remove: askRemove,
	};

	return (
		<form onSubmit={save} className="mx-auto w-full max-w-3xl">
			<HeaderPage title={<span data-no-translate>{saved.name}</span>} parent={{ label: "Automations", href: "/automations" }}>
				<label className="flex items-center gap-2 text-sm font-medium">
					{isSwitching ? <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" /> : null}
					{saved.enabled ? "On" : "Off"}
					<Switch checked={saved.enabled} disabled={isSwitching || isDirty} onCheckedChange={toggle} aria-label="On or off" />
				</label>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button type="button" variant="ghost" size="icon" aria-label="More">
							<MoreHorizontal aria-hidden="true" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem variant="destructive" onSelect={askDelete}>
							<Trash2 aria-hidden="true" />
							Delete automation
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</HeaderPage>

			{isDirty && <p className="-mt-4 mb-6 text-sm text-muted-foreground">Save your changes to turn it on or off.</p>}
			{saved.problem && (
				<p role="status" className="mb-6 flex gap-2 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-pretty">
					<TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
					<span>Last time an email couldn&apos;t go out: {saved.problem}</span>
				</p>
			)}

			<TabsPage tabs={TABS}>
				<PanelTab value="path" className="flex flex-col items-center pt-2">
					<CardTrigger name={name} onName={setName} trigger={trigger} onTrigger={setTrigger} campaigns={campaigns} tags={tags} isVenue={isVenue} />
					<Lane editor={editor} parent={null} branch={null} />
					{steps.length >= MAX_STEPS && <p className="mt-2 text-xs text-muted-foreground">An automation has {MAX_STEPS} steps at most.</p>}
				</PanelTab>
				<PanelTab value="people">
					<SectionPeople automation={saved} />
				</PanelTab>
			</TabsPage>

			<BarSave isDirty={isDirty} isSaving={isSaving} savedAt={savedAt} onDiscard={() => reset(saved)} />

			<Dialog open={Boolean(confirm)} onOpenChange={(open) => !open && setConfirm(null)}>
				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle>{confirm?.title}</DialogTitle>
						<DialogDescription>{confirm?.description}</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline">
								Cancel
							</Button>
						</DialogClose>
						<Button
							type="button"
							variant="destructive"
							onClick={() => {
								confirm.run();
								setConfirm(null);
							}}
						>
							{confirm?.label}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</form>
	);
}

function Card({ icon: Icon, title, menu, children, footer }) {
	return (
		<div className="w-full max-w-md rounded-xl bg-card shadow-border">
			<div className="flex items-center gap-2.5 px-3 pt-3">
				<span className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
					<Icon className="size-3.5" aria-hidden="true" />
				</span>
				<span className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</span>
				{menu}
			</div>
			<div className="flex flex-col gap-2 p-3">{children}</div>
			{footer && <div className="border-t border-border/60 px-3 py-2 text-xs text-muted-foreground">{footer}</div>}
		</div>
	);
}

const TRIGGER_OPTIONS = [
	{ value: "join", label: "Someone joins your list" },
	{ value: "tag", label: "Someone gets a tag" },
	{ value: "click", label: "Someone clicks a link in a campaign" },
	{ value: "manual", label: "You add them by hand" },
	{ value: "booking", label: "A booking comes in" },
];

function CardTrigger({ name, onName, trigger, onTrigger, campaigns, tags, isVenue }) {
	const options = TRIGGER_OPTIONS.filter(({ value }) => value !== "booking" || isVenue || trigger.type === "booking");
	return (
		<Card icon={Zap} title="Trigger" footer="Each person goes along it once. You can also add anyone by hand from their page.">
			<Input value={name} onChange={(event) => onName(event.target.value)} maxLength={100} aria-label="Name" placeholder="Name" data-no-translate />
			<Select value={trigger.type} onValueChange={(type) => onTrigger({ type })}>
				<SelectTrigger aria-label="Trigger" className="w-full bg-background">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{options.map(({ value, label }) => (
						<SelectItem key={value} value={value}>
							{label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{trigger.type === "tag" && <InputTag value={trigger.tag ?? ""} onChange={(tag) => onTrigger({ type: "tag", tag })} tags={tags} />}
			{trigger.type === "click" && (
				<Select value={trigger.campaign ?? ""} onValueChange={(campaign) => onTrigger({ type: "click", campaign })}>
					<SelectTrigger aria-label="Campaign" className="w-full bg-background">
						<SelectValue placeholder="Pick a sent campaign" />
					</SelectTrigger>
					<SelectContent>
						{campaigns.map(({ id, subject }) => (
							<SelectItem key={id} value={id} data-no-translate>
								{subject || "Untitled"}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)}
		</Card>
	);
}

function InputTag({ value, onChange, tags }) {
	return (
		<>
			<Input value={value} onChange={(event) => onChange(event.target.value)} list={TAG_LIST} maxLength={40} aria-label="Tag" placeholder="Tag" data-no-translate />
			<datalist id={TAG_LIST}>
				{tags.map((tag) => (
					<option key={tag} value={tag} />
				))}
			</datalist>
		</>
	);
}

function Lane({ editor, parent, branch }) {
	const lane = getLane(editor.steps, parent, branch);
	const isOpen = lane.at(-1)?.type !== "condition";
	return (
		<ol className="flex w-full flex-col items-center">
			{lane.map((step, index) => (
				<li key={step.id} className="flex w-full flex-col items-center">
					<ButtonAddStep editor={editor} place={{ parent, branch, index }} />
					<CardStep editor={editor} step={step} index={index} lane={lane} />
					{step.type === "condition" && (
						<div className="mt-1 grid w-full grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
							{BRANCHES.map((side) => (
								<div key={side} className="flex min-w-0 flex-col items-center">
									<span className="mt-3 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{side === "yes" ? "Yes" : "No"}</span>
									<Lane editor={editor} parent={step.id} branch={side} />
								</div>
							))}
						</div>
					)}
				</li>
			))}
			{isOpen && <ButtonAddStep editor={editor} place={{ parent, branch, index: lane.length }} />}
		</ol>
	);
}

function ButtonAddStep({ editor, place }) {
	const isFull = editor.steps.length >= MAX_STEPS;
	return (
		<div className="flex flex-col items-center">
			<span aria-hidden="true" className="h-3 w-px bg-border" />
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button type="button" variant="outline" size="icon" disabled={isFull} aria-label="Add a step" className="size-7 rounded-full">
						<Plus className="size-3.5" aria-hidden="true" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="center">
					<DropdownMenuItem onSelect={() => editor.insert(place, "email")}>
						<Mail aria-hidden="true" />
						Email
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={() => editor.insert(place, "wait")}>
						<Clock aria-hidden="true" />
						Wait
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={() => editor.insert(place, "condition")}>
						<Split aria-hidden="true" />
						Condition
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<span aria-hidden="true" className="h-3 w-px bg-border" />
		</div>
	);
}

function MenuStep({ editor, step, index, lane }) {
	const canUp = step.type !== "condition" && index > 0;
	const canDown = step.type !== "condition" && index < lane.length - 1 && lane[index + 1].type !== "condition";
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button type="button" variant="ghost" size="icon" aria-label="Step options" className="size-7">
					<MoreHorizontal className="size-4" aria-hidden="true" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem disabled={!canUp} onSelect={() => editor.move(step, -1)}>
					<ArrowUp aria-hidden="true" />
					Move up
				</DropdownMenuItem>
				<DropdownMenuItem disabled={!canDown} onSelect={() => editor.move(step, 1)}>
					<ArrowDown aria-hidden="true" />
					Move down
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem variant="destructive" onSelect={() => editor.remove(step)}>
					<Trash2 aria-hidden="true" />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function emailName(editor, id) {
	const saved = editor.info.get(id);
	if (!saved) return "New email";
	return saved.subject || "Untitled email";
}

function CardStep({ editor, step, index, lane }) {
	const saved = editor.info.get(step.id);
	const stats = saved?.type === step.type ? saved.stats : null;
	const menu = <MenuStep editor={editor} step={step} index={index} lane={lane} />;
	const Icon = STEP_ICONS[step.type];

	if (step.type === "email") {
		return (
			<Card
				icon={Icon}
				title={<span data-no-translate={saved ? "" : undefined}>{emailName(editor, step.id)}</span>}
				menu={menu}
				footer={
					stats && (
						<>
							{formatNumber(stats.received)} got it · {formatNumber(stats.opened)} opened · {formatNumber(stats.clicked)} clicked
							{stats.here > 0 && ` · ${formatNumber(stats.here)} about to get it`}
						</>
					)
				}
			>
				<div className="flex flex-wrap items-center justify-between gap-2">
					{saved?.status ? <BadgeStatus status={saved.status} /> : <span className="text-xs text-muted-foreground">Save to write it</span>}
					{saved?.campaign ? (
						<Button asChild type="button" size="sm" variant="outline">
							<Link href={`/campaigns/${saved.campaign}`}>
								<Pencil className="size-3.5" aria-hidden="true" />
								{saved.status === "draft" ? "Write email" : "Open email"}
							</Link>
						</Button>
					) : null}
				</div>
				{saved?.placeholder && <p className="text-xs text-amber-700 dark:text-amber-400">Fill in {saved.placeholder} to turn it on.</p>}
			</Card>
		);
	}

	if (step.type === "wait") {
		return (
			<Card icon={Icon} title="Wait" menu={menu} footer={stats?.here > 0 && `${formatNumber(stats.here)} waiting`}>
				<div className="flex gap-2">
					<Input
						type="number"
						min={1}
						max={MAX_WAIT[step.unit]}
						value={step.amount || ""}
						onChange={(event) => editor.change(step, { amount: Number.parseInt(event.target.value, 10) || 0 })}
						aria-label="How long"
						className="w-24 bg-background"
					/>
					<Select value={step.unit} onValueChange={(unit) => editor.change(step, { unit })}>
						<SelectTrigger aria-label="Unit" className="flex-1 bg-background">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="hours">Hours</SelectItem>
							<SelectItem value="days">Days</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</Card>
		);
	}

	const emails = getStepsBefore(editor.steps, step).filter(({ type }) => type === "email");
	return (
		<Card icon={Icon} title="Condition" menu={menu} footer={stats && `${formatNumber(stats.yes)} went down Yes · ${formatNumber(stats.no)} down No`}>
			<Select value={step.check} onValueChange={(check) => editor.change(step, { check, ...(check === "opened" || check === "clicked" ? { email: emails.at(-1)?.id ?? "" } : {}) })}>
				<SelectTrigger aria-label="Condition" className="w-full bg-background">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="opened" disabled={emails.length === 0}>
						Opened an email
					</SelectItem>
					<SelectItem value="clicked" disabled={emails.length === 0}>
						Clicked an email
					</SelectItem>
					<SelectItem value="tag">Has a tag</SelectItem>
					<SelectItem value="segment">Is in a segment</SelectItem>
				</SelectContent>
			</Select>
			{(step.check === "opened" || step.check === "clicked") && (
				<Select value={step.email ?? ""} onValueChange={(email) => editor.change(step, { email })}>
					<SelectTrigger aria-label="Email" className="w-full bg-background">
						<SelectValue placeholder="Pick an email before it" />
					</SelectTrigger>
					<SelectContent>
						{emails.map(({ id }) => (
							<SelectItem key={id} value={id} data-no-translate={editor.info.has(id) ? "" : undefined}>
								{emailName(editor, id)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)}
			{step.check === "tag" && <InputTag value={step.tag ?? ""} onChange={(tag) => editor.change(step, { tag })} tags={editor.tags} />}
			{step.check === "segment" && (
				<Select value={step.segment ?? ""} onValueChange={(segment) => editor.change(step, { segment })}>
					<SelectTrigger aria-label="Segment" className="w-full bg-background">
						<SelectValue placeholder="Pick a segment" />
					</SelectTrigger>
					<SelectContent>
						{editor.segments.map(({ id, name }) => (
							<SelectItem key={id} value={id} data-no-translate>
								{name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)}
		</Card>
	);
}

function SectionPeople({ automation }) {
	const { people, recent = [] } = automation;
	return (
		<section aria-label="People" className="rounded-xl bg-card shadow-border">
			<p className="border-b border-border/60 px-4 py-3 text-sm text-muted-foreground">
				{formatNumber(people.entered)} entered · {formatNumber(people.active)} on their way · {formatNumber(people.finished)} finished ·{" "}
				{formatNumber(people.left)} left
			</p>
			{recent.length === 0 ? (
				<p className="px-4 py-6 text-center text-sm text-muted-foreground">Nobody yet. People show here as they enter.</p>
			) : (
				<ul className="flex flex-col">
					{recent.map((person) => (
						<li key={person.contact}>
							<Link
								href={`/contacts/${person.contact}`}
								className="flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 hover:bg-muted/50"
							>
								<AvatarContact email={person.email} gravatarHash={person.gravatarHash} size={28} />
								<span className="flex min-w-0 flex-1 flex-col">
									<span data-no-translate className="truncate text-sm">
										{person.firstName || person.email}
									</span>
									<span className="truncate text-xs text-muted-foreground">
										{person.where === "left" && person.reason ? `Left: ${person.reason}` : capitalize(person.where)}
									</span>
								</span>
								<span className="shrink-0 text-xs text-muted-foreground">{person.enteredOn}</span>
							</Link>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}

function capitalize(text) {
	return text.charAt(0).toUpperCase() + text.slice(1);
}

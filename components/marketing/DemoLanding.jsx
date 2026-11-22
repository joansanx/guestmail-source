import Image from "next/image";
import {
	ArrowUp,
	Check,
	CircleCheck,
	Clock,
	ExternalLink,
	FileSpreadsheet,
	GitBranch,
	Globe,
	LayoutGrid,
	LayoutTemplate,
	Mail,
	PenLine,
	Plug,
	Send,
	Settings,
	Sparkles,
	Star,
	Users,
	Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// guestmail: the landing's demo, drawn as GuestMail's own screens for a hotel that doesn't exist: each tab of the demo
// (SectionDemo in SectionsLanding.jsx) and the small screens of the feature cards. Its words are the demo's data
// (lib/marketing/landing-demo.js), in the page's language. It's a picture: nothing in it is a control, so there's
// nothing to tab to, and its photos are GuestMail's own stock (public/stock).
const CODE = "rounded bg-muted px-1.5 py-0.5 font-mono text-[12px] text-foreground";
const FIELD = "flex h-9 min-w-0 items-center rounded-lg border border-border bg-background px-3 text-sm";
const BUTTON = "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-foreground px-3 text-sm font-medium text-background";
const CARD = "rounded-xl bg-card shadow-border";

// A browser window: its address, then the screen.
function Window({ address, children, className }) {
	return (
		<div className={cn("overflow-hidden rounded-xl bg-card shadow-border", className)}>
			<div className="flex h-9 items-center gap-3 border-b border-border/60 bg-muted/50 px-3" aria-hidden="true">
				<span className="flex shrink-0 gap-1.5">
					<span className="size-2.5 rounded-full bg-foreground/15" />
					<span className="size-2.5 rounded-full bg-foreground/15" />
					<span className="size-2.5 rounded-full bg-foreground/15" />
				</span>
				<span className="mx-auto max-w-xs min-w-0 flex-1 truncate rounded-md bg-background px-2.5 py-0.5 text-center text-xs text-muted-foreground shadow-border">{address}</span>
				<span className="w-[42px] shrink-0" />
			</div>
			{children}
		</div>
	);
}

const NAV = [
	{ key: "overview", icon: LayoutGrid },
	{ key: "campaigns", icon: Send },
	{ key: "automations", icon: Zap },
	{ key: "contacts", icon: Users },
	{ key: "reputation", icon: Star },
	{ key: "templates", icon: LayoutTemplate },
	{ key: "integrations", icon: Plug },
	{ key: "settings", icon: Settings },
];

// The dashboard around a page: its sidebar from a tablet up, the open page lit, as components/NavLinks.jsx draws it.
function Dashboard({ demo, page, address, children }) {
	return (
		<Window address={`theguestmail.com/${address}`}>
			<div className="flex md:h-[36rem]">
				<div className="hidden w-48 shrink-0 flex-col gap-4 border-r border-border/60 p-3 md:flex">
					<p className="flex items-center gap-2 px-1.5 pt-1 text-sm font-semibold">
						<span className="grid size-6 place-items-center rounded-md bg-foreground text-xs text-background">M</span>
						{demo.hotel.name}
					</p>
					<ul className="flex flex-col gap-0.5">
						{NAV.map(({ key, icon: Icon }) => (
							<li
								key={key}
								className={cn(
									"flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium",
									key === page ? "bg-muted text-foreground" : "text-muted-foreground"
								)}
							>
								<Icon className="size-4 shrink-0" aria-hidden="true" />
								{demo.nav[key]}
							</li>
						))}
					</ul>
				</div>
				<div className="relative min-w-0 flex-1 overflow-hidden p-4 sm:p-6">{children}</div>
			</div>
		</Window>
	);
}

function Stars({ rating }) {
	return (
		<span role="img" className="flex gap-0.5" aria-label={`${rating} / 5`}>
			{[1, 2, 3, 4, 5].map((value) => (
				<Star key={value} className={cn("size-3", value <= rating ? "fill-amber-400 text-amber-400" : "text-border")} aria-hidden="true" />
			))}
		</span>
	);
}

function Tool({ step }) {
	return (
		<li className="flex gap-2.5 py-2">
			<CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
			<span className="min-w-0 text-sm leading-6 text-muted-foreground">
				<code className={`${CODE} mr-2`}>{step.tool}</code>
				{step.result}
			</span>
		</li>
	);
}

// Ask your AI: a hotelier's request in an AI assistant connected to GuestMail, each tool it runs with what came back,
// and the question it asks before scheduling.
function DemoAsk({ demo }) {
	const { ask } = demo;
	return (
		<Window address={ask.title}>
			<div className="flex flex-col md:h-[36rem]">
				<div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-4 overflow-hidden p-4 sm:p-6">
					<p className="flex items-center gap-1.5 self-center rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
						<span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
						{ask.connected}
					</p>
					<p className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-muted px-4 py-2.5 text-sm leading-6">{ask.request}</p>
					<div className="flex max-w-[92%] gap-3">
						<Sparkles className="mt-2 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
						<div className="flex min-w-0 flex-col gap-2">
							<ul className="divide-y divide-border/60">
								{ask.steps.map((step) => (
									<Tool key={step.tool} step={step} />
								))}
							</ul>
							<p className="text-sm leading-6 font-medium">{ask.question}</p>
						</div>
					</div>
					<p className="self-end rounded-2xl rounded-br-md bg-muted px-4 py-2.5 text-sm">{ask.answer}</p>
					<ul className="ml-7 max-w-[92%]">
						<Tool step={ask.final} />
					</ul>
				</div>
				<div className="mx-auto w-full max-w-3xl p-3" aria-hidden="true">
					<span className="flex h-10 items-center justify-between rounded-full border border-border bg-background pr-1.5 pl-4 text-sm text-muted-foreground">
						{ask.placeholder}
						<span className="grid size-7 place-items-center rounded-full bg-foreground text-background">
							<ArrowUp className="size-4" />
						</span>
					</span>
				</div>
			</div>
		</Window>
	);
}

// Write: the editor on a draft made from a design, with its header, banner, row of photos and button.
function DemoWrite({ demo }) {
	const { write } = demo;
	return (
		<Dashboard demo={demo} page="campaigns" address="campaigns/8c41e2">
			<div className="flex flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<ol className="flex gap-1 rounded-lg bg-muted p-[3px] text-xs font-medium">
						{write.steps.map((step, index) => (
							<li key={step} className={cn("rounded-md px-2.5 py-1", index === 0 ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}>
								{step}
							</li>
						))}
					</ol>
					<span className="flex items-center gap-3">
						<span className="hidden text-xs text-muted-foreground lg:inline">{write.design}</span>
						<span className="hidden gap-1 rounded-lg bg-muted p-[3px] text-xs font-medium text-muted-foreground sm:flex">
							{write.views.map((view, index) => (
								<span key={view} className={cn("rounded-md px-2 py-0.5", index === 0 && "bg-background text-foreground shadow-sm")}>
									{view}
								</span>
							))}
						</span>
						<span className={BUTTON}>{write.next}</span>
					</span>
				</div>
				<div className="grid gap-3 sm:grid-cols-2">
					{[write.subject, write.preview].map(({ label, value }) => (
						<p key={label} className={`${FIELD} gap-2`}>
							<span className="shrink-0 text-xs text-muted-foreground">{label}</span>
							<span className="truncate">{value}</span>
						</p>
					))}
				</div>
				<div className="rounded-xl bg-muted/60 px-3 pt-3 sm:px-6 sm:pt-5 [mask-image:linear-gradient(to_bottom,black_80%,transparent)]">
				<div className={`${CARD} mx-auto flex w-full max-w-lg flex-col gap-3 p-4 sm:p-5`}>
					<p className="border-b border-border pb-3 text-center font-display text-lg font-semibold">{demo.hotel.name}</p>
					<Image src={write.banner.src} alt={write.banner.alt} width={1200} height={800} sizes="(min-width: 1024px) 560px, 90vw" className="h-24 w-full rounded-md object-cover" />
					<p className="text-lg font-semibold tracking-tight">{write.headline}</p>
					<div className="flex flex-col gap-1 text-sm leading-6 text-muted-foreground">
						<p>{write.hello}</p>
						<p>{write.intro}</p>
					</div>
					<div className="grid grid-cols-3 gap-2 sm:gap-3">
						{write.columns.map(({ photo, title, text }) => (
							<div key={photo.id} className="flex min-w-0 flex-col gap-1.5">
								<Image src={photo.thumb} alt={photo.alt} width={400} height={267} sizes="180px" className="aspect-[3/2] w-full rounded-md object-cover" />
								<p className="text-xs font-semibold sm:text-sm">{title}</p>
								<p className="text-xs leading-5 text-muted-foreground">{text}</p>
							</div>
						))}
					</div>
					<span className="mx-auto mt-1 inline-flex h-9 items-center rounded-lg bg-foreground px-4 text-sm font-medium text-background">{write.button}</span>
					<p className="text-sm text-muted-foreground/70">{write.placeholder}</p>
				</div>
				</div>
			</div>
		</Dashboard>
	);
}

// Guests: a guest's page, with their stays and reservations, what they opened, their facts, tags and segments.
function DemoGuests({ demo }) {
	const { guests } = demo;
	return (
		<Dashboard demo={demo} page="contacts" address="contacts/4f2a91">
			<div className="flex flex-col gap-4">
				<p className="truncate text-xs text-muted-foreground">
					{guests.breadcrumb} / {guests.email}
				</p>
				<div className="flex items-center gap-3">
					<span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-sm font-semibold">A</span>
					<span className="flex min-w-0 flex-col">
						<span className="flex items-center gap-2">
							<span className="truncate font-semibold">{guests.email}</span>
							<span className="shrink-0 rounded-md bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-900 dark:bg-amber-400/15 dark:text-amber-300">{guests.vip}</span>
						</span>
						<span className="flex items-center gap-1.5 text-xs text-muted-foreground">
							{guests.name} ·
							<span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
							{guests.status}
						</span>
					</span>
				</div>
				<dl className="grid grid-cols-3 gap-2">
					{guests.activity.map(({ label, value }) => (
						<div key={label} className={`${CARD} flex min-w-0 flex-col gap-0.5 px-3 py-2`}>
							<dt className="truncate text-[11px] text-muted-foreground">{label}</dt>
							<dd className="text-sm font-semibold tabular-nums">{value}</dd>
						</div>
					))}
				</dl>
				<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_13rem]">
					<section className={`${CARD} self-start`}>
						<h3 className="px-4 pt-3.5 text-sm font-medium">
							{guests.staysTitle} <span className="font-normal text-muted-foreground tabular-nums">{guests.stays.length}</span>
						</h3>
						<ul className="mt-2 divide-y divide-border/60 border-t border-border/60">
							{guests.stays.map(({ dates, detail }) => (
								<li key={dates} className="flex flex-col gap-0.5 px-4 py-2.5 text-sm">
									<span className="font-medium tabular-nums">{dates}</span>
									<span className="text-xs text-muted-foreground">{detail}</span>
								</li>
							))}
						</ul>
					</section>
					<div className="flex flex-col gap-3 text-sm">
						<dl className={`${CARD} flex flex-col gap-1.5 px-4 py-3`}>
							{guests.about.map(({ label, value }) => (
								<div key={label} className="flex justify-between gap-3">
									<dt className="text-muted-foreground">{label}</dt>
									<dd className="font-medium tabular-nums">{value}</dd>
								</div>
							))}
						</dl>
						<p className="flex flex-wrap items-center gap-1.5">
							<span className="text-xs text-muted-foreground">{guests.tagsTitle}</span>
							{guests.tags.map((tag) => (
								<span key={tag} className="rounded-md bg-muted px-1.5 py-0.5 text-xs">
									{tag}
								</span>
							))}
						</p>
						<div className="flex flex-col gap-1">
							<span className="text-xs text-muted-foreground">{guests.segmentsTitle}</span>
							{guests.segments.map((segment) => (
								<span key={segment} className="text-xs leading-5">
									{segment}
								</span>
							))}
						</div>
					</div>
				</div>
			</div>
		</Dashboard>
	);
}

function Checkbox({ checked, disabled }) {
	return (
		<span className={cn("mt-0.5 grid size-4 shrink-0 place-items-center rounded-[4px] border", checked ? "border-foreground bg-foreground text-background" : "border-border", disabled && "opacity-40")}>
			{checked && <Check className="size-3" strokeWidth={3} aria-hidden="true" />}
		</span>
	);
}

// Reviews: the venue's rating and its Google Maps reviews, the ones worth quoting picked, and the campaign they draft.
function DemoReviews({ demo }) {
	const { reviews } = demo;
	return (
		<Dashboard demo={demo} page="reputation" address="reputation">
			<div className={`${CARD} divide-y divide-border/60`}>
				<div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
					<p className="flex items-center gap-2 text-sm font-medium">
						<Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
						<span className="tabular-nums">{reviews.rating}</span>
						<span className="font-normal text-muted-foreground">{reviews.count}</span>
					</p>
					<span className="flex items-center gap-1 text-xs text-muted-foreground">
						{reviews.venue} <ExternalLink className="size-3" aria-hidden="true" />
					</span>
				</div>
				{reviews.items.map((review) => (
					<div key={review.author} className="flex gap-3 px-4 py-3">
						<Checkbox checked={review.chosen} disabled={review.rating < 4} />
						<span className="flex min-w-0 flex-col gap-1">
							<span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
								<span className="font-medium">{review.author}</span>
								<Stars rating={review.rating} />
								<span className="text-xs text-muted-foreground">{review.when}</span>
								{review.chosen && (
									<span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium">
										{[reviews.recommended, review.reason].filter(Boolean).join(" · ")}
									</span>
								)}
							</span>
							<span className="line-clamp-2 text-sm leading-6 text-muted-foreground sm:line-clamp-none">{review.text}</span>
						</span>
					</div>
				))}
				<div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
					<span className="text-xs text-muted-foreground">{reviews.source}</span>
					<span className={BUTTON}>
						<Send className="size-3.5" aria-hidden="true" />
						{reviews.button}
					</span>
				</div>
			</div>
		</Dashboard>
	);
}

function Node({ icon: Icon, label, value, className }) {
	return (
		<span className={cn(`${CARD} flex w-full max-w-64 items-start gap-2.5 px-3 py-2.5`, className)}>
			<Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
			<span className="flex min-w-0 flex-col">
				<span className="text-[11px] text-muted-foreground">{label}</span>
				<span className="text-sm leading-5 font-medium">{value}</span>
			</span>
		</span>
	);
}

const Line = () => <span className="mx-auto h-4 w-px bg-border" aria-hidden="true" />;

// Automations: the path a guest takes, drawn on a canvas, from what starts it to the branches of a condition.
function DemoAutomations({ demo }) {
	const { automations: flow } = demo;
	return (
		<Dashboard demo={demo} page="automations" address="automations/b7e310">
			<div className="flex flex-col gap-3">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<p className="flex items-center gap-2.5 font-semibold">
						{flow.name}
						<span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
							<span className="flex h-4 w-7 items-center justify-end rounded-full bg-foreground p-0.5" aria-hidden="true">
								<span className="size-3 rounded-full bg-background" />
							</span>
							{flow.on}
						</span>
					</p>
					<p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
						{flow.templates.label}
						{flow.templates.items.map((item) => (
							<span key={item} className="rounded-md border border-border px-1.5 py-0.5 text-foreground">
								{item}
							</span>
						))}
					</p>
				</div>
				<div className="relative flex flex-col items-center rounded-xl border border-border/60 px-3 py-5">
					<span className="absolute inset-0 bg-dots" aria-hidden="true" />
					<div className="relative flex w-full flex-col items-center">
						<Node icon={Zap} label={flow.trigger.label} value={flow.trigger.value} />
						<Line />
						<Node icon={Mail} label={flow.first.label} value={flow.first.value} />
						<Line />
						<span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium">
							<Clock className="size-3.5 text-muted-foreground" aria-hidden="true" />
							{flow.wait}
						</span>
						<Line />
						<Node icon={GitBranch} label={flow.condition.label} value={flow.condition.value} />
						<span className="h-4 w-1/2 border-x border-t border-border" aria-hidden="true" />
						<div className="grid w-full grid-cols-2 gap-3">
							{[flow.yes, flow.no].map((branch) => (
								<div key={branch.label} className="flex flex-col items-center gap-1.5">
									<span className="text-xs font-medium text-muted-foreground">{branch.label}</span>
									<Node icon={Mail} label={branch.step} value={branch.value} />
								</div>
							))}
						</div>
					</div>
				</div>
				<p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
					{flow.agent.label}
					{flow.agent.tools.map((tool) => (
						<code key={tool} className={CODE}>
							{tool}
						</code>
					))}
				</p>
			</div>
		</Dashboard>
	);
}

// Website: the venue's own site on GuestMail, with its offer for new subscribers and a page for each campaign.
function DemoWebsite({ demo }) {
	const { website } = demo;
	const { copy } = website;
	return (
		<Window address={website.host}>
			<div className="flex flex-col gap-6 p-4 sm:p-6 md:h-[36rem] md:overflow-hidden">
				<div className="flex items-center justify-between gap-3">
					<p className="flex items-center gap-2 text-sm font-semibold">
						<span className="grid size-6 place-items-center rounded-md bg-foreground text-xs text-background">M</span>
						{demo.hotel.name}
					</p>
					<span className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm">{copy.form.button}</span>
				</div>
				<div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_15rem] md:items-start">
					<div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 text-center">
						<p className="text-xs tracking-wide text-muted-foreground uppercase">{copy.kicker}</p>
						<p className="font-display text-3xl leading-tight font-[480] tracking-[-0.02em]">{demo.hotel.name}</p>
						<p className="text-sm leading-6 text-muted-foreground">{copy.about}</p>
						<div className={`${CARD} flex w-full flex-col gap-2 p-4 text-left`}>
							<p className="text-xs text-muted-foreground">{copy.offer.title}</p>
							<p className="font-semibold">{copy.offer.text}</p>
							<span className="flex gap-2">
								<span className={`${FIELD} flex-1 text-muted-foreground`}>{copy.form.placeholder}</span>
								<span className={`${BUTTON} h-9`}>{copy.form.button}</span>
							</span>
							<p className="text-xs text-muted-foreground">{copy.offer.note}</p>
						</div>
						<ul className="flex flex-col gap-1 text-xs text-muted-foreground">
							{copy.benefits.map((benefit) => (
								<li key={benefit} className="flex items-center justify-center gap-1">
									<Check className="size-3" aria-hidden="true" />
									{benefit}
								</li>
							))}
						</ul>
					</div>
					<div className="flex flex-col gap-3">
						<p className="text-xs font-medium text-muted-foreground">{website.latest}</p>
						<ul className="flex flex-col gap-3">
							{website.issues.map(({ title, date, photo }) => (
								<li key={title} className="flex items-center gap-3">
									<Image src={photo.thumb} alt={photo.alt} width={400} height={267} sizes="96px" className="aspect-[3/2] w-20 shrink-0 rounded-md object-cover" />
									<span className="flex min-w-0 flex-col">
										<span className="text-[11px] text-muted-foreground">{date}</span>
										<span className="text-sm leading-5 font-medium">{title}</span>
									</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</Window>
	);
}

export const DEMO_PANELS = { ask: DemoAsk, write: DemoWrite, guests: DemoGuests, reviews: DemoReviews, automations: DemoAutomations, website: DemoWebsite };
export const DEMO_ICONS = { ask: Sparkles, write: PenLine, guests: Users, reviews: Star, automations: Zap, website: Globe };

// The feature cards' small screens, one per h3 of the features section, in its order.
function Mini({ children, className }) {
	return <div className={cn("flex min-h-36 flex-col justify-center gap-2 rounded-lg bg-muted/50 p-3.5 text-sm", className)}>{children}</div>;
}

function VisualSchedule({ demo }) {
	const { schedule } = demo.features;
	return (
		<Mini>
			<span className="grid grid-cols-2 gap-2">
				{[schedule.date, schedule.time].map(({ label, value }) => (
					<span key={label} className="flex flex-col gap-1">
						<span className="text-[11px] text-muted-foreground">{label}</span>
						<span className={FIELD}>{value}</span>
					</span>
				))}
			</span>
			<span className="truncate text-xs text-muted-foreground">
				{schedule.to.label}: {schedule.to.value}
			</span>
			<span className={`${BUTTON} self-start`}>
				<Clock className="size-3.5" aria-hidden="true" />
				{schedule.button}
			</span>
		</Mini>
	);
}

function VisualPopup({ demo }) {
	const { copy } = demo.website;
	return (
		<Mini>
			<span className="font-semibold">{copy.offer.text}</span>
			<span className="flex gap-2">
				<span className={`${FIELD} flex-1 text-muted-foreground`}>{copy.form.placeholder}</span>
				<span className={`${BUTTON} h-9`}>{copy.form.button}</span>
			</span>
			<span className="rounded-lg border border-dashed border-border bg-background px-3 py-2 text-xs text-muted-foreground">
				{copy.form.yourCode}
				<span className="block font-mono text-base font-semibold tracking-wider text-foreground">{demo.features.popup.code}</span>
			</span>
		</Mini>
	);
}

function VisualSegment({ demo }) {
	const { segment } = demo.features;
	return (
		<Mini>
			{segment.rows.map((words) => (
				<span key={words[0]} className="flex flex-wrap gap-1.5">
					{words.map((word, index) => (
						<span key={word} className={cn("rounded-md border border-border bg-background px-2 py-1 text-xs", index === 0 && "font-medium")}>
							{word}
						</span>
					))}
				</span>
			))}
			<span className="mt-1 flex items-center gap-1.5 text-sm font-semibold tabular-nums">
				<Users className="size-4 text-muted-foreground" aria-hidden="true" />
				{segment.count}
			</span>
		</Mini>
	);
}

function VisualImport({ demo }) {
	const { import: file } = demo.features;
	return (
		<Mini>
			<span className="flex items-center gap-2 text-xs">
				<FileSpreadsheet className="size-4 text-muted-foreground" aria-hidden="true" />
				<span className="font-medium">{file.file}</span>
				<span className="text-muted-foreground">{file.rows}</span>
			</span>
			<ul className="flex flex-col gap-1">
				{file.map.map(([column, target]) => (
					<li key={column} className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs">
						<code className={CODE}>{column}</code>
						<span className="text-muted-foreground" aria-hidden="true">→</span>
						<span>{target}</span>
					</li>
				))}
			</ul>
			<span className="flex items-center gap-1.5 text-xs font-medium">
				<CircleCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
				{file.result}
			</span>
		</Mini>
	);
}

function VisualConnector({ demo }) {
	const { connector } = demo.features;
	return (
		<Mini>
			<span className="flex min-w-0 items-center gap-2 text-xs">
				<span className="rounded bg-foreground px-1.5 py-0.5 font-mono text-[11px] font-semibold text-background">POST</span>
				<span className="truncate font-mono text-muted-foreground">{connector.path}</span>
				<span className="ml-auto font-mono font-semibold text-emerald-700 dark:text-emerald-400">202</span>
			</span>
			<pre className="overflow-hidden rounded-md bg-background px-2.5 py-2 font-mono text-[11px] leading-4 text-muted-foreground shadow-border">{JSON.stringify(connector.body, null, 2)}</pre>
			<span className="flex min-w-0 flex-col text-xs">
				<span className="truncate font-medium">{connector.added}</span>
				<span className="text-muted-foreground">{connector.stay}</span>
			</span>
		</Mini>
	);
}

function VisualAttributed({ demo }) {
	const { attributed } = demo.features;
	return (
		<Mini>
			<span className="text-xs font-medium text-muted-foreground">{attributed.title}</span>
			<span className="flex gap-6">
				{attributed.figures.map(([value, label]) => (
					<span key={label} className="flex flex-col">
						<span className="text-2xl font-semibold tracking-tight tabular-nums">{value}</span>
						<span className="text-xs text-muted-foreground">{label}</span>
					</span>
				))}
			</span>
			<span className="text-xs text-muted-foreground">{attributed.note}</span>
		</Mini>
	);
}

function VisualDomain({ demo }) {
	const { domain } = demo.features;
	return (
		<Mini>
			<span className="text-[11px] text-muted-foreground">{domain.from}</span>
			<ul className="flex flex-col gap-1">
				{domain.senders.map(([address, state], index) => (
					<li key={address} className={cn("flex min-w-0 items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs", index === 1 && "bg-background shadow-border")}>
						<span className="truncate">{address}</span>
						<span className={cn("shrink-0", index === 1 ? "font-medium text-emerald-700 dark:text-emerald-400" : "text-muted-foreground")}>{state}</span>
					</li>
				))}
			</ul>
			<span className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
				{domain.records.map((record) => (
					<span key={record} className="flex items-center gap-1">
						<CircleCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
						{record}
					</span>
				))}
			</span>
		</Mini>
	);
}

function VisualDeliverability({ demo }) {
	return (
		<Mini>
			<ul className="flex flex-col gap-1.5">
				{demo.features.deliverability.items.map((item) => (
					<li key={item} className="flex items-center gap-2 text-xs">
						<CircleCheck className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
						{item}
					</li>
				))}
			</ul>
		</Mini>
	);
}

function VisualTeam({ demo }) {
	return (
		<Mini>
			<ul className="flex flex-col gap-2">
				{demo.features.team.members.map(([name, email, role]) => (
					<li key={email} className="flex min-w-0 items-center gap-2.5 text-xs">
						<span className="grid size-7 shrink-0 place-items-center rounded-full bg-background text-xs font-semibold shadow-border">{name[0]}</span>
						<span className="flex min-w-0 flex-col">
							<span className="font-medium">{name}</span>
							<span className="truncate text-muted-foreground">{email}</span>
						</span>
						<span className="ml-auto shrink-0 rounded-md bg-background px-1.5 py-0.5 shadow-border">{role}</span>
					</li>
				))}
			</ul>
		</Mini>
	);
}

export const FEATURE_VISUALS = [VisualSchedule, VisualPopup, VisualSegment, VisualImport, VisualConnector, VisualAttributed, VisualDomain, VisualDeliverability, VisualTeam];

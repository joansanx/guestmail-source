import Link from "next/link";
import { ArrowUpRight, CodeXml, Plug, Users } from "lucide-react";
import BlockCode from "@/components/BlockCode";
import ButtonAddContact from "@/components/ButtonAddContact";
import DialogImportContacts from "@/components/DialogImportContacts";
import GatePlan from "@/components/GatePlan";
import IconBrand from "@/components/IconBrand";
import { Button } from "@/components/ui/button";
import { FORM_SECTION, getSectionPath } from "@/lib/newsletter-sections";
import { cn } from "@/lib/utils";

// The contacts page of a newsletter without contacts: the ways in, an import and the API side by side then the form for
// the owner's site, and adding one by hand to try it. guestmail: a venue's (venue: { kind, host }) gets its own ways in,
// its PMS's file and the reservations connector, the last step of its sign-up.
export default function CardAddContacts({ newsletter, curl, importGuides, venue = null }) {
	if (venue) return <CardAddGuests newsletter={newsletter} importGuides={importGuides} venue={venue} />;
	return (
		<section
			aria-labelledby="add-contacts-title"
			style={{ "--stagger": 1 }}
			className="@container overflow-hidden rounded-2xl bg-card shadow-border animate-enter"
		>
			<header className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
				<span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
					<Users className="size-4" />
				</span>
				<div className="min-w-0">
					<h2 id="add-contacts-title" className="font-semibold tracking-tight">
						No contacts yet
					</h2>
					<p className="text-sm text-muted-foreground">Add them in one of three ways.</p>
				</div>
			</header>
			{/* The request's lines are the longest: side by side, it gets the wider column. */}
			<div className="grid @4xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
				<ColumnWay
					title="Import your list"
					description="Import a CSV from beehiiv, Substack or Mailchimp."
				>
					<ul
						aria-hidden="true"
						className="flex flex-wrap content-center justify-center gap-x-2 gap-y-4 rounded-xl bg-card px-3 py-6 shadow-border"
					>
						{SOURCES.map(({ id, name }) => (
							<li key={id} className="flex w-16 flex-col items-center gap-2">
								<IconBrand brand={id} className="size-10" />
								<span className="text-xs text-muted-foreground">{name}</span>
							</li>
						))}
					</ul>
					<div className="flex items-center">
						<GatePlan reason="import">
							<DialogImportContacts newsletter={newsletter} guides={importGuides} label="Import contacts" variant="default" />
						</GatePlan>
					</div>
				</ColumnWay>
				<ColumnWay
					title="Add them with the API"
					description="Sign people up from your site or app, one request each."
					className="border-t border-border/60 @4xl:border-t-0 @4xl:border-l"
				>
					<BlockCode code={curl} title="Request" />
					<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
						<Button asChild variant="outline">
							<Link href="/api-keys">Create an API key</Link>
						</Button>
						<Link
							href="/docs/api#add-contact"
							target="_blank"
							rel="noopener noreferrer"
							className="relative inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors duration-150 after:absolute after:-inset-x-2 after:-inset-y-2 hover:text-foreground"
						>
							API docs
							<ArrowUpRight className="size-3.5" />
						</Link>
					</div>
				</ColumnWay>
			</div>
			<div className="flex flex-col gap-4 border-t border-border/60 p-5 @2xl:flex-row @2xl:items-center @2xl:justify-between">
				<div className="min-w-0">
					<h3 className="text-sm font-semibold">Take signups on your site</h3>
					<p className="mt-1 text-sm text-muted-foreground">Paste a signup form on your site, blog or link page.</p>
				</div>
				<Button asChild variant="outline" className="self-start @2xl:self-auto">
					<Link href={getSectionPath(FORM_SECTION.id)}>
						<CodeXml data-icon="inline-start" />
						Set up the form
					</Link>
				</Button>
			</div>
			<div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border/60 bg-muted/40 px-5 py-3">
				<p className="text-sm text-muted-foreground">Trying it out? Add yourself as a contact.</p>
				<ButtonAddContact newsletter={newsletter} size="sm" />
			</div>
		</section>
	);
}

function CardAddGuests({ newsletter, importGuides, venue }) {
	const people = venue.kind === "other" ? "customers" : "guests";
	return (
		<section aria-labelledby="add-contacts-title" style={{ "--stagger": 1 }} className="@container overflow-hidden rounded-2xl bg-card shadow-border animate-enter">
			<header className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
				<span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
					<Users className="size-4" />
				</span>
				<div className="min-w-0">
					<h2 id="add-contacts-title" className="font-semibold tracking-tight">
						Bring your {people} in
					</h2>
					<p className="text-sm text-muted-foreground">Use one way or all three.</p>
				</div>
			</header>
			<div className="grid @4xl:grid-cols-2">
				<ColumnWay title={`Import your ${people}`} description="Export them from your PMS, booking engine or till as a CSV file. From Excel, use Save as CSV.">
					<p className="rounded-xl bg-muted/60 px-4 py-3 text-sm text-pretty text-muted-foreground">
						Columns like email, name, arrival, departure, room, channel, amount, country or language fill the {people === "guests" ? "guest" : "customer"} and their stays.
						Names in Spanish work too. Booking.com and Expedia relay addresses are left out.
					</p>
					<div className="flex items-center">
						<GatePlan reason="import">
							<DialogImportContacts newsletter={newsletter} guides={importGuides} label={`Import ${people}`} variant="default" />
						</GatePlan>
					</div>
				</ColumnWay>
				<ColumnWay
					title="Connect your booking system"
					description="Each new reservation comes in as a guest with their stay, from any PMS, booking engine, or Zapier, Make and n8n."
					className="border-t border-border/60 @4xl:border-t-0 @4xl:border-l"
				>
					<p className="rounded-xl bg-muted/60 px-4 py-3 text-sm text-pretty text-muted-foreground">
						Set it up once and your list grows on its own, ready for segments like arriving soon or stayed last summer.
					</p>
					<div className="flex items-center">
						<Button asChild variant="outline">
							<Link href="/integrations">
								<Plug data-icon="inline-start" />
								Set up the connector
							</Link>
						</Button>
					</div>
				</ColumnWay>
			</div>
			<div className="flex flex-col gap-4 border-t border-border/60 p-5 @2xl:flex-row @2xl:items-center @2xl:justify-between">
				<div className="min-w-0">
					<h3 className="text-sm font-semibold">Collect {people} on your website</h3>
					<p className="mt-1 text-sm text-pretty text-muted-foreground">
						{venue.host ? `${venue.host} already signs them up with your offer. ` : ""}Add the same form or a popup to your own website.
					</p>
				</div>
				<Button asChild variant="outline" className="self-start @2xl:self-auto">
					<Link href={getSectionPath(FORM_SECTION.id)}>
						<CodeXml data-icon="inline-start" />
						Set up the form
					</Link>
				</Button>
			</div>
			<div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border/60 bg-muted/40 px-5 py-3">
				<p className="text-sm text-muted-foreground">Trying it out? Add yourself as a contact.</p>
				<ButtonAddContact newsletter={newsletter} size="sm" />
			</div>
		</section>
	);
}

function ColumnWay({ title, description, className, children }) {
	return (
		<div className={cn("flex min-w-0 flex-col gap-4 p-5 @4xl:row-span-3 @4xl:grid @4xl:grid-rows-subgrid", className)}>
			<div>
				<h3 className="text-sm font-semibold">{title}</h3>
				<p className="mt-1 text-sm text-muted-foreground">{description}</p>
			</div>
			{children}
		</div>
	);
}

const SOURCES = [
	{ id: "beehiiv", name: "beehiiv" },
	{ id: "substack", name: "Substack" },
	{ id: "mailchimp", name: "Mailchimp" },
];

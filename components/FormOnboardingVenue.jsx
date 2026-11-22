"use client";

import { useActionState, useState, useTransition } from "react";
import { ArrowLeft, Building2, Check, Loader2, MapPin, Search, Store, UtensilsCrossed } from "lucide-react";
import { signOut } from "@/app/signin/actions";
import { completeVenueOnboarding, searchVenue } from "@/app/welcome/actions";
import ButtonSignout from "@/components/ButtonSignout";
import LogoWordmark from "@/components/LogoWordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OFFER_PRESETS } from "@/lib/offer-presets";
import { cn } from "@/lib/utils";

const TOPICS = {
	hotel: ["The neighborhood", "Food and restaurants nearby", "Events and festivals", "Day trips", "Seasons and weather", "Our offers and services"],
	restaurant: ["Seasonal menus", "Local produce", "Wine and drinks", "Events at the restaurant", "The neighborhood"],
	other: ["Tips for our customers", "News and launches", "Behind the scenes", "Our offers", "Local events"],
};
const KINDS = [
	{ id: "hotel", label: "A hotel", icon: Building2 },
	{ id: "restaurant", label: "A restaurant", icon: UtensilsCrossed },
	{ id: "other", label: "Another business", icon: Store },
];
const TITLE_CLASS = "font-display text-[2.25rem] leading-[1.08] font-[480] tracking-[-0.03em] text-balance";
const COMPACT_TITLE_CLASS = "font-display text-2xl leading-tight font-[480] tracking-[-0.02em] text-balance";

// guestmail: a new account's first stop when Google Maps is set up. What it is, which one on Google Maps, what to write
// about: the newsletter, its venue and its content agent come from that, and the agent's first round starts at once.
export default function FormOnboardingVenue() {
	return (
		<div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 py-6 sm:px-6">
			<header className="flex h-9 items-center justify-between gap-3">
				<LogoWordmark />
				<form action={signOut}>
					<ButtonSignout>Sign out</ButtonSignout>
				</form>
			</header>
			<div className="flex flex-1 flex-col justify-center py-10">
				<StepsVenue serverAction={completeVenueOnboarding} />
			</div>
		</div>
	);
}

// The three steps, for the sign-up and for Add a newsletter (components/FormAddNewsletter.jsx). isAddition: another venue
// of an account that already accepted the terms, in a dialog.
export function StepsVenue({ serverAction, isAddition = false }) {
	const [state, action, isPending] = useActionState(serverAction, null);
	const [step, setStep] = useState(0);
	const [kind, setKind] = useState("hotel");
	const [query, setQuery] = useState("");
	const [places, setPlaces] = useState(null);
	const [problem, setProblem] = useState(null);
	const [isSearching, startSearching] = useTransition();
	const [place, setPlace] = useState(null);
	const [topics, setTopics] = useState(TOPICS.hotel.slice(0, 4));
	const [language, setLanguage] = useState("es");
	const offer = OFFER_PRESETS[kind][0];
	const word = { hotel: "hotel", restaurant: "restaurant", other: "business" }[kind];
	const title = isAddition ? COMPACT_TITLE_CLASS : TITLE_CLASS;

	function search(event) {
		event.preventDefault();
		setProblem(null);
		startSearching(async () => {
			const result = await searchVenue(query);
			if (result?.error) return void setProblem(result.error);
			setPlaces(result.places);
		});
	}

	function pick(found) {
		setPlace({ ...found, address: found.address });
		setStep(2);
	}

	function toggleTopic(topic) {
		setTopics((current) => (current.includes(topic) ? current.filter((value) => value !== topic) : [...current, topic]));
	}

	return (
		<div className="flex flex-col">
			<div className={cn("flex items-center gap-3", isAddition ? "mb-5" : "mb-8")}>
				<button
					type="button"
					onClick={() => setStep(Math.max(0, step - 1))}
					disabled={step === 0}
					aria-label="Back"
					className="-ml-2 grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-0"
				>
					<ArrowLeft className="size-4" />
				</button>
				<ol aria-label={`Step ${step + 1} of 3`} className="flex flex-1 gap-1.5">
					{[0, 1, 2].map((index) => (
						<li key={index} className={cn("h-1 flex-1 rounded-full", index <= step ? "bg-foreground" : "bg-muted")} />
					))}
				</ol>
			</div>

			{step === 0 && (
				<section className="animate-enter">
					<h1 className={title}>{isAddition ? "What are you adding?" : "What do you run?"}</h1>
					<p className="mt-3 text-pretty text-muted-foreground">
						{isAddition
							? "It gets its own newsletter, website and content agent, set up from Google Maps."
							: "GuestMail sets itself up from it: your venue, your first ideas and your first draft."}
					</p>
					<div className={cn("mt-6 grid gap-3", !isAddition && "sm:grid-cols-3")}>
						{KINDS.map(({ id, label, icon: Icon }) => (
							<button
								key={id}
								type="button"
								onClick={() => {
									setKind(id);
									setTopics(TOPICS[id].slice(0, 4));
									setStep(1);
								}}
								className="flex items-center gap-3 rounded-xl bg-card p-4 text-left font-medium shadow-border hover:shadow-border-hover"
							>
								<Icon className="size-5" aria-hidden="true" /> {label}
							</button>
						))}
					</div>
				</section>
			)}

			{step === 1 && (
				<section className="animate-enter">
					<h1 className={title}>Which {word} is it?</h1>
					<p className="mt-3 text-pretty text-muted-foreground">Its name and its city, as on Google Maps.</p>
					<form onSubmit={search} className="mt-6 flex gap-2">
						<Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={kind === "hotel" ? "Hotel Pulitzer, Barcelona" : "Casa Lucio, Madrid"} autoFocus />
						<Button type="submit" disabled={query.trim().length < 3 || isSearching}>
							{isSearching ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Search className="size-4" aria-hidden="true" />} Search
						</Button>
					</form>
					{problem && <p className="mt-3 text-sm text-destructive">{problem}</p>}
					<button type="button" onClick={() => pick({ placeId: "", name: query.split(",")[0].trim(), address: "" })} className="mt-3 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
						My {word} isn&apos;t on Google Maps
					</button>
					{places && (
						<ul className="mt-4 divide-y divide-border/60 rounded-xl bg-card shadow-border">
							{places.length === 0 && <li className="px-4 py-3 text-sm text-muted-foreground">Nothing found. Try its name and city.</li>}
							{places.map((found) => (
								<li key={found.placeId}>
									<button type="button" onClick={() => pick(found)} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-muted/60">
										<MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
										<span className="flex flex-col">
											<span className="text-sm font-medium">{found.name}</span>
											<span className="text-xs text-muted-foreground">{found.address}</span>
										</span>
									</button>
								</li>
							))}
						</ul>
					)}
				</section>
			)}

			{step === 2 && place && (
				<form action={action} className="animate-enter">
					<input type="hidden" name="kind" value={kind} />
					{place.placeId && <input type="hidden" name="placeId" value={place.placeId} />}
					{topics.map((topic) => (
						<input key={topic} type="hidden" name="topics" value={topic} />
					))}
					<h1 className={title}>Last details</h1>
					<div className="mt-6 flex flex-col gap-5">
						<label className="flex flex-col gap-1.5 text-sm font-medium">
							Name your guests see
							<Input name="name" defaultValue={place.name} required maxLength={100} />
						</label>
						<label className="flex flex-col gap-1.5 text-sm font-medium">
							Postal address, printed in every email as the law asks
							<Input name="postalAddress" defaultValue={place.address} required maxLength={300} />
						</label>
						{!place.placeId && (
							<label className="flex flex-col gap-1.5 text-sm font-medium">
								Your website, so the agent learns about your {word}
								<Input name="website" type="url" placeholder="https://" maxLength={300} />
							</label>
						)}
						<label className="flex flex-col gap-1.5 text-sm font-medium">
							{kind === "other" ? "Your customers read in" : "Your guests read in"}
							<select name="language" value={language} onChange={(event) => setLanguage(event.target.value)} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm font-normal">
								<option value="es">Español</option>
								<option value="en">English</option>
							</select>
						</label>
						<label className="flex flex-col gap-1.5 text-sm font-medium">
							Your offer for people who subscribe, shown on your website
							<Input key={`${kind}-${language}`} name="offerText" defaultValue={offer[language]} maxLength={120} placeholder="Leave it empty for no offer" />
							<input type="hidden" name="offerCode" value={offer.code} />
							<span className="text-xs font-normal text-muted-foreground">Each person gets their own code, {offer.code} plus 6 characters. Change it later in Settings.</span>
						</label>
						<fieldset className="flex flex-col gap-2">
							<legend className="text-sm font-medium">What should your content agent write about?</legend>
							<div className="mt-2 flex flex-wrap gap-2">
								{TOPICS[kind].map((topic) => (
									<button
										key={topic}
										type="button"
										onClick={() => toggleTopic(topic)}
										aria-pressed={topics.includes(topic)}
										className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm shadow-border", topics.includes(topic) ? "bg-foreground text-background" : "bg-card")}
									>
										{topics.includes(topic) && <Check className="size-3.5" aria-hidden="true" />} {topic}
									</button>
								))}
							</div>
						</fieldset>
						{!isAddition && (
							<label className="flex items-start gap-3 rounded-xl bg-card p-4 text-sm text-pretty shadow-border">
								<input type="checkbox" name="terms" required className="mt-0.5 size-4" />
								<span>
									I accept the <a href="/terms" target="_blank" className="underline underline-offset-4">terms</a>, the{" "}
									<a href="/privacy" target="_blank" className="underline underline-offset-4">privacy policy and data processing terms</a> and the{" "}
									<a href="/acceptable-use" target="_blank" className="underline underline-offset-4">acceptable use policy</a>. I&apos;ll only email people who
									gave my {word} their address.
								</span>
							</label>
						)}
						{state?.error && <p className="text-sm text-destructive">{state.error}</p>}
						<Button type="submit" disabled={isPending} className="self-start">
							{isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />} {isAddition ? "Add" : "Set up"} my {word}
						</Button>
					</div>
				</form>
			)}
		</div>
	);
}

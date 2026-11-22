"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, MapPin, Search, Send, Star } from "lucide-react";
import { draftReviewCampaign, findPlaces, saveVenue } from "@/app/(app)/reputation/actions";
import CardSettings, { RowSettings } from "@/components/CardSettings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/lib/toast";

const KINDS = { hotel: "Hotel", restaurant: "Restaurant" };

// guestmail: the venue's reputation on Google Maps. venue: { kind, placeId, bookingUrl }. reputation: get_reputation's
// answer, null without a place. Reviews show with their author, a link to each and where they come from, as Google
// Maps asks.
export default function PanelReputation({ newsletterId, venue, reputation, problem, canEdit }) {
	return (
		<div className="flex flex-col gap-6">
			{problem && <p className="rounded-xl bg-card px-4 py-3 text-sm text-pretty text-muted-foreground shadow-border">{problem}</p>}
			{reputation && <CardReviews newsletterId={newsletterId} reputation={reputation} />}
			{canEdit && <CardVenue newsletterId={newsletterId} venue={venue} placeName={reputation?.name ?? null} />}
		</div>
	);
}

function CardReviews({ newsletterId, reputation }) {
	const router = useRouter();
	const [isDrafting, startDrafting] = useTransition();
	const [chosen, setChosen] = useState(() => reputation.reviews.filter(({ recommended }) => recommended).map(({ id }) => id));

	function toggle(id) {
		setChosen((ids) => (ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]));
	}

	function draft() {
		startDrafting(async () => {
			const result = await draftReviewCampaign(newsletterId, chosen);
			if (result?.error) return void toast.error(result.error);
			router.push(`/campaigns/${result.id}`);
		});
	}

	return (
		<CardSettings
			title={
				<span className="flex items-center gap-2">
					<Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
					<span className="tabular-nums">{reputation.rating?.toFixed(1) ?? "No rating yet"}</span>
					<span className="font-normal text-muted-foreground">
						{reputation.reviewCount.toLocaleString("en-US")} reviews on {reputation.source}
					</span>
				</span>
			}
			action={
				reputation.mapsUrl && (
					<a href={reputation.mapsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
						{reputation.name} <ExternalLink className="size-3" aria-hidden="true" />
					</a>
				)
			}
		>
			{reputation.reviews.length === 0 && <p className="px-4 py-6 text-sm text-muted-foreground">Google Maps has no reviews with text for this place yet.</p>}
			{reputation.reviews.map((review) => {
				const canQuote = review.rating >= 4 && review.text;
				return (
					<label key={review.id} className="flex gap-3 px-4 py-3.5">
						<input
							type="checkbox"
							className="mt-1 size-4 shrink-0 accent-foreground"
							checked={chosen.includes(review.id)}
							disabled={!canQuote}
							onChange={() => toggle(review.id)}
							aria-label={`Quote ${review.author}'s review`}
						/>
						<span className="flex min-w-0 flex-col gap-1.5">
							<span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
								<a href={review.authorUrl ?? review.url} target="_blank" rel="noreferrer" className="font-medium hover:underline">
									{review.author}
								</a>
								<span className="tabular-nums text-muted-foreground">
									{review.rating} ★{review.relativeTime && ` · ${review.relativeTime}`}
								</span>
								{review.recommended && <Badge variant="secondary">Recommended · {review.reason}</Badge>}
							</span>
							<span data-no-translate /* guestmail: a customer's own words, never translated (lib/i18n/dom.js) */ className="text-sm leading-relaxed text-pretty text-muted-foreground">{review.text}</span>
							{review.url && (
								<a href={review.url} target="_blank" rel="noreferrer" className="self-start text-xs text-muted-foreground hover:text-foreground hover:underline">
									Read on Google Maps
								</a>
							)}
						</span>
					</label>
				);
			})}
			<div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
				<span className="text-xs text-pretty text-muted-foreground">Reviews from Google Maps, the most relevant first, read live.</span>
				<Button type="button" onClick={draft} disabled={isDrafting || chosen.length === 0} className="min-w-44">
					{isDrafting ? <Loader2 className="animate-spin" /> : <Send data-icon="inline-start" />}
					{!isDrafting && `Draft a campaign with ${chosen.length}`}
				</Button>
			</div>
		</CardSettings>
	);
}

function CardVenue({ newsletterId, venue, placeName }) {
	const [isSaving, startSaving] = useTransition();
	const [query, setQuery] = useState("");
	const [places, setPlaces] = useState(null);
	const [bookingUrl, setBookingUrl] = useState(venue.bookingUrl ?? "");

	function save(changes, message) {
		startSaving(async () => {
			const result = await saveVenue(newsletterId, changes);
			if (result?.error) return void toast.error(result.error);
			setPlaces(null);
			toast.success(message);
		});
	}

	function search(event) {
		event.preventDefault();
		startSaving(async () => {
			const result = await findPlaces(query);
			if (result?.error) return void toast.error(result.error);
			setPlaces(result.places);
		});
	}

	return (
		<CardSettings title="Your venue">
			<RowSettings label="Kind" hint="The words your review campaigns use: guests and Book direct, or Book a table.">
				<Select value={venue.kind ?? ""} onValueChange={(kind) => save({ kind }, "Kind saved")}>
					<SelectTrigger className="h-9 w-44" aria-label="Kind of venue">
						<SelectValue placeholder="Pick one" />
					</SelectTrigger>
					<SelectContent>
						{Object.entries(KINDS).map(([id, label]) => (
							<SelectItem key={id} value={id}>
								{label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</RowSettings>
			<RowSettings
				label="Google Maps"
				hint={venue.placeId ? "Search again to change it." : "Search your venue by its name and city, then pick it. Its rating and reviews are read live, never copied."}
			>
				{venue.placeId && (
					<span className="flex items-center gap-1.5 pt-1.5 text-sm">
						<MapPin className="size-4 text-muted-foreground" aria-hidden="true" />
						{placeName ?? "Connected"}
					</span>
				)}
				<form onSubmit={search} className="flex gap-2">
					<Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Hotel Sombrilla, Palma" aria-label="Venue name and city" className="h-9" />
					<Button type="submit" variant="outline" disabled={isSaving || query.trim().length < 3} className="h-9 shrink-0">
						{isSaving ? <Loader2 className="animate-spin" /> : <Search data-icon="inline-start" />}
						Search
					</Button>
				</form>
				{places?.length === 0 && <span className="text-sm text-muted-foreground">Google Maps found no place with that name.</span>}
				{places?.map((place) => (
					<button
						key={place.placeId}
						type="button"
						disabled={isSaving}
						onClick={() => save({ placeId: place.placeId }, "Place connected")}
						className="flex flex-col rounded-lg px-3 py-2 text-left text-sm shadow-border transition-colors hover:bg-muted/60"
					>
						<span className="font-medium">{place.name}</span>
						<span className="text-xs text-muted-foreground">{place.address}</span>
					</button>
				))}
			</RowSettings>
			<RowSettings label="Booking link" hint="Where the button of your review campaigns sends guests. An https:// link." isLabel>
				<span className="flex gap-2">
					<Input value={bookingUrl} onChange={(event) => setBookingUrl(event.target.value)} placeholder="https://yourhotel.com/book" className="h-9" />
					<Button
						type="button"
						variant="outline"
						disabled={isSaving || bookingUrl === (venue.bookingUrl ?? "")}
						onClick={() => save({ bookingUrl: bookingUrl.trim() || null }, "Booking link saved")}
						className="h-9 shrink-0"
					>
						Save
					</Button>
				</span>
			</RowSettings>
		</CardSettings>
	);
}

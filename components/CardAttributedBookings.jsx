import Link from "next/link";
import AvatarContact from "@/components/AvatarContact";
import LinkHelp from "@/components/LinkHelp";
import TextEmpty from "@/components/TextEmpty";
import { CLICK_WINDOW_DAYS, OPEN_WINDOW_DAYS, isDayOnly } from "@/lib/booking-attribution-rules";
import { formatCount, formatDate, formatNumber } from "@/lib/format";
import { gravatarHash } from "@/lib/gravatar";
import { cn } from "@/lib/utils";

// guestmail: the bookings attributed to a sent campaign (lib/booking-attribution.js getCampaignAttribution), with how they're
// counted and what couldn't be, so the figure is never read for more than it is. Without booking dates it shows no
// figure at all, and says how to bring them in. Amounts print as the bookings carry them: the data has no currency.
// span: for the overview, its period in words, like "in the last 30 days": the card is then every campaign's
// (getAttribution).
export default function CardAttributedBookings({ attribution, timeZone, span, className, style }) {
	return (
		<section aria-label="Attributed bookings" style={style} className={cn("flex flex-col gap-4 overflow-hidden rounded-xl bg-card p-5 shadow-border sm:p-6", className)}>
			<div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
				<h2 className="text-sm font-medium text-muted-foreground">Attributed bookings</h2>
				<LinkHelp article="sending" section="attributed" className="text-xs">
					How they&apos;re counted
				</LinkHelp>
			</div>
			<Body attribution={attribution} timeZone={timeZone} span={span} />
		</section>
	);
}

function Body({ attribution, timeZone, span: periodSpan }) {
	if (attribution.status !== "measured") {
		return (
			<Notice title="No booking dates to measure with">
				None of your stays or reservations says when it was booked, so none can be attributed to a campaign. <LinkBookings />
			</Notice>
		);
	}
	const { period, bookingsUntil, attributed, influenced, made, fromRecipients = made, undatedStays = 0, bookings = [] } = attribution;
	const isCampaign = !periodSpan;
	if (isCampaign && !period) return <Notice title="Nobody has opened it yet">Bookings are attributed once someone opens or clicks it.</Notice>;
	const span = periodSpan ?? `from ${formatDate(period.from, "UTC")} to ${formatDate(period.to, timeZone)}`;
	if (made === 0) {
		return (
			<Notice title="No bookings on record for those dates">
				No booking made {span} is on record: the latest was booked {formatDate(bookingsUntil, "UTC")}. <LinkBookings />
			</Notice>
		);
	}
	const others = made - fromRecipients;
	const notes = [
		`${formatCount(made, "booking")} made ${span} ${made === 1 ? "is" : "are"} on record, the latest booked ${formatDate(bookingsUntil, "UTC")}.`,
		others > 0 && `${formatNumber(others)} of them came from contacts who didn't get this email, so ${others === 1 ? "it" : "they"} couldn't be attributed to it.`,
		undatedStays > 0 && `${formatCount(undatedStays, "stay")} of people who clicked ${undatedStays === 1 ? "has" : "have"} no booking date, and couldn't be attributed either way.`,
		attributed.sameDay > 0 &&
			`${formatNumber(attributed.sameDay)} of the attributed ${attributed.sameDay === 1 ? "was" : "were"} booked the day of the click, on a date without a time.`,
		attributed.withoutAmount > 0 && `${formatNumber(attributed.withoutAmount)} of the attributed ${attributed.withoutAmount === 1 ? "carries" : "carry"} no amount.`,
	].filter(Boolean);

	return (
		<>
			<div className="flex flex-wrap items-end gap-x-10 gap-y-4">
				<Figure value={formatNumber(attributed.bookings)} label={attributed.bookings === 1 ? "booking" : "bookings"} />
				{attributed.bookings > 0 && <Figure value={formatNumber(attributed.amount)} label="total amount" />}
				{influenced.bookings > 0 && (
					<Figure
						isSoft
						value={`${formatNumber(influenced.bookings)} · ${formatNumber(influenced.amount)}`}
						label="influenced, not added"
					/>
				)}
			</div>
			<p className="text-sm text-pretty">
				Booked within {formatCount(CLICK_WINDOW_DAYS, "day")} of a click on {isCampaign ? "this email" : "a campaign"}. A booking counts for
				one campaign only, the last one clicked.
				{influenced.bookings > 0 &&
					` Influenced: booked within ${formatCount(OPEN_WINDOW_DAYS, "day")} of opening ${isCampaign ? "it" : "one"} without a click. Mail apps open emails nobody read, so it stays apart.`}
			</p>
			<ul className="flex flex-col gap-1 text-xs text-pretty text-muted-foreground tabular-nums">
				{notes.map((note) => (
					<li key={note}>{note}</li>
				))}
			</ul>
			{bookings.length > 0 && <ListBookings bookings={bookings} total={attributed.bookings} timeZone={timeZone} />}
		</>
	);
}

function Figure({ value, label, isSoft = false }) {
	return (
		<p className="flex flex-col gap-0.5">
			<span className={cn("tracking-tight tabular-nums", isSoft ? "text-xl font-medium text-muted-foreground" : "text-3xl font-semibold")}>{value}</span>
			<span className="text-xs text-muted-foreground">{label}</span>
		</p>
	);
}

function Notice({ title, children }) {
	return (
		<div className="flex flex-col gap-1">
			<p className="text-sm font-medium">{title}</p>
			<p className="text-sm text-pretty text-muted-foreground">{children}</p>
		</div>
	);
}

function LinkBookings() {
	return (
		<Link href="/integrations" className="font-medium whitespace-nowrap text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground">
			Connect your bookings
		</Link>
	);
}

// A booking date without a time is a day in UTC, like a stay's dates (app/(app)/contacts/[id]/page.js).
function formatBooked(bookedAt, timeZone) {
	return formatDate(bookedAt, isDayOnly(bookedAt) ? "UTC" : timeZone);
}

// Each attributed booking, to check one by one: who, when they clicked and booked, the stay and its amount.
function ListBookings({ bookings, total, timeZone }) {
	return (
		<div className="-mx-5 -mb-5 border-t border-border/60 sm:-mx-6 sm:-mb-6">
			<ul className="divide-y divide-border/60">
				{bookings.map((booking) => (
					<li
						key={`${booking.contactId}-${booking.bookedAt}-${booking.from}`}
						className="relative flex items-center gap-3 px-5 py-3 transition-colors duration-150 hover:bg-muted/40 sm:px-6"
					>
						<AvatarContact email={booking.email} gravatarHash={gravatarHash(booking.email)} size={28} />
						<div className="flex min-w-0 flex-1 flex-col gap-0.5">
							<Link href={`/contacts/${booking.contactId}`} className="truncate text-sm font-medium after:absolute after:inset-0">
								{booking.firstName ?? booking.email}
							</Link>
							{booking.firstName && <span className="truncate text-xs text-muted-foreground">{booking.email}</span>}
							<span className="truncate text-xs text-muted-foreground tabular-nums">
								Clicked {formatDate(booking.clickedAt, timeZone)} · booked {formatBooked(booking.bookedAt, timeZone)}
								{booking.isSameDay && ", time unknown"}
							</span>
						</div>
						<div className="flex shrink-0 flex-col items-end gap-0.5 text-right tabular-nums">
							<span className="text-sm font-medium">{booking.amount === null ? <TextEmpty label="No amount" /> : formatNumber(booking.amount)}</span>
							<span className="text-xs text-muted-foreground">
								{formatDate(booking.from, "UTC")}
								{booking.to && ` to ${formatDate(booking.to, "UTC")}`}
							</span>
						</div>
					</li>
				))}
			</ul>
			{total > bookings.length && (
				<p className="border-t border-border/60 px-5 py-3 text-xs text-muted-foreground tabular-nums sm:px-6">
					The latest {formatNumber(bookings.length)} of {formatNumber(total)}.
				</p>
			)}
		</div>
	);
}

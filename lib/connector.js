import "server-only";
import { randomBytes } from "node:crypto";
import { scoped } from "@/lib/account-scope";
import { contactActions } from "@/lib/actions/contacts";
import { startAutomations } from "@/lib/automation-runs";
import { getAppUrl } from "@/lib/config";
import { readStayStatus } from "@/lib/guest-profile";
import { connectDb } from "@/lib/db";
import { normalizeEmail } from "@/lib/validation";
import Account from "@/models/Account";
import Contact from "@/models/Contact";
import Newsletter from "@/models/Newsletter";

// guestmail: the universal reservations connector. Each newsletter can get a private URL that any PMS, booking engine,
// channel manager or no-code tool (Zapier, Make, n8n) posts reservations to. Each one becomes a contact with its stay,
// through the same import as a CSV: the same checks, the same consent rules. The owner confirms consent once, when they
// turn it on. A guest the system says declined marketing is kept as unsubscribed: their stays count, they get no offers.
export const CONNECTOR_PATH = "/api/hooks/reservations";
export const MAX_CONNECTOR_EVENTS = 20;
const importContacts = contactActions.find(({ name }) => name === "import_contacts");

export function getConnectorUrl(token) {
	return new URL(`${CONNECTOR_PATH}/${token}`, getAppUrl()).toString();
}

export async function enableConnector(account, newsletterId, { now = new Date() } = {}) {
	await connectDb();
	const token = randomBytes(24).toString("hex");
	await Newsletter.updateOne(scoped(account, { _id: newsletterId }), { $set: { "connector.token": token, "connector.consentAt": now }, $unset: { "connector.events": 1 } });
	return token;
}

export async function disableConnector(account, newsletterId) {
	await connectDb();
	await Newsletter.updateOne(scoped(account, { _id: newsletterId }), { $unset: { connector: 1 } });
}

const pick = (source, keys) => {
	for (const key of keys) {
		const value = key.split(".").reduce((object, part) => (object == null ? undefined : object[part]), source);
		if (value !== undefined && value !== null && value !== "") return value;
	}
	return undefined;
};

const asDate = (value) => {
	if (value === undefined) return undefined;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const asNumber = (value) => (value === undefined || Number.isNaN(Number(value)) ? undefined : Number(value));

// One reservation in whatever shape the sender has: our own ({ guest, reservation }), flat fields, or the names PMSs
// and booking engines usually give them. Unknown fields are ignored. Without an email there's nothing to keep.
export function normalizeReservation(body) {
	const guest = pick(body, ["guest", "customer", "booker", "contact"]) ?? body;
	const reservation = pick(body, ["reservation", "booking", "stay"]) ?? body;
	const email = String(pick(guest, ["email", "emailAddress", "Email", "mail"]) ?? pick(body, ["email"]) ?? "").trim();
	const consent = pick(guest, ["marketingConsent", "marketing_consent", "newsletter", "optIn", "opt_in", "acceptsMarketing", "SendMarketingEmails"]);
	const event = String(pick(body, ["event", "type", "topic"]) ?? "reservation").slice(0, 60);
	const adults = asNumber(pick(reservation, ["adults", "adultCount", "adult_count", "numberOfAdults"]));
	const children = asNumber(pick(reservation, ["children", "childCount", "child_count", "numberOfChildren", "kids"]));
	const status = /cancel/i.test(event) ? "cancelled" : /no.?show/i.test(event) ? "no_show" : readStayStatus(pick(reservation, ["status", "state", "reservationStatus", "bookingStatus"]));
	const marketingConsent = consent === undefined ? undefined : consent === true || consent === "true" || consent === 1 || consent === "1" || consent === "yes";
	return {
		event,
		row: {
			email,
			firstName: pick(guest, ["firstName", "first_name", "FirstName", "givenName", "name"]),
			arrival: asDate(pick(reservation, ["arrival", "checkIn", "check_in", "checkin", "arrivalDate", "arrival_date", "startDate", "start_date", "date"])),
			departure: asDate(pick(reservation, ["departure", "checkOut", "check_out", "checkout", "departureDate", "departure_date", "endDate", "end_date"])),
			channel: pick(reservation, ["channel", "channelCode", "source", "origin"]),
			roomType: pick(reservation, ["roomType", "room_type", "unitGroup", "room"]),
			partySize: asNumber(pick(reservation, ["partySize", "party_size", "guests", "covers", "pax"])) ?? (adults !== undefined || children !== undefined ? (adults ?? 0) + (children ?? 0) : undefined),
			amount: asNumber(pick(reservation, ["amount", "total", "totalAmount", "total_amount", "price"])),
			externalId: pick(reservation, ["id", "reservationId", "reservation_id", "bookingId", "booking_id", "confirmationNumber"]),
			// guestmail: the guest's profile and when they booked, only what the sender has.
			...Object.fromEntries(
				Object.entries({
					adults,
					children,
					stayStatus: status,
					bookedAt: asDate(pick(reservation, ["bookedAt", "booked_at", "bookingDate", "booking_date", "createdAt", "created_at", "created"])),
					country: pick(guest, ["country", "countryCode", "country_code", "nationality", "NationalityCode", "address.country", "address.countryCode"]),
					language: pick(guest, ["language", "languageCode", "language_code", "locale", "LanguageCode", "preferredLanguage"]),
					birthday: pick(guest, ["birthday", "birthDate", "birth_date", "dateOfBirth", "date_of_birth", "BirthDate"]),
				}).filter(([, value]) => value !== undefined)
			),
			...(marketingConsent !== undefined && { marketingConsent }),
		},
	};
}

// A reservation starts the automations that start on a booking, for its guest once each. One row imports at once, so the
// guest is a contact by now. ponytail: a row the import queued instead (its inline run failed) starts nothing.
async function startBookingAutomations(newsletter, email) {
	const contact = await Contact.findOne(scoped(newsletter.accountId, { newsletterId: newsletter._id, email: normalizeEmail(email) }))
		.select({ newsletterId: 1, tags: 1 })
		.lean();
	if (contact) await startAutomations({ accountId: newsletter.accountId, event: "booking", contacts: [contact] });
}

function maskEmail(email) {
	const [name, domain] = email.split("@");
	return domain ? `${name.slice(0, 2)}***@${domain}` : "***";
}

// The connector's work for one call: find the newsletter by its token, turn the reservation into one import row, and
// keep the last events for the owner to see. Answers what the sender needs to know, never the contact's data.
export async function receiveReservation(token, body, { now = new Date() } = {}) {
	if (!/^[a-f0-9]{48}$/.test(String(token ?? ""))) return { status: 404, body: { error: "Unknown connector" } };
	await connectDb();
	const newsletter = await Newsletter.findOne({ "connector.token": token }, null, { crossAccount: true }).select({ _id: 1, accountId: 1 }).lean();
	if (!newsletter) return { status: 404, body: { error: "Unknown connector" } };
	const { event, row } = normalizeReservation(body ?? {});
	const record = async (entry) =>
		Newsletter.updateOne(scoped(newsletter.accountId, { _id: newsletter._id }), {
			$set: { "connector.lastEventAt": now },
			$push: { "connector.events": { $each: [{ at: now, event, ...entry }], $slice: -MAX_CONNECTOR_EVENTS } },
		});
	if (!row.email.includes("@")) {
		await record({ ok: false, error: "No guest email" });
		return { status: 422, body: { error: "The reservation has no guest email" } };
	}
	const account = await Account.findById(newsletter.accountId).lean();
	const text = (value, max) => (value === undefined ? undefined : String(value).slice(0, max));
	const clean = Object.fromEntries(
		Object.entries({
			...row,
			firstName: text(row.firstName, 200),
			channel: text(row.channel, 100),
			roomType: text(row.roomType, 100),
			externalId: text(row.externalId, 64),
				country: text(row.country, 60),
				language: text(row.language, 40),
				birthday: text(row.birthday, 20),
		}).filter(([, value]) => value !== undefined && value !== null && value !== "")
	);
	try {
		const result = await importContacts.handler({
			account,
			via: "api",
			input: {
				newsletter: String(newsletter._id),
				consent: true,
				contacts: [{ ...clean, status: row.marketingConsent === false ? "unsubscribed" : "active" }],
				total: 1,
			},
		});
		await record({ ok: true, email: maskEmail(row.email), reservation: clean.externalId ? String(clean.externalId).slice(0, 64) : undefined });
		if (!["cancelled", "no_show"].includes(row.stayStatus)) await startBookingAutomations(newsletter, row.email);
		return { status: 202, body: { ok: true, import: result.importId } };
	} catch (error) {
		await record({ ok: false, email: maskEmail(row.email), error: String(error.message).slice(0, 200) });
		return { status: 422, body: { error: error.message } };
	}
}

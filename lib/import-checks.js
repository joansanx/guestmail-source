import { classifyDomain } from "./domain-reputation.js";
import { getEmailSuggestion } from "./email-typos.js";

// guestmail: two lawful sources for a hotel or restaurant, and never a booking site's guests: Booking.com's terms forbid
// emailing them unsolicited and the LSSI 21.2 exception needs the chance to object when the email was given.
export const CONSENT_TEXT =
	"These people agreed to receive my emails, or booked directly with me and could say no to my offers when they gave their email. None come from Booking.com or other booking sites";

export const DROP_REASONS = {
	invalid: "invalid address",
	typo: "misspelled domain (gmial.com…)",
	trap: "spam trap address",
	role: "role address (info@, support@…)",
	disposable: "throwaway inbox",
	spamDomain: "spam domain",
	duplicate: "duplicate in the file",
	suppressed: "unsubscribed, bounced or complained before",
	undeliverable: "undeliverable",
	noMail: "domain can't receive email",
	ota: "masked address from a booking site (Booking.com, Expedia…)",
};

// Judged from the address alone, and taken when one contact is added: an import's account can bring these back.
export const BRING_BACK_REASONS = ["role", "disposable"];
// Only counted: an invalid address isn't one, a duplicate went in once, and the never-email list is every account's,
// so it never shows address by address.
export const UNLISTED_REASONS = ["invalid", "duplicate", "undeliverable"];

// Addresses that say what they are: published on web pages to catch scrapers, never by a person signing up.
const TRAP_LOCAL_PART = /spam[._-]?trap|honey[._-]?pot/;

// Shared inboxes nobody signed up with personally; they complain and bounce more than people do.
const ROLE_LOCAL_PARTS = new Set([
	"abuse",
	"accounting",
	"admin",
	"administrator",
	"billing",
	"careers",
	"compliance",
	"contact",
	"customerservice",
	"enquiries",
	"feedback",
	"hello",
	"help",
	"helpdesk",
	"hostmaster",
	"hr",
	"info",
	"inquiries",
	"jobs",
	"legal",
	"mail",
	"mailer-daemon",
	"marketing",
	"media",
	"newsletter",
	"no-reply",
	"noreply",
	"office",
	"postmaster",
	"press",
	"privacy",
	"root",
	"sales",
	"security",
	"spam",
	"support",
	"team",
	"webmaster",
]);

// For a normalized address: why it shouldn't become a contact that gets emails, or null. lists: the downloaded domain
// lists in use (lib/domain-lists.js), on top of the throwaway inboxes bundled with the code.
// guestmail: the relay addresses booking sites give hotels instead of the guest's own. Booking.com's terms (2.9.3) forbid
// unsolicited emails to them, and the guest never gave the hotel that address.
const OTA_RELAY_DOMAINS = ["guest.booking.com", "expediapartnercentral.com", "guest.airbnb.com", "agoda-messaging.com"];

export function isOtaRelay(domain) {
	return OTA_RELAY_DOMAINS.some((relay) => domain === relay || domain.endsWith(`.${relay}`));
}

export function getDropReason(email, lists = {}) {
	const [localPart, domain] = email.split("@");
	if (isOtaRelay(domain)) return "ota";
	if (TRAP_LOCAL_PART.test(localPart)) return "trap";
	if (getEmailSuggestion(email)) return "typo";
	if (ROLE_LOCAL_PARTS.has(localPart.split("+")[0])) return "role";
	const reputation = classifyDomain(domain, lists);
	if (reputation === "spam") return "spamDomain";
	if (reputation === "disposable") return "disposable";
	return null;
}

// A signup form, add_contact or MCP adding one normalized address: what to tell the person typing it, or null.
// Role and throwaway addresses still sign up, since people do sign up with them themselves.
export function getSignupEmailProblem(email) {
	const suggestion = getEmailSuggestion(email);
	if (suggestion) return `Did you mean ${suggestion}?`;
	if (TRAP_LOCAL_PART.test(email.split("@")[0])) return "This address can't be added";
	return null;
}

export function emptyDropped() {
	return Object.fromEntries(Object.keys(DROP_REASONS).map((reason) => [reason, 0]));
}

export function addDropped(total, dropped) {
	return Object.fromEntries(Object.keys(DROP_REASONS).map((reason) => [reason, (total[reason] ?? 0) + (dropped[reason] ?? 0)]));
}

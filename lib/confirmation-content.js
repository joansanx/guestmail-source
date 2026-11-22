import { CONFIRM_URL_PLACEHOLDER } from "./action-links.js";
import { formatSentence } from "./format.js";
import { htmlButton, htmlParagraph, isSameEmail, readEmail, toEmailContent } from "./newsletter-emails.js";
import { renderEmail } from "./render-email.js";

export { CONFIRM_URL_PLACEHOLDER };
const CONFIRM_LINK = `href="${CONFIRM_URL_PLACEHOLDER}"`;
const NEXT_STEP = "Confirm your email and the next issue lands in your inbox.";
export const CONFIRM_BUTTON_TEXT = "Confirm my subscription";

// The built-in email, and where a newsletter's own version starts, in the editor's HTML. Kept short: one job, one button.
// guestmail: in the venue's language (its content agent's).
const DEFAULT_WORDS = {
	en: {
		fallback: "the newsletter",
		intro: (name) => `You asked to get ${name}.`,
		next: NEXT_STEP,
		subject: (name) => `Confirm your subscription to ${name}`,
		preview: (name) => `One click and you're in. Until then, you won't get ${name}.`,
		lead: "One click and you're in.",
		button: CONFIRM_BUTTON_TEXT,
		ignore: "Didn't sign up? Ignore this email and you won't hear from us again.",
	},
	es: {
		fallback: "la newsletter",
		intro: (name) => `Pediste recibir los correos de ${name}.`,
		next: "Confirma tu email y el próximo correo llegará a tu bandeja.",
		subject: (name) => `Confirma tu suscripción a ${name}`,
		preview: (name) => `Un clic y ya estás dentro. Hasta entonces no recibirás nada de ${name}.`,
		lead: "Un clic y ya estás dentro.",
		button: "Confirmar mi suscripción",
		ignore: "¿No te has suscrito? Ignora este correo y no volverás a saber de nosotros.",
	},
};

function getDefaultConfirmation(newsletter) {
	const words = DEFAULT_WORDS[newsletter?.agent?.language === "es" ? "es" : "en"];
	const name = newsletter?.name?.trim() || words.fallback;
	const description = formatSentence(newsletter?.description);
	const intro = words.intro(name);
	return {
		subject: words.subject(name),
		previewText: words.preview(name),
		format: "rich",
		html: [
			htmlParagraph(words.lead, { isBold: true }),
			...(description ? [htmlParagraph(`${intro} ${description}`), htmlParagraph(words.next)] : [htmlParagraph(`${intro} ${words.next}`)]),
			htmlButton(CONFIRM_URL_PLACEHOLDER, words.button),
			htmlParagraph(words.ignore),
		].join(""),
	};
}

export function isDefaultConfirmation(confirmation, ...newsletters) {
	return newsletters.some((newsletter) => isSameEmail(confirmation, getDefaultConfirmation(newsletter)));
}

// Markdown links encode the braces (%7B%7B), so in Markdown only an HTML link keeps the placeholder; in the editor, a
// button or a link to it does.
export function getConfirmationProblem(confirmation) {
	if (!confirmation?.subject?.trim()) return "Confirmation email needs a subject";
	if (!renderEmail(toEmailContent(confirmation)).html.includes(CONFIRM_LINK)) {
		return `Confirmation email needs its button: a link to ${CONFIRM_URL_PLACEHOLDER}, which becomes each subscriber's own link`;
	}
	return null;
}

// The newsletter's own confirmation email, or null without one that keeps its button.
export function getOwnConfirmation(newsletter) {
	const custom = newsletter?.confirmation && readEmail(newsletter.confirmation);
	return custom && !getConfirmationProblem(custom) ? toEmailContent(custom) : null;
}

// What a new subscriber gets when their newsletter asks them to confirm. It's the only email they get,
// so a newsletter can write its own; without one, if it lost its button, or while the content check holds it
// (builtIn), the built-in one goes out.
export function getConfirmationContent(newsletter, { builtIn = false } = {}) {
	return (!builtIn && getOwnConfirmation(newsletter)) || toEmailContent(getDefaultConfirmation(newsletter));
}

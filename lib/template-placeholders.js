import { CAMPAIGN_DESIGNS, fillDesign } from "./campaign-designs.js";
import { CAMPAIGN_TEMPLATES, TEMPLATE_LANGUAGES, fillTemplate } from "./campaign-templates.js";

// guestmail: the [square brackets] our templates and designs leave for the owner to fill in: a price, a date, a line
// about a dish. Sent as they are they reach every guest, so the review step names the first one left
// (lib/content-warnings.js). Only these exact words: a writer's own "[a note]" isn't one. A bracket followed by "(" is
// a Markdown link's text. No bracket inside and 160 characters at most, so a long text full of "[" reads in linear time.
const BRACKET_PATTERN = /\[[^\][\n]{1,160}\](?!\()/g;

function readBrackets(text) {
	return String(text ?? "")
		.replace(/<[^>]+>/g, " ")
		.match(BRACKET_PATTERN);
}

function collect() {
	const phrases = new Set();
	const add = (...texts) => texts.forEach((text) => (readBrackets(text) ?? []).forEach((phrase) => phrases.add(phrase.toLowerCase())));
	for (const language of TEMPLATE_LANGUAGES) {
		// With and without a booking link: without one, a template asks for it in brackets too.
		for (const bookingUrl of ["https://book.example", ""]) {
			for (const template of CAMPAIGN_TEMPLATES) {
				const { subject, previewText, markdown } = fillTemplate(template, language, { venue: "x", bookingUrl });
				add(subject, previewText, markdown);
			}
			for (const design of CAMPAIGN_DESIGNS) {
				if (!design[language]) continue;
				const { subject, previewText, html } = fillDesign(design, language, { venue: "x", bookingUrl, baseUrl: "https://app.example" });
				add(subject, previewText, html);
			}
		}
	}
	return phrases;
}

const PHRASES = collect();

// The first of them left in a text: { words, index }, or null.
export function findTemplatePlaceholder(text) {
	for (const match of String(text ?? "").matchAll(BRACKET_PATTERN)) {
		if (PHRASES.has(match[0].toLowerCase())) return { words: match[0], index: match.index };
	}
	return null;
}

export function countTemplatePlaceholders() {
	return PHRASES.size;
}

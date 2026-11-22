// guestmail: layout blocks, what gives an issue a designed look: a header with the business's name or its logo, and rows
// of two or three columns, a photo and its caption in each. An issue keeps a header as <div data-header="">…</div> and a
// row as <div data-columns="3"><div data-column="">…</div>…</div>, so what only reads words, links and pictures reads
// them as they are. The editor edits them (lib/editor-layout.js), emails draw them with tables (drawLayoutBlocks) and the
// website with CSS (app/globals.css).
export const HEADER_MARKER = ' data-header=""';
export const COLUMN_MARKER = ' data-column=""';
const COLUMN_COUNTS = [2, 3];
// A row's cells and the gaps between them, which stack and go on a phone (getLayoutEmailStyles).
const EMAIL_COLUMN_CLASS = "email-column";
const EMAIL_GUTTER_CLASS = "email-gutter";
// Emails are 600px wide (lib/render-email.js).
const EMAIL_WIDTH = 600;
const GUTTER = 16;
const STACK_UNDER = 480;

// A header and a row as the cleaner writes them (lib/clean-html.js): a header holding no <div>, and a row of two or three
// columns and nothing else, none holding a <div>. Each read stops at the next <div> or </div>, so one left open costs
// nothing.
const WITHOUT_DIV = String.raw`((?:(?!<\/?div\b)[\s\S])*)`;
const HEADER_PATTERN = new RegExp(String.raw`<div data-header="">${WITHOUT_DIV}<\/div>`, "g");
const COLUMN = String.raw`<div data-column="">${WITHOUT_DIV}<\/div>`;
// One run of spaces between two columns, read one way only: two would be tried every way on a long run of them.
const ROW_PATTERN = new RegExp(String.raw`<div data-columns="[23]">\s*((?:${COLUMN}\s*){2,3})<\/div>`, "g");
const COLUMN_PATTERN = new RegExp(COLUMN, "g");
const IMAGE_PATTERN = /<img\b[^>]*>/g;

// A row's attribute as the cleaner keeps it. A row of any other number of columns isn't one: its blocks show one under
// the other.
export function getColumnsAttributes(value) {
	const count = Number(value);
	return COLUMN_COUNTS.includes(count) ? ` data-columns="${count}"` : "";
}

// An attribute's value as the cleaner wrote it, already escaped.
function readAttribute(tag, name) {
	return new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];
}

// A logo keeps the size the editor gave it, in the middle of the header.
function headerImage(tag) {
	const size = ["width", "height"].map((name) => (readAttribute(tag, name) ? ` ${name}="${readAttribute(tag, name)}"` : "")).join("");
	return `<img src="${readAttribute(tag, "src") ?? ""}" alt="${readAttribute(tag, "alt") ?? ""}"${size} style="display:inline-block;max-width:100%;height:auto;margin:0;border:0;">`;
}

// A header in an email: the business's name in the theme's heading font and color, or its logo, centered over a rule.
function drawHeader(content, theme, classes) {
	const inner = content.replaceAll("<p>", '<p style="margin:0;">').replace(IMAGE_PATTERN, headerImage);
	const tracking = theme.headingTracking ? `letter-spacing:${theme.headingTracking};` : "";
	return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;"><tr><td class="${classes.text} ${classes.rule}" align="center" style="padding:4px 0 20px;border-bottom:1px solid ${theme.border};font-family:${theme.fonts.heading ?? theme.fonts.body};font-size:24px;line-height:1.3;font-weight:${theme.headingWeight ?? 700};${tracking}color:${theme.heading};text-align:center;">${inner}</td></tr></table>`;
}

// A column's picture fills it. Outlook on Windows reads the width attribute alone, so it gets the column's.
function columnImage(tag, width, theme) {
	const [ownWidth, ownHeight] = ["width", "height"].map((name) => Number(readAttribute(tag, name)));
	const height = ownWidth > 0 && ownHeight > 0 ? ` height="${Math.round((ownHeight * width) / ownWidth)}"` : "";
	return `<img src="${readAttribute(tag, "src") ?? ""}" alt="${readAttribute(tag, "alt") ?? ""}" width="${width}"${height} style="display:block;width:100%;max-width:100%;height:auto;margin:0 0 12px;border:0;border-radius:${theme.radius.image}px;">`;
}

// A row in an email: a table every mail app lays out, a cell per column and one between two of them. Outlook on Windows
// doesn't pass a table's font on to the tables in it, so each cell says its own.
function drawRow(columns, theme, classes) {
	const width = Math.floor((EMAIL_WIDTH - GUTTER * (columns.length - 1)) / columns.length);
	// A whole number, which every app reads: what's left over is shared out between the columns.
	const share = `${Math.floor((width / EMAIL_WIDTH) * 100)}%`;
	const cells = columns.map((content) => {
		const inner = content
			.replaceAll("<p>", '<p style="margin:0 0 6px;">')
			.replace(/<h([1-3])>/g, '<h$1 style="margin:0 0 6px;font-size:17px;line-height:1.3;">')
			.replace(IMAGE_PATTERN, (tag) => columnImage(tag, width, theme));
		return `<td class="${EMAIL_COLUMN_CLASS} ${classes.text}" width="${share}" valign="top" style="width:${share};padding:0;font-family:${theme.fonts.body};font-size:15px;line-height:1.5;color:${theme.text};vertical-align:top;">${inner}</td>`;
	});
	const gutter = `<td class="${EMAIL_GUTTER_CLASS}" width="${GUTTER}" style="width:${GUTTER}px;font-size:0;line-height:0;"></td>`;
	return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;table-layout:fixed;"><tr>${cells.join(gutter)}</tr></table>`;
}

// An issue's cleaned HTML with its headers and rows drawn for an email. theme: the email's (getEmailTheme). classes:
// { text, rule }, what mail apps in dark mode repaint (lib/render-email.js). A header or a row holding anything it
// shouldn't, like another block's <div>, stays as it is: its blocks one under the other.
export function drawLayoutBlocks(html, theme, classes) {
	if (!html.includes(" data-header=") && !html.includes(" data-columns=")) return html;
	const withHeaders = html.replace(HEADER_PATTERN, (_, content) => drawHeader(content, theme, classes));
	return withHeaders.replace(ROW_PATTERN, (_, columns) => drawRow([...columns.matchAll(COLUMN_PATTERN)].map((column) => column[1]), theme, classes));
}

// On a phone, a row's columns go one under the other. A <style> of its own, only in an email with a row: an app that
// drops what it can't read keeps the email's other styles, and shows the columns side by side.
export function getLayoutEmailStyles(bodyHtml) {
	if (!bodyHtml.includes(EMAIL_COLUMN_CLASS)) return "";
	return `\n<style>\n@media (max-width: ${STACK_UNDER}px) {\n.${EMAIL_COLUMN_CLASS} { display: block !important; width: 100% !important; padding-bottom: 16px !important; }\n.${EMAIL_GUTTER_CLASS} { display: none !important; }\n}\n</style>`;
}

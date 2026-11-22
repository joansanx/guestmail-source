import { Node } from "@tiptap/core";
import { getStarterPhotos, getStockImage } from "@/lib/stock-photos";
import { getVenueLanguage } from "@/lib/venue-legal";

// guestmail: the editor's layout blocks, kept as the issue keeps them (lib/layout-blocks.js) and drawn by the archive's
// own styles (app/globals.css), so the editor shows them as readers will.

// The business's name, or its logo, centered at the top of an issue.
export const Header = Node.create({
	name: "header",
	group: "block",
	content: "(paragraph | image)+",
	defining: true,
	parseHTML() {
		return [{ tag: "div[data-header]" }];
	},
	renderHTML() {
		return ["div", { "data-header": "" }, 0];
	},
});

// A row of two or three columns side by side. It says how many it holds, never a number it was given.
export const Columns = Node.create({
	name: "columns",
	group: "block",
	content: "column{2,3}",
	defining: true,
	isolating: true,
	parseHTML() {
		return [{ tag: "div[data-columns]" }];
	},
	renderHTML({ node }) {
		return ["div", { "data-columns": String(node.childCount) }, 0];
	},
});

// One column of a row: a photo and its caption, a heading or a button. No block that is a <div> of its own but a button,
// which emails draw before the row (lib/render-email.js).
export const Column = Node.create({
	name: "column",
	content: "(paragraph | heading | image | button)+",
	defining: true,
	isolating: true,
	parseHTML() {
		return [{ tag: "div[data-column]" }];
	},
	renderHTML() {
		return ["div", { "data-column": "" }, 0];
	},
});

// What a block the slash menu adds says until it's written over, in the venue's language.
const STARTER_TEXT = {
	en: { name: "Your business name", headline: "Your headline", title: "Title", line: "A line about it" },
	es: { name: "El nombre de tu negocio", headline: "Tu titular", title: "Título", line: "Una línea sobre ello" },
};

// The blocks the slash menu adds (components/MenuSlash.jsx), as the editor's content: a header with the venue's name; a
// banner, a photo across the column and a headline under it; and a row of count photos with their captions. The photos
// are GuestMail's own for the venue's kind (lib/stock-photos.js), there to be swapped. baseUrl: where they load from.
export function getHeaderContent(newsletter) {
	const text = newsletter?.name?.trim() || STARTER_TEXT[getVenueLanguage(newsletter)].name;
	return { type: "header", content: [{ type: "paragraph", content: [{ type: "text", text }] }] };
}

export function getBannerContent(newsletter, baseUrl) {
	const language = getVenueLanguage(newsletter);
	const [photo] = getStarterPhotos(newsletter?.venue?.kind);
	return [
		{ type: "image", attrs: getStockImage(photo, { baseUrl, language }) },
		{ type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: STARTER_TEXT[language].headline }] },
	];
}

export function getPhotoRowContent(count, newsletter, baseUrl) {
	const language = getVenueLanguage(newsletter);
	const { title, line } = STARTER_TEXT[language];
	const photos = getStarterPhotos(newsletter?.venue?.kind).slice(1, count + 1);
	return {
		type: "columns",
		content: photos.map((photo) => ({
			type: "column",
			content: [
				{ type: "image", attrs: getStockImage(photo, { baseUrl, language }) },
				{ type: "paragraph", content: [{ type: "text", marks: [{ type: "bold" }], text: title }] },
				{ type: "paragraph", content: [{ type: "text", text: line }] },
			],
		})),
	};
}

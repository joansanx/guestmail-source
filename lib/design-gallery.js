import "server-only";
import { fillDesign } from "@/lib/campaign-designs";
import { getAppUrl } from "@/lib/config";
import { toPreviewHtml } from "@/lib/email-preview";
import { renderEmail } from "@/lib/render-email";

// guestmail: a design (lib/campaign-designs.js) as the dashboard's gallery shows it (components/GalleryDesigns.jsx): its
// email as it would go out, in the newsletter's own theme and with its name, for a small frame. It loads the photos'
// small copies, fills a reader's name in as previews do, and never scrolls. newsletter: its name, venue and theme.
export function getDesignPreview(design, language, newsletter) {
	const baseUrl = getAppUrl();
	const draft = fillDesign(design, language, { venue: newsletter.name, bookingUrl: newsletter.venue?.bookingUrl ?? newsletter.venue?.website, baseUrl });
	const { html } = renderEmail({ format: "rich", html: draft.html, subject: draft.subject, previewText: draft.previewText, newsletter, isWebVersion: true });
	return toPreviewHtml(html)
		.replaceAll(`${baseUrl}/stock/`, "/stock/thumbs/")
		.replace("</head>", "<style>html{overflow:hidden}</style></head>");
}

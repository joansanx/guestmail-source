import { APP_NAME } from "./config.js";

// guestmail: this fork's own source, which the AGPL asks to offer to whoever uses the service. Upstream: github.com/marclou/mailcheap.
// The code this service runs, published by scripts/publish_source.sh at each deploy (the deployed commit, no history).
export const SOURCE_URL = "https://github.com/joansanx/guestmail-source";

export const TAGLINE = "Email marketing for hotels and restaurants";

// Pages leave openGraph to the public layout: a page's openGraph would replace the layout's, share image
// included. Social cards take the page's title and description from these, and "./" resolves to each page's own
// address.
export const SITE_OPEN_GRAPH = { type: "website", siteName: APP_NAME, locale: "en_US", url: "./" };

export function getPageMetadata({ title, description, path }) {
	return { title, description, alternates: { canonical: path } };
}

import { getArchiveUrls } from "./archive-hosts.js";
import { getPrivacyNotice } from "./venue-legal.js";

// guestmail: the privacy notice a venue's website shows under its forms, worked out on the server so a client component
// can draw it (components/NoticePrivacy.jsx).
export function getSiteNotice(newsletter) {
	const siteUrl = getArchiveUrls(newsletter).siteIndex.replace(/\/$/, "");
	return getPrivacyNotice(newsletter, { siteUrl, hasOffer: Boolean(newsletter.signupForm?.offerText && newsletter.signupForm?.offerCode) });
}

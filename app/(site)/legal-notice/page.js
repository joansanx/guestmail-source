import { PageSite, getSiteMetadata } from "@/components/marketing/PagesSite";

export const metadata = getSiteMetadata("en", "legal-notice");

// guestmail: this page's words are content/site/en/legal-notice.md (components/marketing/PagesSite.jsx).
export default function LegalNoticePage() {
	return <PageSite lang="en" slug="legal-notice" />;
}

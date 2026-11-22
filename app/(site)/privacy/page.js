import { PageSite, getSiteMetadata } from "@/components/marketing/PagesSite";

export const metadata = getSiteMetadata("en", "privacy");

// guestmail: this page's words are content/site/en/privacy.md (components/marketing/PagesSite.jsx).
export default function PrivacyPage() {
	return <PageSite lang="en" slug="privacy" />;
}

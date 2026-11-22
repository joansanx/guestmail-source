import { PageSite, getSiteMetadata } from "@/components/marketing/PagesSite";

export const metadata = getSiteMetadata("en", "terms");

// guestmail: this page's words are content/site/en/terms.md (components/marketing/PagesSite.jsx).
export default function TermsPage() {
	return <PageSite lang="en" slug="terms" />;
}

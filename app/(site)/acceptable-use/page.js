import { PageSite, getSiteMetadata } from "@/components/marketing/PagesSite";

export const metadata = getSiteMetadata("en", "acceptable-use");

// guestmail: this page's words are content/site/en/acceptable-use.md (components/marketing/PagesSite.jsx).
export default function AcceptableUsePage() {
	return <PageSite lang="en" slug="acceptable-use" />;
}

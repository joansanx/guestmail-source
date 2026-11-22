import { PageSite, getSiteMetadata } from "@/components/marketing/PagesSite";

export const metadata = getSiteMetadata("en", "cookies");

// guestmail: this page's words are content/site/en/cookies.md (components/marketing/PagesSite.jsx).
export default function CookiesPage() {
	return <PageSite lang="en" slug="cookies" />;
}

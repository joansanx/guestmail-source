import { PageSite, getSiteMetadata } from "@/components/marketing/PagesSite";

export const metadata = getSiteMetadata("en", "home");

// guestmail: the hosted version's home for visitors who aren't signed in (proxy.js shows it at /). Its words are
// content/site/en/home.md.
export default function LandingPage() {
	return <PageSite lang="en" slug="home" />;
}

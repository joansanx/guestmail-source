import { PageSite, getSiteMetadata } from "@/components/marketing/PagesSite";

export const metadata = getSiteMetadata("en", "subprocessors");

// guestmail: this page's words are content/site/en/subprocessors.md (components/marketing/PagesSite.jsx).
export default function SubprocessorsPage() {
	return <PageSite lang="en" slug="subprocessors" />;
}

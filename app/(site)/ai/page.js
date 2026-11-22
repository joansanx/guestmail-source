import { PageSite, getSiteMetadata } from "@/components/marketing/PagesSite";

export const metadata = getSiteMetadata("en", "ai");

// guestmail: this page's words are content/site/en/ai.md (components/marketing/PagesSite.jsx).
export default function AiPage() {
	return <PageSite lang="en" slug="ai" />;
}

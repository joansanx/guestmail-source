import { PageSite, getSiteMetadata } from "@/components/marketing/PagesSite";

export const metadata = getSiteMetadata("en", "agents");

// guestmail: this page's words are content/site/en/agents.md (components/marketing/PagesSite.jsx).
export default function AgentsPage() {
	return <PageSite lang="en" slug="agents" />;
}

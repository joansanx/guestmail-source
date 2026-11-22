import { PageSite, getSiteMetadata } from "@/components/marketing/PagesSite";

export const metadata = getSiteMetadata("en", "dpa");

// guestmail: this page's words are content/site/en/dpa.md (components/marketing/PagesSite.jsx).
export default function DpaPage() {
	return <PageSite lang="en" slug="dpa" />;
}

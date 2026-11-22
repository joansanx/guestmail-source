import { PageSite, getSiteMetadata } from "@/components/marketing/PagesSite";

export const metadata = getSiteMetadata("en", "pricing");

// guestmail: this page's words are content/site/en/pricing.md (components/marketing/PagesSite.jsx).
export default function PricingPage() {
	return <PageSite lang="en" slug="pricing" />;
}

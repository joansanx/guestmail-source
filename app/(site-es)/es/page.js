import { PageSite, getSiteMetadata } from "@/components/marketing/PagesSite";

export const metadata = getSiteMetadata("es", "home");

// guestmail: the landing page in Spanish. Its words are content/site/es/home.md.
export default function LandingPageEs() {
	return <PageSite lang="es" slug="home" />;
}

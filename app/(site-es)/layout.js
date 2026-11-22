import SiteLayout, { metadata as siteMetadata } from "@/app/(site)/layout";
import { SITE_OPEN_GRAPH } from "@/lib/site";

// guestmail: the marketing site in Spanish, under /es: the public pages' layout with the header and footer in Spanish.
export const metadata = { ...siteMetadata, openGraph: { ...SITE_OPEN_GRAPH, locale: "es_ES" } };

export default function SiteLayoutEs({ children }) {
	return <SiteLayout lang="es">{children}</SiteLayout>;
}

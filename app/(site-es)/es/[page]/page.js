import { notFound } from "next/navigation";
import { PageSite, getSiteMetadata } from "@/components/marketing/PagesSite";
import { PAGE_SLUGS } from "@/lib/marketing/site-pages";

const SLUGS = PAGE_SLUGS.filter((slug) => slug !== "home");

// Only the site's own pages: anything else under /es answers 404.
export const dynamicParams = false;

export function generateStaticParams() {
	return SLUGS.map((page) => ({ page }));
}

export async function generateMetadata({ params }) {
	const { page } = await params;
	return SLUGS.includes(page) ? getSiteMetadata("es", page) : {};
}

// guestmail: every page of the site in Spanish, each from content/site/es/<page>.md.
export default async function SitePageEs({ params }) {
	const { page } = await params;
	if (!SLUGS.includes(page)) notFound();
	return <PageSite lang="es" slug={page} />;
}

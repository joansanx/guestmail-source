import { PagePost, getPostMetadata, getPostParams } from "@/components/marketing/PagesSite";

export function generateStaticParams() {
	return getPostParams("es");
}

export async function generateMetadata({ params }) {
	return getPostMetadata("es", (await params).slug);
}

// guestmail: an article of the blog, content/blog/es/<slug>.md. A draft answers 404.
export default async function PostPage({ params }) {
	return <PagePost lang="es" slug={(await params).slug} />;
}

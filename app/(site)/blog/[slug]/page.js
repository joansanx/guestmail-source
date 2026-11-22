import { PagePost, getPostMetadata, getPostParams } from "@/components/marketing/PagesSite";

export function generateStaticParams() {
	return getPostParams("en");
}

export async function generateMetadata({ params }) {
	return getPostMetadata("en", (await params).slug);
}

// guestmail: an article of the blog, content/blog/en/<slug>.md. A draft answers 404.
export default async function PostPage({ params }) {
	return <PagePost lang="en" slug={(await params).slug} />;
}

import { PageBlog, getBlogMetadata } from "@/components/marketing/PagesSite";

export function generateMetadata() {
	return getBlogMetadata("es");
}

// guestmail: the blog's list, from the published files of content/blog/es.
export default function BlogPage() {
	return <PageBlog lang="es" />;
}

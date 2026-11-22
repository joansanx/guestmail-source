import { PageBlog, getBlogMetadata } from "@/components/marketing/PagesSite";

export function generateMetadata() {
	return getBlogMetadata("en");
}

// guestmail: the blog's list, from the published files of content/blog/en.
export default function BlogPage() {
	return <PageBlog lang="en" />;
}

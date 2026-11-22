import { respondFeed } from "@/lib/marketing/content-render";

// guestmail: the blog's feed.
export function GET() {
	return respondFeed("es");
}

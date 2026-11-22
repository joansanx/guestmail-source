import { respondTwin } from "@/lib/marketing/content-render";

// guestmail: every public page's twin in Markdown. /pricing.md is rendered here, as /md/pricing (proxy.js).
export async function GET(request, { params }) {
	return respondTwin((await params).path);
}

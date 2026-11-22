import { Link2Off } from "lucide-react";
import CardNotice from "@/components/CardNotice";
import FormApprove from "@/components/FormApprove";
import { viewApprovalLink } from "@/lib/pilot";

// guestmail: where the autopilot's email takes a venue's owner (lib/pilot.js): the campaign it prepared, whole, and the
// button that schedules it. Opening the page decides nothing: mail filters open every link in an email, so only the
// button's request approves. The URL carries the approval token: keep it out of search results and referrer headers.
export const metadata = {
	title: "Approve a campaign",
	robots: { index: false, follow: false },
	referrer: "no-referrer",
};

export default async function ApprovePage({ searchParams }) {
	const { token } = await searchParams;
	const validToken = typeof token === "string" ? token : null;
	const view = validToken ? await readView(validToken) : null;

	return (
		<main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10 sm:py-16">
			{view ? (
				<FormApprove token={validToken} view={view} />
			) : (
				<CardNotice icon={Link2Off} title="This link doesn't work">
					It may be older than 7 days. The newest campaign to approve is in your latest email from GuestMail, and on the Content agent page.
				</CardNotice>
			)}
		</main>
	);
}

async function readView(token) {
	try {
		return await viewApprovalLink(token);
	} catch (error) {
		console.error("[approve] Could not load the proposal:", error.message);
		return null;
	}
}

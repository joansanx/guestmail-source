import { handleResendRequest } from "@/lib/resend-webhook";

// Deliveries, bounces, spam complaints, delays, failures and suppressions of every account's emails at Resend.
export function POST(request) {
	return handleResendRequest(request);
}

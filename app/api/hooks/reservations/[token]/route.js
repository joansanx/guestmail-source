import { NextResponse } from "next/server";
import { receiveReservation } from "@/lib/connector";
import { isRateLimited } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
const MAX_BODY = 50_000;

// guestmail: the universal reservations connector (lib/connector.js). POST one reservation as JSON; the URL's token
// says which newsletter it's for. 202: it's on its way into the contacts. 422: nothing to keep, with the reason.
export async function POST(request, { params }) {
	const { token } = await params;
	if (await isRateLimited({ name: "reservation-connector", limit: 600, window: "1 h", key: String(token).slice(0, 48) })) {
		return NextResponse.json({ error: "Too many reservations this hour" }, { status: 429 });
	}
	const text = await request.text();
	if (text.length > MAX_BODY) return NextResponse.json({ error: "Too large" }, { status: 413 });
	let body;
	try {
		body = JSON.parse(text || "{}");
	} catch {
		return NextResponse.json({ error: "Send JSON" }, { status: 400 });
	}
	const result = await receiveReservation(token, body);
	return NextResponse.json(result.body, { status: result.status });
}

import { getErrorStatus, toActionError } from "@/lib/actions/errors";
import { runAction } from "@/lib/actions/run-action";
import { getCurrentAccount } from "@/lib/auth";
import { getSelectedNewsletter } from "@/lib/selected-newsletter";
import { MAX_UPLOAD_BYTES } from "@/lib/upload-image";

// guestmail: the Content agent page's PDF upload: the file as the body, through the same read_menu action as the API,
// for the newsletter the dashboard has open. Like the image uploads' route (app/api/uploads), only the dashboard's own
// pages post here. The file goes to the agent, which reads it, and is kept nowhere.
export async function POST(request) {
	const site = request.headers.get("sec-fetch-site");
	if (site && site !== "same-origin") return Response.json({ error: "Forbidden" }, { status: 403 });
	if (!(await getCurrentAccount())) return Response.json({ error: "Unauthorized" }, { status: 401 });
	const { user, account, selected } = await getSelectedNewsletter();
	if (!selected) return Response.json({ error: "Create a newsletter first" }, { status: 404 });

	const bytes = Buffer.from(await request.arrayBuffer());
	if (bytes.length > MAX_UPLOAD_BYTES) return Response.json({ error: "The PDF must be under 4 MB" }, { status: 413 });
	try {
		const pilot = await runAction("read_menu", {
			user,
			account,
			via: "dashboard",
			input: { newsletter: String(selected._id), base64: bytes.toString("base64"), fileName: request.headers.get("x-file-name")?.slice(0, 120) || undefined },
		});
		return Response.json({ pilot });
	} catch (error) {
		const { code, message } = toActionError(error);
		return Response.json({ error: message, code }, { status: code === "validation_failed" ? 415 : getErrorStatus(code) });
	}
}

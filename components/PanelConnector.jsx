"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Loader2, Plug } from "lucide-react";
import { turnOffConnector, turnOnConnector } from "@/app/(app)/integrations/actions";
import CardSettings from "@/components/CardSettings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

const SAMPLE = `{
  "event": "reservation.created",
  "guest": {
    "email": "ana@example.com",
    "firstName": "Ana",
    "marketingConsent": true
  },
  "reservation": {
    "id": "R-10234",
    "arrival": "2026-12-04",
    "departure": "2026-12-07",
    "channel": "direct",
    "roomType": "Double with terrace",
    "adults": 2,
    "children": 0,
    "amount": 540
  }
}`;

// guestmail: the reservations connector (lib/actions/connector.js): its private URL, how to post to it, and what came in.
export default function PanelConnector({ newsletterId, connector, problem }) {
	const [state, setState] = useState(connector);
	const [hasConsent, setHasConsent] = useState(false);
	const [isSaving, startSaving] = useTransition();
	const [copied, setCopied] = useState(false);
	if (!state) return <p className="rounded-xl bg-card px-4 py-3 text-sm text-muted-foreground shadow-border">{problem ?? "The connector can't be read right now."}</p>;

	function run(action, success) {
		startSaving(async () => {
			const result = await action(newsletterId);
			if (result?.error) return void toast.error(result.error);
			setState(result);
			toast.success(success);
		});
	}

	async function copy() {
		await navigator.clipboard.writeText(state.url);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	}

	return (
		<div className="flex flex-col gap-6">
			<CardSettings
				title={
					<span className="flex items-center gap-2">
						<Plug className="size-4" aria-hidden="true" /> Reservations connector
					</span>
				}
				action={state.enabled && <Badge>On</Badge>}
			>
				<div className="flex flex-col gap-4 px-4 pb-4 text-sm text-pretty">
					<p className="text-muted-foreground">
						Any PMS, booking engine, channel manager or tool like Zapier, Make or n8n can send each new reservation here. The guest becomes a contact
						with the stay, ready for segments like last visit or booking channel. A guest your system says declined marketing is kept as unsubscribed.
					</p>
					{state.enabled ? (
						<>
							<div className="flex items-center gap-2">
								<code className="min-w-0 flex-1 truncate rounded-md bg-muted px-3 py-2 font-mono text-xs">{state.url}</code>
								<Button size="sm" variant="outline" onClick={copy}>
									{copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />} Copy
								</Button>
							</div>
							<p className="text-xs text-muted-foreground">Keep this URL secret: whoever has it can add contacts. A new URL replaces it at once.</p>
							<div className="flex flex-wrap gap-2">
								<Button size="sm" variant="outline" disabled={isSaving} onClick={() => run(turnOnConnector, "New URL ready: update it in your system")}>
									New URL
								</Button>
								<Button size="sm" variant="outline" disabled={isSaving} onClick={() => run(turnOffConnector, "Connector off")}>
									Turn off
								</Button>
							</div>
						</>
					) : (
						<>
							<label className="flex items-start gap-3 rounded-lg bg-muted/60 p-3">
								<input type="checkbox" checked={hasConsent} onChange={(event) => setHasConsent(event.target.checked)} className="mt-0.5 size-4" />
								<span>The guests from my reservations were told about my emails and can unsubscribe from each one.</span>
							</label>
							<Button size="sm" className="self-start" disabled={!hasConsent || isSaving} onClick={() => run(turnOnConnector, "Connector on")}>
								{isSaving && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />} Turn on
							</Button>
						</>
					)}
				</div>
			</CardSettings>

			<CardSettings title="What to send">
				<div className="flex flex-col gap-3 px-4 pb-4 text-sm text-pretty text-muted-foreground">
					<p>
						A <code className="font-mono text-foreground">POST</code> with one reservation as JSON. Only the email is required. Field names from most systems work
						too, like <code className="font-mono text-foreground">check_in</code>, <code className="font-mono text-foreground">checkout</code> or{" "}
						<code className="font-mono text-foreground">customer.email</code>. To take a reservation out, send it again with{" "}
						<code className="font-mono text-foreground">reservation.cancelled</code> as the event, or a status like cancelled or no-show.
					</p>
					<pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs text-foreground">{SAMPLE}</pre>
				</div>
			</CardSettings>

			{state.enabled && (
				<CardSettings title="Last reservations">
					{state.events.length === 0 ? (
						<p className="px-4 pb-4 text-sm text-muted-foreground">Nothing yet. Send one and it shows here.</p>
					) : (
						<ul className="divide-y divide-border/60">
							{state.events.map((event, index) => (
								<li key={`${event.at}-${index}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
									<span className="font-mono text-xs">{event.email ?? "no email"}</span>
									<span className="text-xs text-muted-foreground">
										{event.reservation ? `${event.reservation} · ` : ""}
										{new Date(event.at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
									</span>
									<Badge variant={event.ok ? "secondary" : "outline"}>{event.ok ? "Added" : (event.error ?? "Refused")}</Badge>
								</li>
							))}
						</ul>
					)}
				</CardSettings>
			)}
		</div>
	);
}

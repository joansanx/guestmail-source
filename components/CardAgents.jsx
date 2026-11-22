import Link from "next/link";
import { Bot } from "lucide-react";
import CardSettings from "@/components/CardSettings";
import { Button } from "@/components/ui/button";
import { ACTIONS } from "@/lib/actions/registry";
import { getAppUrl } from "@/lib/config";
import { getMcpClients, getMcpConnectors } from "@/lib/docs/mcp-clients";

// guestmail: the way from the Integrations page to an AI agent: the assistants the docs cover and how many tools they
// get, both read from the code, with the setup and the keys one click away.
export default function CardAgents({ className }) {
	const appUrl = getAppUrl();
	const names = [...getMcpConnectors(appUrl), ...getMcpClients(appUrl)].map(({ name }) => name);
	return (
		<CardSettings
			className={className}
			title={
				<span className="flex items-center gap-2">
					<Bot className="size-4" aria-hidden="true" /> Run GuestMail from your AI agent
				</span>
			}
		>
			<div className="flex flex-col gap-4 px-4 py-4 text-sm text-pretty">
				<p className="text-muted-foreground">
					{new Intl.ListFormat("en", { type: "conjunction" }).format(names)} can work in this account through {ACTIONS.length} tools, the same
					actions as this dashboard: draft and schedule campaigns, import guests, build segments and read results. The tools that send tell
					your assistant to ask you first.
				</p>
				<div className="flex flex-wrap gap-2">
					<Button asChild size="sm">
						<Link href="/docs/mcp">Set up your agent</Link>
					</Button>
					<Button asChild size="sm" variant="outline">
						<Link href="/api-keys">API keys</Link>
					</Button>
				</div>
			</div>
		</CardSettings>
	);
}

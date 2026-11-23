"use client";

import { useTransition } from "react";
import { BookOpen, FileText, Gift, Loader2, Plus, Sparkles } from "lucide-react";
import { createAutomation } from "@/app/(app)/automations/actions";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TONES } from "@/lib/automation-tones";
import { toast } from "@/lib/toast";

// guestmail: a new automation, off, from one of the templates (lib/automation-templates.js), in the venue's language.
const STARTS = [
	{ template: "welcome", label: "Welcome series", detail: "Three emails for people who join", icon: Sparkles, tone: TONES.trigger.icon },
	{ template: "lead_magnet", label: "Lead magnet", detail: "Send your guide to people who join", icon: Gift, tone: TONES.pink.icon },
	{ template: "course", label: "Email course", detail: "Three lessons, one a day", icon: BookOpen, tone: TONES.wait.icon },
];

export default function ButtonNewAutomation({ newsletterId, label = "New automation", variant }) {
	const [isCreating, startCreating] = useTransition();

	function create(template) {
		startCreating(async () => {
			const result = await createAutomation(newsletterId, template);
			if (result?.error) toast.error(result.error);
		});
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant={variant} disabled={isCreating}>
					{isCreating ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : <Plus data-icon="inline-start" aria-hidden="true" />}
					{label}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-72">
				{STARTS.map(({ template, label: name, detail, icon: Icon, tone }) => (
					<DropdownMenuItem key={template} onSelect={() => create(template)} className="items-start gap-3 py-2">
						<Icon className={`mt-0.5 size-4 shrink-0 ${tone}`} aria-hidden="true" />
						<span className="flex min-w-0 flex-col">
							<span className="font-medium">{name}</span>
							<span className="text-xs text-muted-foreground">{detail}</span>
						</span>
					</DropdownMenuItem>
				))}
				<DropdownMenuSeparator />
				<DropdownMenuItem onSelect={() => create("blank")} className="gap-3">
					<FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
					Start from scratch
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

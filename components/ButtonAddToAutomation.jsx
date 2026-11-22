"use client";

import { useTransition } from "react";
import { Loader2, Plus, Zap } from "lucide-react";
import { addContactToAutomation } from "@/app/(app)/automations/actions";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/lib/toast";

// guestmail: a contact on an automation's path by hand (add_contact_to_automation), from their page. automations: the
// ones that are on and they were never on.
export default function ButtonAddToAutomation({ contactId, automations }) {
	const [isAdding, startAdding] = useTransition();

	function add(automation) {
		startAdding(async () => {
			const result = await addContactToAutomation(automation.id, contactId);
			if (result?.error) return void toast.error(result.error);
			if (!result.added) return void toast.error(result.reason);
			toast.success(`Added to ${automation.name}`);
		});
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm" disabled={isAdding}>
					{isAdding ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Plus className="size-3.5" aria-hidden="true" />}
					Add to automation
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="max-w-72">
				{automations.map((automation) => (
					<DropdownMenuItem key={automation.id} onSelect={() => add(automation)}>
						<Zap aria-hidden="true" />
						<span data-no-translate className="truncate">
							{automation.name}
						</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

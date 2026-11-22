"use client";

import { useTransition } from "react";
import { Crown, Loader2 } from "lucide-react";
import { setContactVip } from "@/app/(app)/contacts/actions";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

// guestmail: marks a guest as VIP by hand, for the VIP condition and the Premium guests segment.
export default function ButtonVip({ contactId, isVip }) {
	const [isPending, startTransition] = useTransition();

	function toggle() {
		startTransition(async () => {
			const result = await setContactVip(contactId, !isVip);
			if (result?.error) toast.error(result.error);
		});
	}

	return (
		<Button type="button" variant={isVip ? "secondary" : "outline"} size="sm" onClick={toggle} disabled={isPending} aria-pressed={isVip}>
			{isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Crown className="size-4" aria-hidden="true" />}
			{isVip ? "VIP" : "Mark as VIP"}
		</Button>
	);
}

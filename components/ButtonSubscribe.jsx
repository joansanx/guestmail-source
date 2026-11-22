"use client";

import { useSubscribe } from "@/components/ProviderSubscribe";
import { Button } from "@/components/ui/button";

// guestmail: label, in the venue's language (lib/landing.js).
export default function ButtonSubscribe({ label = "Subscribe" }) {
	const { open } = useSubscribe();

	return (
		<Button size="sm" onClick={() => open()} className="h-8 px-3">
			{label}
		</Button>
	);
}

"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import DialogNewCampaign from "@/components/DialogNewCampaign";
import { Button } from "@/components/ui/button";
import { ADD_NEWSLETTER_PATH } from "@/lib/newsletters";

// A new draft in the open newsletter, which asks first (DialogNewCampaign): blank, a copy of one of its campaigns, or,
// guestmail, from a design with photos, the first campaign too.
export default function ButtonNewCampaign({ newsletterId, campaigns = [], label = "New", size }) {
	if (!newsletterId) {
		return (
			<Button asChild size={size}>
				<Link href={ADD_NEWSLETTER_PATH}>
					<Plus data-icon="inline-start" />
					{label}
				</Link>
			</Button>
		);
	}

	return (
		<DialogNewCampaign newsletterId={newsletterId} campaigns={campaigns}>
			<Button size={size}>
				<Plus data-icon="inline-start" />
				{label}
			</Button>
		</DialogNewCampaign>
	);
}

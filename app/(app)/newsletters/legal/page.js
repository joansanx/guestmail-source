import { redirect } from "next/navigation";
import FormLegal from "@/components/FormLegal";
import HeaderPage from "@/components/HeaderPage";
import LayoutNarrow from "@/components/LayoutNarrow";
import { scoped } from "@/lib/account-scope";
import { getArchiveUrls } from "@/lib/archive-hosts";
import { LEGAL_SECTION, SETTINGS_PARENT } from "@/lib/newsletter-sections";
import { ADD_NEWSLETTER_PATH } from "@/lib/newsletters";
import { requireRole } from "@/lib/selected-newsletter";
import { serialize } from "@/lib/serialize";
import { getPrivacyNotice } from "@/lib/venue-legal";
import Newsletter from "@/models/Newsletter";

export const metadata = { title: LEGAL_SECTION.label };

// guestmail: who the venue is in law, and the notice its forms show with it.
export default async function LegalPage() {
	const { account, selected } = await requireRole("admin");
	if (!selected) redirect(ADD_NEWSLETTER_PATH);
	const newsletter = await Newsletter.findOne(scoped(account, { _id: selected._id }))
		.select({ name: 1, slug: 1, archiveHost: 1, postalAddress: 1, legal: 1, "agent.language": 1, "signupForm.offerText": 1, "signupForm.offerCode": 1 })
		.lean();
	const siteUrl = getArchiveUrls(newsletter).siteIndex.replace(/\/$/, "");
	const hasOffer = Boolean(newsletter.signupForm?.offerText && newsletter.signupForm?.offerCode);

	return (
		<LayoutNarrow>
			<HeaderPage title={LEGAL_SECTION.label} parent={SETTINGS_PARENT} />
			<FormLegal
				key={String(newsletter._id)}
				newsletter={serialize(newsletter)}
				siteUrl={siteUrl}
				notice={getPrivacyNotice(newsletter, { siteUrl, hasOffer })}
			/>
		</LayoutNarrow>
	);
}

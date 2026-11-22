import FormAddNewsletter from "@/components/FormAddNewsletter";
import MenuNewsletter from "@/components/MenuNewsletter";
import { getSenderDomain, isCloud } from "@/lib/config";
import { isPlacesConfigured } from "@/lib/google-places";
import { MAX_NEWSLETTERS_PER_ACCOUNT, toNewsletterOption } from "@/lib/newsletters";
import { findAccountDomains } from "@/lib/sender";
import { getSelectedNewsletter } from "@/lib/selected-newsletter";

// The newsletter menu, under the logo in the sidebar and in the phone's top bar: the user's newsletters, then those shared
// with them. Add a newsletter adds one of their own.
export default async function NavNewsletter({ isCompact }) {
	const { ownAccount, newsletters, ownCount, selected, savedId } = await getSelectedNewsletter();
	// The Add a newsletter form shows the shared address it will send from.
	const sharedDomain = getSenderDomain();
	const isAtLimit = ownCount >= MAX_NEWSLETTERS_PER_ACCOUNT;
	const domains = isAtLimit || sharedDomain ? [] : await findAccountDomains(ownAccount._id);
	const startsFrom = selected && !selected.team && (selected.fromName || selected.postalAddress) ? selected.name : null;

	return (
		<MenuNewsletter
			newsletters={newsletters.map(toNewsletterOption)}
			selectedId={selected ? String(selected._id) : null}
			savedId={savedId}
			isCompact={isCompact}
			addForm={
				<FormAddNewsletter
					sharedDomain={sharedDomain}
					domains={domains.map(({ domain }) => domain)}
					startsFrom={startsFrom}
					isAtLimit={isAtLimit}
					isVenue={isCloud() && isPlacesConfigured()}
				/>
			}
		/>
	);
}

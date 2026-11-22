import AttributionCarry from "@/components/marketing/AttributionCarry";

// guestmail: what GuestMail Cloud's marketing site adds to the shared pages (components/SiteExtensions.jsx says each one).
// SiteAnalytics: the house's own analytics pixel, cookie-free and without a banner (ANALYTICS_PIXEL_URL), and the
// visit's UTM parameters carried to the sign-up (lib/marketing/attribution.js).
export function SiteAnalytics() {
	const pixel = process.env.ANALYTICS_PIXEL_URL;
	return (
		<>
			{pixel && /^https:\/\//.test(pixel) && <script defer src={pixel} />}
			<AttributionCarry />
		</>
	);
}

export const SiteBand = null;
export const ArticleUpsell = null;
export const ArticleDemo = null;
export const SigninAside = null;
export const FooterCredit = null;
export const FooterNote = null;
export const PricingNote = null;
export const SupportChat = null;
export const WhatsNew = null;
export const MenuItems = null;

// guestmail: what the law asks a venue to say where it collects emails and in each email it sends (LOPDGDD art. 11, RGPD
// art. 13, LSSI arts. 20 and 21), in its language. The venue is the controller and GuestMail its processor. Research and
// sources: _research/estrategia_crm_2026-11-22.md, section 5. Texts to be reviewed by a lawyer.
export const LEGAL_LIMITS = { name: 150, taxId: 20, email: 254, privacyUrl: 500 };
const TAX_ID_PATTERN = /^[A-Z0-9][A-Z0-9 .-]{3,18}[A-Z0-9]$/i;

export function getVenueLanguage(newsletter) {
	return newsletter?.agent?.language === "es" ? "es" : "en";
}

// Who is responsible, with what the owner filled in and the newsletter's name and address otherwise. privacyHref: their
// own policy, else the one GuestMail generates on their website (app/archive/[slug]/privacy).
export function getVenueLegal(newsletter, { siteUrl = "" } = {}) {
	const legal = newsletter?.legal ?? {};
	return {
		name: legal.name?.trim() || newsletter?.name?.trim() || "",
		tradeName: newsletter?.name?.trim() || "",
		taxId: legal.taxId?.trim() || "",
		email: legal.email?.trim() || "",
		address: newsletter?.postalAddress?.trim() || "",
		privacyHref: legal.privacyUrl?.trim() || (siteUrl ? `${siteUrl.replace(/\/$/, "")}/privacy` : ""),
	};
}

// What's still missing for the notice to name the controller fully.
export function getMissingLegal(newsletter) {
	const legal = newsletter?.legal ?? {};
	return [!legal.name && "name", !legal.taxId && "taxId", !legal.email && "email", !newsletter?.postalAddress && "postalAddress"].filter(Boolean);
}

// The owner's input, checked: { legal } or { problem }. Empty strings clear a value.
export function readLegalInput({ name, taxId, email, privacyUrl } = {}) {
	const text = (value, max) => String(value ?? "").trim().slice(0, max);
	const legal = { name: text(name, LEGAL_LIMITS.name), taxId: text(taxId, LEGAL_LIMITS.taxId).toUpperCase(), email: text(email, LEGAL_LIMITS.email).toLowerCase(), privacyUrl: text(privacyUrl, LEGAL_LIMITS.privacyUrl) };
	if (legal.taxId && !TAX_ID_PATTERN.test(legal.taxId)) return { problem: "Enter your tax ID as it appears on your invoices, like B12345678" };
	if (legal.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(legal.email)) return { problem: "Enter an email address for privacy requests" };
	if (legal.privacyUrl && !/^https:\/\/[^\s]+\.[^\s]+$/.test(legal.privacyUrl)) return { problem: "Your privacy policy's address starts with https://" };
	return { legal };
}

const WORDS = {
	es: {
		notice: (controller, trade) =>
			`${controller} usará tu email para enviarte ${controller === trade ? "sus" : ""} ofertas y novedades${controller === trade ? "" : ` de ${trade}`}. Puedes darte de baja y ejercer tus derechos cuando quieras.`.replace("  ", " "),
		privacy: "Privacidad",
		taxId: "NIF",
	},
	en: {
		notice: (controller, trade) =>
			`${controller} will use your email to send you ${controller === trade ? "its " : ""}offers and news${controller === trade ? "" : ` from ${trade}`}. You can unsubscribe and exercise your rights at any time.`,
		privacy: "Privacy",
		taxId: "Tax ID",
	},
};

// The first layer under a form, as short as the law allows (LOPDGDD art. 11.2): who is responsible, what for, that the
// person has rights, and a link to the rest. Joan asked for it in small and minimal (23-nov-2026); the full policy, with
// the tax ID, address, legal basis and recipients, is the linked page. { text, more: { label, href } }.
export function getPrivacyNotice(newsletter, { siteUrl = "" } = {}) {
	const words = WORDS[getVenueLanguage(newsletter)];
	const legal = getVenueLegal(newsletter, { siteUrl });
	return {
		text: words.notice(legal.name, legal.tradeName || legal.name),
		more: legal.privacyHref ? { label: words.privacy, href: legal.privacyHref } : null,
	};
}

// The same notice as plain text, kept with each signup as what the person was shown (lib/consent-proof.js).
export function getPrivacyNoticeText(notice) {
	return [notice.text, notice.more ? `${notice.more.label}: ${notice.more.href}` : ""].filter(Boolean).join(" ");
}

// The footer line each email adds after the reason and the unsubscribe link: who sends it, with the tax ID, and the
// privacy page. The address is already there (lib/render-email.js).
export function getLegalFooter(newsletter, { siteUrl = "" } = {}) {
	const words = WORDS[getVenueLanguage(newsletter)];
	const legal = getVenueLegal(newsletter, { siteUrl });
	if (!newsletter?.legal?.name && !newsletter?.legal?.taxId && !legal.privacyHref) return null;
	return {
		identity: [newsletter?.legal?.name?.trim(), legal.taxId && `${words.taxId} ${legal.taxId}`].filter(Boolean).join(" · "),
		privacy: legal.privacyHref ? { label: words.privacy, href: legal.privacyHref } : null,
	};
}

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
		controller: "Responsable",
		purpose: "Finalidad",
		purposeText: (trade, hasOffer) => `enviarte por email ofertas y novedades de ${trade}${hasOffer ? " y tu código de descuento" : ""}.`,
		basis: "Legitimación",
		basisText: (hasOffer) => `tu consentimiento, que puedes retirar cuando quieras con el enlace de baja de cada email.${hasOffer ? " Darte de baja no anula tu descuento." : ""}`,
		recipients: "Destinatarios",
		recipientsText: "no se ceden a terceros. GuestMail los trata por encargo para hacer los envíos.",
		rights: "Derechos",
		rightsText: (email) => `acceso, rectificación, supresión, oposición y los demás${email ? `, en ${email}` : ""}. Puedes reclamar ante la AEPD.`,
		more: "Más información",
		age: "Al suscribirte confirmas que tienes al menos 14 años.",
		privacy: "Privacidad",
		taxId: "NIF",
	},
	en: {
		controller: "Controller",
		purpose: "Purpose",
		purposeText: (trade, hasOffer) => `to email you offers and news from ${trade}${hasOffer ? " and your discount code" : ""}.`,
		basis: "Legal basis",
		basisText: (hasOffer) => `your consent, which you can withdraw at any time with the unsubscribe link in every email.${hasOffer ? " Unsubscribing does not cancel your discount." : ""}`,
		recipients: "Recipients",
		recipientsText: "not shared with third parties. GuestMail processes them on our behalf to send the emails.",
		rights: "Rights",
		rightsText: (email) => `access, rectification, erasure, objection and the others${email ? `, at ${email}` : ""}. You may complain to the Spanish DPA (AEPD).`,
		more: "More information",
		age: "By subscribing you confirm you are at least 14.",
		privacy: "Privacy",
		taxId: "Tax ID",
	},
};

// The first layer the AEPD asks for next to the button: controller, purpose, legal basis, recipients, rights and where to
// read more. As parts, so the page draws the link: { lines: [[label, text]], more: { label, href }, age }.
export function getPrivacyNotice(newsletter, { siteUrl = "", hasOffer = false } = {}) {
	const words = WORDS[getVenueLanguage(newsletter)];
	const legal = getVenueLegal(newsletter, { siteUrl });
	const controller = [legal.name, legal.taxId && `${words.taxId} ${legal.taxId}`, legal.address, legal.email].filter(Boolean).join(", ");
	return {
		lines: [
			[words.controller, `${controller}.`],
			[words.purpose, words.purposeText(legal.tradeName || legal.name, hasOffer)],
			[words.basis, words.basisText(hasOffer)],
			[words.recipients, words.recipientsText],
			[words.rights, words.rightsText(legal.email)],
		],
		more: legal.privacyHref ? { label: words.more, href: legal.privacyHref } : null,
		age: words.age,
	};
}

// The same notice as plain text, kept with each signup as what the person was shown (lib/consent-proof.js).
export function getPrivacyNoticeText(notice) {
	return [...notice.lines.map(([label, text]) => `${label}: ${text}`), notice.more ? `${notice.more.label}: ${notice.more.href}` : "", notice.age].filter(Boolean).join(" ");
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

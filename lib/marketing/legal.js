// guestmail: who runs the hosted service, and who helps it. The name, address and tax ID come from the environment
// (LEGAL_NAME, LEGAL_ADDRESS, LEGAL_TAX_ID), read at build time, so a person's details stay out of the repository.
// The legal pages' words are in content/site/<lang> (lib/marketing/site-pages.js lists them).
export function getLegalEntity(env = process.env) {
	const [name, address, taxId] = [env.LEGAL_NAME, env.LEGAL_ADDRESS, env.LEGAL_TAX_ID].map((value) => value?.trim());
	return name && address && taxId ? { name, address, taxId } : null;
}

// The legal pages can't name nobody: without the three variables the build of the hosted service fails here.
export function requireLegalEntity(env = process.env) {
	const entity = getLegalEntity(env);
	if (!entity) throw new Error("LEGAL_NAME, LEGAL_ADDRESS and LEGAL_TAX_ID must be set: the legal pages name who runs the service");
	return entity;
}

// Who else handles personal data for GuestMail, and what each one sees: the one list behind /subprocessors, /privacy
// and /dpa, in every language. Keep it in step with what production runs, in the same change as the provider.
// Checked against production on 22 Nov 2026: QStash runs in eu-central-1 and no Upstash Redis is set, campaigns go out
// through Amazon SES and only GuestMail's own emails through Resend, images and encrypted backups sit in Cloudflare R2.
export const PROVIDERS = [
	{
		name: "Hetzner Online GmbH",
		role: { en: "Servers and database", es: "Servidores y base de datos" },
		data: { en: "Everything stored in GuestMail", es: "Todo lo que se guarda en GuestMail" },
		place: { en: "Germany", es: "Alemania" },
	},
	{
		name: "Cloudflare, Inc.",
		role: { en: "Network, DNS, protection against attacks, image storage and encrypted backups", es: "Red, DNS, protección frente a ataques, almacén de imágenes y copias de seguridad cifradas" },
		data: {
			en: "Requests to GuestMail as they pass through, the images you upload, and encrypted copies of the database",
			es: "Las peticiones a GuestMail a su paso, las imágenes que subes y copias cifradas de la base de datos",
		},
		place: { en: "Worldwide for the network, Western Europe for storage", es: "Todo el mundo para la red, Europa occidental para el almacenamiento" },
	},
	{
		name: "Amazon Web Services EMEA SARL (Amazon SES)",
		role: { en: "Email delivery", es: "Envío de emails" },
		data: { en: "The emails you send and their recipients", es: "Los emails que envías y sus destinatarios" },
		place: { en: "Sweden", es: "Suecia" },
	},
	{
		name: "Resend, Inc.",
		role: { en: "Delivery of GuestMail's own emails, such as sign-in codes and notices to you. Never your campaigns", es: "Envío de los emails de GuestMail, como los códigos de acceso y los avisos que te manda. Nunca tus campañas" },
		data: { en: "Those emails and your email address", es: "Esos emails y tu dirección de email" },
		place: { en: "Ireland and United States", es: "Irlanda y Estados Unidos" },
	},
	{
		name: "Upstash, Inc.",
		role: { en: "Job queue", es: "Cola de tareas" },
		data: { en: "Internal IDs of the sends to run. No email addresses and no content", es: "Identificadores internos de los envíos pendientes. Ni direcciones de email ni contenido" },
		place: { en: "Germany (Frankfurt). The company is in the United States", es: "Alemania (Fráncfort). La empresa está en Estados Unidos" },
	},
	{
		name: "Stripe Payments Europe, Ltd.",
		role: { en: "Payments and invoices", es: "Pagos y facturas" },
		data: { en: "Your billing details and payment method", es: "Tus datos de facturación y tu medio de pago" },
		place: { en: "Ireland", es: "Irlanda" },
	},
	{
		name: "Google Ireland Ltd.",
		role: { en: "Rating and reviews of your venue (Places API)", es: "Nota y reseñas de tu establecimiento (Places API)" },
		data: { en: "The name or ID of your venue, never contacts", es: "El nombre o el identificador de tu establecimiento, nunca contactos" },
		place: { en: "Worldwide", es: "Todo el mundo" },
	},
	{
		name: "OpenRouter, Inc.",
		role: { en: "Carries the automated content check and the content agent to the AI model", es: "Lleva la revisión automática del contenido y el agente de contenido al modelo de IA" },
		data: {
			en: "Subject, sender name and text of campaigns, with email addresses and phone numbers replaced by placeholders, and your brief. Never contacts, never author names",
			es: "Asunto, nombre del remitente y texto de las campañas, con los emails y los teléfonos sustituidos por marcas, y tu brief. Nunca contactos, nunca nombres de autores",
		},
		place: { en: "United States", es: "Estados Unidos" },
	},
	{
		name: "Google LLC (Gemini API)",
		role: { en: "The AI model of the automated content check and the content agent", es: "Modelo de IA de la revisión automática del contenido y del agente de contenido" },
		data: {
			en: "What OpenRouter carries: subject, sender name and text of campaigns, with email addresses and phone numbers replaced by placeholders, and your brief. Never contacts, never author names",
			es: "Lo que le lleva OpenRouter: asunto, nombre del remitente y texto de las campañas, con los emails y los teléfonos sustituidos por marcas, y tu brief. Nunca contactos, nunca nombres de autores",
		},
		place: { en: "United States", es: "Estados Unidos" },
	},
	{
		name: "Firecrawl (Mendable, Inc.)",
		role: { en: "Web research for the content agent, and reading the menu you give the autopilot", es: "Búsqueda en la web para el agente de contenido, y lectura de la carta que le das al piloto automático" },
		data: {
			en: "Search queries about your venue and its area, and your menu or list of services, as a link or a file. No personal data",
			es: "Búsquedas sobre tu establecimiento y su zona, y tu carta o lista de servicios, como enlace o como fichero. Sin datos personales",
		},
		place: { en: "United States", es: "Estados Unidos" },
	},
];

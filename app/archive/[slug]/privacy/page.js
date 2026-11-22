import { notFound } from "next/navigation";
import { getArchiveNewsletter } from "@/lib/archive-data";
import { getArchiveUrls } from "@/lib/archive-hosts";
import { getVenueLanguage, getVenueLegal } from "@/lib/venue-legal";

export const revalidate = 3600;

export function generateStaticParams() {
	return [];
}

// guestmail: the second layer of data protection information (RGPD art. 13) for a venue without its own policy, written
// with its legal details (Settings, Legal). The venue is the controller and GuestMail its processor. Texts to be reviewed
// by a lawyer: _research/estrategia_crm_2026-11-22.md, section 5.
const COPY = {
	es: {
		title: "Política de privacidad",
		updated: "Última actualización: 22 de noviembre de 2026.",
		sections: (v) => [
			["Quién trata tus datos", `${v.name}${v.taxId ? `, NIF ${v.taxId}` : ""}${v.address ? `, ${v.address}` : ""}${v.email ? `. Contacto: ${v.email}` : ""}. Es el responsable de tus datos.`],
			["Qué datos", "Tu email y, si nos lo das, tu nombre. Si te alojaste o reservaste, los datos de tu estancia que necesitamos para ofrecerte servicios parecidos: fechas, tipo de habitación, número de personas e importe."],
			["Para qué", `Para enviarte por email ofertas, novedades y, si lo hay, tu código de descuento de ${v.tradeName || v.name}, y para saber qué correos te interesan (aperturas y clics) y mandarte menos de lo que no te interesa.`],
			["Con qué base", "Tu consentimiento, que das al suscribirte y puedes retirar cuando quieras con el enlace de baja de cada email. Si te alojaste o reservaste directamente y no te opusiste al dejarnos tu email, te enviamos ofertas de servicios parecidos a los que contrataste (art. 21.2 de la LSSI), y puedes oponerte en cada correo."],
			["Cuánto tiempo", "Hasta que te des de baja. Después guardamos solo lo necesario para no volver a escribirte y para atender posibles responsabilidades, el tiempo que marca la ley."],
			["Quién más los ve", "No cedemos tus datos a nadie salvo obligación legal. GuestMail los trata por encargo nuestro para hacer los envíos, con sus proveedores: Amazon Web Services (envío de correos, servidores en la UE), Upstash (cola de envío, UE), Hetzner (servidores, Alemania) y Cloudflare (red). Si alguno trata datos fuera del Espacio Económico Europeo, lo hace con las garantías del RGPD, como las cláusulas contractuales tipo."],
			["Tus derechos", `Puedes pedir acceso, rectificación, supresión, oposición, limitación y portabilidad${v.email ? ` escribiendo a ${v.email}` : " escribiéndonos"}. Si crees que no los atendemos bien, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).`],
			["Edad", "Para suscribirte tienes que tener al menos 14 años."],
			["Cookies", "Esta web no usa cookies. El aviso emergente de suscripción guarda en tu navegador una marca sin datos personales para no volver a mostrarse durante unos días."],
		],
	},
	en: {
		title: "Privacy policy",
		updated: "Last updated: 22 November 2026.",
		sections: (v) => [
			["Who processes your data", `${v.name}${v.taxId ? `, tax ID ${v.taxId}` : ""}${v.address ? `, ${v.address}` : ""}${v.email ? `. Contact: ${v.email}` : ""}. It is the controller of your data.`],
			["What data", "Your email and, if you give it, your name. If you stayed or booked with us, the details of your stay we need to offer you similar services: dates, room type, party size and amount."],
			["What for", `To email you offers, news and, when there is one, your discount code from ${v.tradeName || v.name}, and to see which emails interest you (opens and clicks) so we send less of what doesn't.`],
			["On what basis", "Your consent, given when you subscribe, which you can withdraw at any time with the unsubscribe link in every email. If you stayed or booked directly and did not object when giving us your email, we send you offers for services similar to the ones you bought (Spanish LSSI art. 21.2), and you can object in every email."],
			["How long", "Until you unsubscribe. After that we keep only what we need not to write to you again and to meet possible liabilities, for the time the law sets."],
			["Who else sees it", "We do not share your data with anyone unless the law requires it. GuestMail processes it on our behalf to send the emails, with its providers: Amazon Web Services (email delivery, servers in the EU), Upstash (sending queue, EU), Hetzner (servers, Germany) and Cloudflare (network). Where any of them processes data outside the European Economic Area, it does so with GDPR safeguards such as standard contractual clauses."],
			["Your rights", `You can ask for access, rectification, erasure, objection, restriction and portability${v.email ? ` by writing to ${v.email}` : " by writing to us"}. If you think we don't handle them properly, you can complain to the Spanish Data Protection Agency (aepd.es).`],
			["Age", "You must be at least 14 to subscribe."],
			["Cookies", "This website uses no cookies. The subscribe popup keeps a mark with no personal data in your browser so it doesn't show again for a few days."],
		],
	},
};

export async function generateMetadata({ params }) {
	const { slug } = await params;
	const newsletter = await getArchiveNewsletter(slug);
	if (!newsletter) return {};
	return { title: `${COPY[getVenueLanguage(newsletter)].title} · ${newsletter.name}`, robots: { index: false } };
}

export default async function PrivacyPage({ params }) {
	const { slug } = await params;
	const newsletter = await getArchiveNewsletter(slug);
	if (!newsletter) notFound();
	const copy = COPY[getVenueLanguage(newsletter)];
	const siteUrl = getArchiveUrls(newsletter).siteIndex.replace(/\/$/, "");
	const venue = getVenueLegal(newsletter, { siteUrl });

	return (
		<main className="mx-auto w-full max-w-2xl px-5 py-16">
			<a href={getArchiveUrls(newsletter).index} className="text-sm text-muted-foreground hover:text-foreground">
				{newsletter.name}
			</a>
			<h1 className="mt-4 text-3xl font-theme-heading text-balance">{copy.title}</h1>
			<p className="mt-2 text-sm text-muted-foreground">{copy.updated}</p>
			<div className="mt-10 flex flex-col gap-7">
				{copy.sections(venue).map(([heading, text]) => (
					<section key={heading}>
						<h2 className="font-semibold">{heading}</h2>
						<p className="mt-2 leading-relaxed text-pretty">{text}</p>
					</section>
				))}
			</div>
		</main>
	);
}

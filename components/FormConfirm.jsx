"use client";

import { startTransition, useActionState, useEffect } from "react";
import { Link2Off, Loader2, MailCheck } from "lucide-react";
import { confirmSubscription } from "@/app/confirm/actions";
import CardNotice from "@/components/CardNotice";
import { Button } from "@/components/ui/button";

// Confirms once the page's script runs, so a link scanner that only loads the page doesn't. No <form>: posted without
// the script from this page, which sends no referrer, it would come with Origin: null, which Next.js refuses with an
// error, and some scanners post forms that way.
// guestmail: in the venue's language (its content agent's).
const COPY = {
	en: {
		inTitle: "You're in",
		inText: (name) => `The next issue of ${name} comes from`,
		promotions: "If it lands in Promotions, drag it to Primary.",
		past: "Read past issues",
		brokenTitle: "This link doesn't work",
		brokenText: "It may be older than 30 days. Sign up again and use the newest confirmation email.",
		askTitle: (name) => `Confirm your subscription to ${name}`,
		askText: "One click and the next issue lands in your inbox.",
		confirming: "Confirming…",
		confirm: "Confirm my subscription",
	},
	es: {
		inTitle: "Ya estás dentro",
		inText: (name) => `El próximo correo de ${name} llega desde`,
		promotions: "Si cae en Promociones, arrástralo a Principal.",
		past: "Ver la web",
		brokenTitle: "Este enlace no funciona",
		brokenText: "Puede que tenga más de 30 días. Vuelve a suscribirte y usa el correo de confirmación más reciente.",
		askTitle: (name) => `Confirma tu suscripción a ${name}`,
		askText: "Un clic y el próximo correo llega a tu bandeja.",
		confirming: "Confirmando…",
		confirm: "Confirmar mi suscripción",
	},
};

export default function FormConfirm({ token, newsletterName, fromName, fromEmail, archiveUrl, language = "en" }) {
	const copy = COPY[language] ?? COPY.en;
	const [state, confirm, isPending] = useActionState(confirmSubscription.bind(null, token), null);

	useEffect(() => {
		startTransition(confirm);
	}, [confirm]);

	if (state?.ok) {
		return (
			<CardNotice icon={MailCheck} tone="success" title={copy.inTitle}>
				{copy.inText(newsletterName)}{" "}
				<span className="font-medium text-foreground">{fromName || fromEmail}</span>
				{fromName && ` (${fromEmail})`}. {copy.promotions}
				{archiveUrl && (
					<Button asChild size="lg" variant="outline" className="mt-6 w-full">
						<a href={archiveUrl}>{copy.past}</a>
					</Button>
				)}
			</CardNotice>
		);
	}

	if (state?.error) {
		return (
			<CardNotice icon={Link2Off} title={copy.brokenTitle}>
				{copy.brokenText}
			</CardNotice>
		);
	}

	return (
		<CardNotice
			icon={isPending ? Loader2 : MailCheck}
			spin={isPending}
			title={copy.askTitle(newsletterName)}
		>
			{copy.askText}
			<Button size="lg" disabled={isPending} onClick={() => startTransition(confirm)} className="mt-6 w-full">
				{isPending ? copy.confirming : copy.confirm}
			</Button>
		</CardNotice>
	);
}

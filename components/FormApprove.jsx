"use client";

import { useState, useTransition } from "react";
import { CalendarCheck, CircleSlash, Link2Off, Loader2 } from "lucide-react";
import { approveCampaign, rejectCampaign } from "@/app/approve/actions";
import CardNotice from "@/components/CardNotice";
import { Button } from "@/components/ui/button";
import { useIsClient } from "@/lib/use-is-client";

const WHEN = { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" };
// guestmail: in the venue's language (its content agent's), like the confirmation page.
const COPY = {
	en: {
		title: (name) => `A campaign for ${name}, ready to go`,
		intro: "Read it. Nothing is sent until you approve it.",
		subject: "Subject",
		preview: "Preview",
		noPreview: "The draft can't be shown here right now. Open it in GuestMail, on the Campaigns page.",
		goesOut: "It goes out",
		toEveryone: "to every active contact",
		toSegment: (name) => `to the segment “${name}”`,
		approve: "Approve and schedule",
		approving: "Scheduling…",
		reject: "Not this one",
		busy: "Too many clicks from your network. Try again in a few minutes.",
		approvedTitle: "Approved and scheduled",
		approvedText: "It goes out",
		approvedChange: "To change it or stop it, open it in GuestMail, on the Campaigns page.",
		rejectedTitle: "Not this one",
		rejectedText: "Nothing is sent. The next campaign comes with your next proposal.",
		usedTitle: "This link was already used",
		usedText: "This campaign already has its answer. The newest one to approve is in your latest email from GuestMail.",
		expiredTitle: "This proposal is no longer open",
		expiredText: "A newer campaign took its place. Look for the latest email from GuestMail.",
	},
	es: {
		title: (name) => `Una campaña para ${name}, lista para salir`,
		intro: "Léela. No se envía nada hasta que la apruebes.",
		subject: "Asunto",
		preview: "Vista previa",
		noPreview: "Ahora mismo no se puede mostrar el borrador aquí. Ábrelo en GuestMail, en la página Campaigns.",
		goesOut: "Sale",
		toEveryone: "a todos los contactos activos",
		toSegment: (name) => `al segmento «${name}»`,
		approve: "Aprobar y programar",
		approving: "Programando…",
		reject: "Esta no",
		busy: "Demasiados clics desde tu red. Prueba otra vez en unos minutos.",
		approvedTitle: "Aprobada y programada",
		approvedText: "Sale",
		approvedChange: "Para cambiarla o pararla, ábrela en GuestMail, en la página Campaigns.",
		rejectedTitle: "Esta no",
		rejectedText: "No se envía nada. La siguiente campaña llega con tu próxima propuesta.",
		usedTitle: "Este enlace ya se usó",
		usedText: "Esta campaña ya tiene su respuesta. La más reciente por aprobar está en el último correo de GuestMail.",
		expiredTitle: "Esta propuesta ya no está abierta",
		expiredText: "Una campaña más nueva ocupó su lugar. Busca el último correo de GuestMail.",
	},
};

// In the owner's own time zone, which only their browser knows.
function When({ value, language }) {
	const isClient = useIsClient();
	const date = new Date(value);
	return <time dateTime={date.toISOString()}>{isClient ? date.toLocaleString(language === "es" ? "es-ES" : "en-US", WHEN) : null}</time>;
}

// The owner's one click. Nothing happens when the page loads: a link scanner that opens it, with or without running
// its script, approves nothing. No <form>: posted from this page, which sends no referrer, it would come with
// Origin: null, which Next.js refuses.
export default function FormApprove({ token, view }) {
	const copy = COPY[view.language] ?? COPY.en;
	const [result, setResult] = useState(null);
	const [pending, setPending] = useState(null);
	const [, startDeciding] = useTransition();
	const status = result?.ok ? result.status : view.status;
	const scheduledAt = result?.scheduledAt ?? view.scheduledAt;

	function decide(decision) {
		setPending(decision);
		startDeciding(async () => {
			setResult(await (decision === "approved" ? approveCampaign(token) : rejectCampaign(token)));
			setPending(null);
		});
	}

	if (result?.error === "used") {
		return (
			<CardNotice icon={Link2Off} title={copy.usedTitle}>
				{copy.usedText}
			</CardNotice>
		);
	}
	if (status === "approved") {
		return (
			<CardNotice icon={CalendarCheck} tone="success" title={copy.approvedTitle}>
				{scheduledAt && (
					<>
						{copy.approvedText} <When value={scheduledAt} language={view.language} />.{" "}
					</>
				)}
				{copy.approvedChange}
			</CardNotice>
		);
	}
	if (status === "rejected") {
		return (
			<CardNotice icon={CircleSlash} title={copy.rejectedTitle}>
				{copy.rejectedText}
			</CardNotice>
		);
	}
	if (status !== "proposed") {
		return (
			<CardNotice icon={Link2Off} title={copy.expiredTitle}>
				{copy.expiredText}
			</CardNotice>
		);
	}

	return (
		<div className="flex w-full max-w-2xl flex-col gap-5 rounded-xl bg-card p-5 shadow-border animate-enter sm:p-8">
			<div>
				<h1 className="text-lg font-medium text-balance">{copy.title(view.newsletterName)}</h1>
				<p className="mt-1 text-sm text-pretty text-muted-foreground">{copy.intro}</p>
			</div>
			<dl className="grid gap-3 text-sm sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-x-4">
				<dt className="text-muted-foreground">{copy.subject}</dt>
				<dd className="font-medium text-pretty">{view.subject}</dd>
				{view.previewText && (
					<>
						<dt className="text-muted-foreground">{copy.preview}</dt>
						<dd className="text-pretty">{view.previewText}</dd>
					</>
				)}
			</dl>
			{view.html ? (
				// No allow-scripts and no allow-same-origin: the draft is shown, and nothing in it runs or reads this page.
				<iframe title={view.subject} sandbox="" srcDoc={view.html} className="h-[28rem] w-full rounded-lg bg-white shadow-border" />
			) : (
				<p className="rounded-lg bg-muted px-4 py-3 text-sm text-pretty text-muted-foreground">{copy.noPreview}</p>
			)}
			<p className="text-sm text-pretty text-muted-foreground">
				{copy.goesOut} {view.sendAt && <When value={view.sendAt} language={view.language} />} {view.segmentName ? copy.toSegment(view.segmentName) : copy.toEveryone}.
			</p>
			{result?.error && (
				<p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-pretty text-destructive">
					{result.error === "busy" ? copy.busy : result.message}
				</p>
			)}
			<div className="flex flex-col gap-2 sm:flex-row">
				<Button size="lg" disabled={Boolean(pending)} onClick={() => decide("approved")} className="sm:flex-1">
					{pending === "approved" && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
					{pending === "approved" ? copy.approving : copy.approve}
				</Button>
				<Button size="lg" variant="outline" disabled={Boolean(pending)} onClick={() => decide("rejected")}>
					{copy.reject}
				</Button>
			</div>
		</div>
	);
}

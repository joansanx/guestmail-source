"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { saveLegal } from "@/app/(app)/newsletters/actions";
import { Field, Section } from "@/components/FormNewsletter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";
import { LEGAL_LIMITS } from "@/lib/venue-legal";

// guestmail: the venue's legal details (lib/venue-legal.js). The venue is the controller of its subscribers' data and the
// notice under its forms names it with these. notice: as the forms show it now, from what's saved.
export default function FormLegal({ newsletter, siteUrl, notice }) {
	const saved = newsletter.legal ?? {};
	const [draft, setDraft] = useState({ name: saved.name ?? "", taxId: saved.taxId ?? "", email: saved.email ?? "", privacyUrl: saved.privacyUrl ?? "" });
	const [isSaving, startSaving] = useTransition();

	function set(key, value) {
		setDraft((current) => ({ ...current, [key]: value }));
	}

	function save(event) {
		event.preventDefault();
		startSaving(async () => {
			const result = await saveLegal(newsletter._id, draft);
			if (result?.error) return void toast.error(result.error);
			toast.success("Legal details saved");
		});
	}

	return (
		<form onSubmit={save} className="flex flex-col gap-4">
			<Section title="Who you are in law" stagger={1}>
				<p className="px-4 pb-1 text-sm text-pretty text-muted-foreground">
					You decide who gets your emails, so in law you&apos;re responsible for your subscribers&apos; data and GuestMail processes it for you.
					The notice under your forms, your privacy page and the footer of every email show these details.
				</p>
				<Field label="Legal name" hint="As on your invoices, like Hoteles Sol SL. Empty: your newsletter's name.">
					<Input value={draft.name} maxLength={LEGAL_LIMITS.name} placeholder={newsletter.name} onChange={(event) => set("name", event.target.value)} />
				</Field>
				<Field label="Tax ID" hint="Your NIF or VAT number.">
					<Input value={draft.taxId} maxLength={LEGAL_LIMITS.taxId} placeholder="B12345678" onChange={(event) => set("taxId", event.target.value)} />
				</Field>
				<Field label="Privacy email" hint="Where people write to see, change or delete their data.">
					<Input type="email" value={draft.email} maxLength={LEGAL_LIMITS.email} placeholder="privacy@yourhotel.com" onChange={(event) => set("email", event.target.value)} />
				</Field>
				<Field
					label="Privacy policy"
					hint={
						<>
							Your own, if you have one. Empty: GuestMail writes one with these details at{" "}
							<a href={`${siteUrl}/privacy`} target="_blank" rel="noreferrer" className="underline underline-offset-2">
								{`${siteUrl.replace(/^https?:\/\//, "")}/privacy`}
							</a>
							.
						</>
					}
				>
					<Input type="url" value={draft.privacyUrl} maxLength={LEGAL_LIMITS.privacyUrl} placeholder="https://" onChange={(event) => set("privacyUrl", event.target.value)} />
				</Field>
				<Field label="Postal address" hint="Printed in every email. Change it on the Sender page.">
					<p className="pt-2 text-sm">{newsletter.postalAddress || <Link href="/newsletters/sender" className="underline underline-offset-2">Add it</Link>}</p>
				</Field>
			</Section>
			<Section title="What your forms say" stagger={2}>
				<div className="flex flex-col gap-1.5 px-4 pb-4 text-xs text-pretty text-muted-foreground">
					<p>
						{notice.text}{" "}
						{notice.more && (
							<a href={notice.more.href} target="_blank" rel="noreferrer" className="underline underline-offset-2">
								{notice.more.label}
							</a>
						)}
					</p>
					<p className="pt-2">Under your website&apos;s form, your popup and the forms on your site, in your guests&apos; language. Saved changes show after reloading.</p>
				</div>
			</Section>
			<Button type="submit" disabled={isSaving} className="self-start">
				{isSaving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />} Save
			</Button>
		</form>
	);
}

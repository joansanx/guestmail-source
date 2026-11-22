"use client";

import { OFFER_PRESETS } from "@/lib/offer-presets";
import { useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { saveSignupForm } from "@/app/(app)/newsletters/actions";
import BarSave from "@/components/BarSave";
import BlockCode from "@/components/BlockCode";
import BlockPrompt from "@/components/BlockPrompt";
import { Segmented } from "@/components/FieldsTheme";
import { Field, Section } from "@/components/FormNewsletter";
import LinkHelp from "@/components/LinkHelp";
import PreviewPopup from "@/components/PreviewPopup";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { firstNameTag } from "@/lib/merge-tags";
import { getSectionPath } from "@/lib/newsletter-sections";
import {
	SIGNUP_FORM_DEFAULTS,
	SIGNUP_FORM_LIMITS,
	getAgentPrompt,
	getEmbedCode,
	getSignupFormHeading,
	toSignupFormSettings,
} from "@/lib/signup-form";
import { renderFormPage } from "@/lib/signup-form-page";
import { toast } from "@/lib/toast";
import { useIsClient } from "@/lib/use-is-client";
import { usePaywall } from "@/lib/use-paywall";

// Form for your site: the signup form owners paste on their own site (lib/signup-form.js), previewed in its frame as a
// reader sees it, with the code to paste and the sites it works on. Saved with the bar like the other settings; the
// sites are typed one per line and come back from the server as it keeps them. hasBotCheck: Vercel BotID runs on this
// server, which is what stops a script from naming a listed site (lib/bot-check.js).
export default function FormEmbed({ newsletter, appUrl, hasBotCheck = true, notice = null }) {
	const paywall = usePaywall();
	const hasPlan = paywall?.hasPlan ?? true;
	const [saved, setSaved] = useState(() => toDraft(newsletter.signupForm, newsletter));
	const [draft, setDraft] = useState(saved);
	const [savedAt, setSavedAt] = useState(null);
	const [isSaving, startSaving] = useTransition();
	const settings = toSignupFormSettings(toInput(draft, newsletter));
	const code = getEmbedCode({ appUrl, newsletterId: newsletter._id, settings, theme: newsletter.theme, newsletter });
	const prompt = getAgentPrompt({ appUrl, newsletterId: newsletter._id, newsletter, settings, code, isOn: saved.enabled, hasPlan });

	function set(key, value) {
		setDraft((current) => ({ ...current, [key]: value }));
	}

	function save(event) {
		event.preventDefault();
		const signupForm = toInput(draft, newsletter);
		startSaving(async () => {
			const result = await saveSignupForm(newsletter._id, signupForm);
			if (result?.error) return void toast.error(result.error);
			const next = toDraft(result.signupForm, newsletter);
			setSaved(next);
			setDraft(next);
			setSavedAt(Date.now());
		});
	}

	function discard() {
		setDraft(saved);
		setSavedAt(null);
	}

	return (
		<form onSubmit={save} className="flex flex-col gap-4">
			<Section
				title="Take signups on your site"
				stagger={1}
				action={
					<Switch checked={draft.enabled} onCheckedChange={(isChecked) => set("enabled", isChecked)} aria-label="Form for your site" />
				}
			>
				<p className="px-4 py-3 text-sm text-pretty text-muted-foreground">
					Paste it on your site, blog or link page: whoever signs up there joins {newsletter.name}.{" "}
					<TextSignupPath newsletter={newsletter} />
					{!draft.enabled && " Turn it on, then save, to take signups."}
					{draft.enabled && !hasPlan && (
						<>
							{" "}
							It takes signups once you pick a plan.{" "}
							<button
								type="button"
								onClick={() => paywall.open("website")}
								className="font-medium text-foreground underline decoration-foreground/30 underline-offset-2 transition-colors duration-150 hover:decoration-foreground"
							>
								Pick a plan
							</button>
						</>
					)}
				</p>
			</Section>
			<Section
				title="Preview"
				stagger={2}
				action={<Segmented size="sm" label="Layout" value={draft.layout} options={LAYOUT_OPTIONS} onChange={(layout) => set("layout", layout)} />}
			>
				<PreviewSignupForm newsletter={newsletter} settings={settings} notice={notice} />
				{draft.layout === "card" && (
					<>
						<Field label="Headline" hint={draft.headline ? null : "Empty: no headline."}>
							<Input
								value={draft.headline}
								maxLength={SIGNUP_FORM_LIMITS.headline}
								placeholder={newsletter.name}
								onChange={(event) => set("headline", event.target.value)}
							/>
						</Field>
						<Field label="Text" hint={draft.subheadline ? null : "Under the headline. Empty: none."}>
							<Textarea
								value={draft.subheadline}
								rows={2}
								maxLength={SIGNUP_FORM_LIMITS.subheadline}
								placeholder="Optional"
								className="min-h-0 resize-none"
								onChange={(event) => set("subheadline", event.target.value)}
							/>
						</Field>
					</>
				)}
				<Field
					label="First name"
					as="div"
					hint={
						<>
							Saved as their first name, which{" "}
							<code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">{firstNameTag()}</code> prints in your
							emails. <LinkHelp article="writing" section="first-name" />
						</>
					}
				>
					<label className="flex items-center gap-3 text-sm text-muted-foreground sm:pt-2">
						<Switch checked={draft.askFirstName} onCheckedChange={(isChecked) => set("askFirstName", isChecked)} />
						Ask for it above the email, optional for readers
					</label>
				</Field>
				<Field label="Button">
					<Input
						value={draft.buttonText}
						maxLength={SIGNUP_FORM_LIMITS.buttonText}
						placeholder={SIGNUP_FORM_DEFAULTS.buttonText}
						onChange={(event) => set("buttonText", event.target.value)}
					/>
				</Field>
				<Field label="Placeholder">
					<Input
						value={draft.placeholder}
						maxLength={SIGNUP_FORM_LIMITS.placeholder}
						placeholder={SIGNUP_FORM_DEFAULTS.placeholder}
						onChange={(event) => set("placeholder", event.target.value)}
					/>
				</Field>
			</Section>
			<Section title="Offer" stagger={3}>
				<Field label="Ready offers" as="div" hint="One click fills what it gives and its code. Change both to what your venue really gives.">
					<span className="flex flex-wrap gap-2 sm:pt-1">
						{(OFFER_PRESETS[newsletter.venue?.kind] ?? OFFER_PRESETS.hotel).map((preset) => {
							const text = newsletter.agent?.language === "es" ? preset.es : preset.en;
							return (
								<button
									key={preset.code}
									type="button"
									onClick={() => {
										set("offerText", text);
										set("offerCode", preset.code);
									}}
									className="rounded-full bg-card px-3 py-1.5 text-left text-sm shadow-border hover:shadow-border-hover"
								>
									{text}
								</button>
							);
						})}
					</span>
				</Field>
				<Field label="What it gives" hint="Like 10% off your next stay. The card's headline until you write one, and what the popup opens with. Empty: no offer.">
					<Input
						value={draft.offerText}
						maxLength={SIGNUP_FORM_LIMITS.offerText}
						placeholder="10% off your next stay"
						onChange={(event) => set("offerText", event.target.value)}
					/>
				</Field>
				<Field
					label="Code"
					hint={
						<>
							The code your booking engine or your till takes. People see it once they join, in the script form and the popup, and each
							contact keeps theirs in the field <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">offer_code</code>.
						</>
					}
				>
					<Input
						value={draft.offerCode}
						maxLength={SIGNUP_FORM_LIMITS.offerCode}
						placeholder="GUEST10"
						className="font-mono uppercase"
						onChange={(event) => set("offerCode", event.target.value.toUpperCase())}
					/>
				</Field>
				<Field label="One per person" as="div" hint="Each person gets your code and 6 characters of their own, to check at the desk who used theirs. A booking engine only takes them if you load them there.">
					<label className="flex items-center gap-3 text-sm text-muted-foreground sm:pt-2">
						<Switch checked={draft.offerUnique} onCheckedChange={(isChecked) => set("offerUnique", isChecked)} />
						A different code for each person
					</label>
				</Field>
			</Section>
			<Section title="Code to paste" stagger={3}>
				<CodeSignupForm code={code} prompt={prompt} newsletter={newsletter} settings={settings} notice={notice} />
			</Section>
			<Section title="Where it works" stagger={4}>
				<Field
					label="Your sites"
					hint={`One per line, like example.com, which covers its subdomains. Empty: any site. Up to ${SIGNUP_FORM_LIMITS.domains}. Browsers then show the form only there, and only the script works.${hasBotCheck ? "" : SITES_WITHOUT_BOT_CHECK}`}
				>
					<Textarea
						value={draft.domains}
						rows={3}
						placeholder={"example.com\nmyblog.org"}
						className="font-mono text-[13px] leading-6"
						onChange={(event) => set("domains", event.target.value)}
					/>
				</Field>
			</Section>
			<BarSave
				isDirty={JSON.stringify(toInput(draft, newsletter)) !== JSON.stringify(toInput(saved, newsletter))}
				isSaving={isSaving}
				savedAt={savedAt}
				onDiscard={discard}
			/>
		</form>
	);
}

// What happens after someone signs up there: the newsletter's confirmed opt-in, or its welcome email.
function TextSignupPath({ newsletter }) {
	const text = newsletter.requireConfirmation
		? "They confirm their address first."
		: newsletter.welcome?.enabled
			? "They join at once and get your welcome email."
			: "They join at once.";
	return (
		<>
			{text}{" "}
			<Link
				href={getSectionPath(newsletter.requireConfirmation ? "signups" : "welcome")}
				className="font-medium whitespace-nowrap text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors duration-150 hover:decoration-foreground"
			>
				{newsletter.requireConfirmation ? "Confirm signups" : "Welcome email"}
			</Link>
		</>
	);
}

// The form as its frame draws it (lib/signup-form-page.js), on a canvas that stands for the owner's site. Submitting
// shows what a reader sees next, without signing anyone up. The frame reports its height as it does on a site.
function PreviewSignupForm({ newsletter, settings, notice }) {
	const frameRef = useRef(null);
	// The frame only gets its document in the browser: rendered on the server, it would load and report its height
	// before the page could listen.
	const isClient = useIsClient();
	const [height, setHeight] = useState(52);
	const settingsKey = useDeferredValue(JSON.stringify(settings));
	const html = useMemo(
		() => renderFormPage({ newsletter, settings: JSON.parse(settingsKey), endpoint: "#", isPreview: true, notice }),
		[newsletter, settingsKey, notice]
	);

	useEffect(() => {
		function onMessage(event) {
			if (event.source !== frameRef.current?.contentWindow || event.data?.type !== "mailcheap:height") return;
			if (event.data.height > 0) setHeight(Math.ceil(event.data.height));
		}
		window.addEventListener("message", onMessage);
		return () => window.removeEventListener("message", onMessage);
	}, []);

	return (
		<div className="bg-muted/40 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] bg-size-[16px_16px] px-4 py-10">
			<iframe
				ref={frameRef}
				title="Signup form preview"
				srcDoc={isClient ? html : undefined}
				sandbox="allow-scripts allow-forms"
				style={{ height }}
				className="mx-auto block w-full max-w-[480px] border-0 bg-transparent transition-[height] duration-200 ease-out"
			/>
		</div>
	);
}

// The prompt comes first: people build their sites with AI agents, which pick the code that fits. Where to paste it is for
// the codes, as the agent knows where the form goes.
function CodeSignupForm({ code, prompt, newsletter, settings, notice }) {
	const [tab, setTab] = useState("agent");

	return (
		<Tabs value={tab} onValueChange={setTab} className="gap-3 p-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<TabsList>
					<TabsTrigger value="agent" className="px-3">
						AI agent
					</TabsTrigger>
					<TabsTrigger value="script" className="px-3">
						Script
					</TabsTrigger>
					<TabsTrigger value="html" className="px-3">
						HTML
					</TabsTrigger>
					<TabsTrigger value="popup" className="px-3">
						Popup
					</TabsTrigger>
				</TabsList>
				{tab !== "agent" && (
					<LinkHelp article="website" section="form-on-your-site" className="text-xs">
						Where to paste it
					</LinkHelp>
				)}
			</div>
			<TabsContent value="agent" className="flex flex-col gap-2">
				<BlockPrompt prompt={prompt} />
				<p className="text-xs text-pretty text-muted-foreground">
					For the AI agent that builds your site, like Cursor, Claude Code, Codex or Lovable: it picks the code that fits your site,
					adds the form, then tells you what&apos;s left to do here.
				</p>
			</TabsContent>
			<TabsContent value="script" className="flex flex-col gap-2">
				<BlockCode title="Script" code={code.script} hasCopyLabel />
				<p className="text-xs text-pretty text-muted-foreground">
					Your theme, and the thank-you shows in place. Changes you save here reach your site on their own.
				</p>
			</TabsContent>
			<TabsContent value="popup" className="flex flex-col gap-2">
				<BlockCode title="Popup" code={code.popup} hasCopyLabel />
				<p className="text-xs text-pretty text-muted-foreground">
					Anywhere in your page. The form opens over it after 6 seconds, or when someone is about to leave, once every 14 days per
					visitor: change them with data-delay and data-days.
				</p>
				<PreviewPopup newsletter={newsletter} settings={settings} notice={notice} />
			</TabsContent>
			<TabsContent value="html" className="flex flex-col gap-2">
				{code.html ? (
					<>
						<BlockCode title="HTML" code={code.html} hasCopyLabel />
						<p className="text-xs text-pretty text-muted-foreground">
							Works without JavaScript and takes your site&apos;s font. Copy it again after changing the form&apos;s text or layout.
						</p>
					</>
				) : (
					<p className="rounded-lg bg-muted/60 px-3 py-2.5 text-xs text-pretty text-muted-foreground">
						Off while your sites are listed: a plain form can&apos;t prove which site it&apos;s on. Use the script.
					</p>
				)}
			</TabsContent>
		</Tabs>
	);
}

// The headline's fields start from what the card shows, so the newsletter's name and description are there to edit.
function toDraft(signupForm, newsletter) {
	const { allowedDomains, ...settings } = toSignupFormSettings(signupForm);
	return { ...settings, ...getSignupFormHeading(settings, newsletter), domains: allowedDomains.join("\n") };
}

// Left as the newsletter's name or description, the headline keeps following them, through a rename too.
function toInput(draft, newsletter) {
	const headline = draft.headline.trim();
	const subheadline = draft.subheadline.trim();
	return {
		enabled: draft.enabled,
		layout: draft.layout,
		headline: headline === newsletter.name ? null : headline,
		subheadline: subheadline === (newsletter.description ?? "") ? null : subheadline,
		askFirstName: draft.askFirstName,
		offerText: draft.offerText.trim(),
		offerCode: draft.offerCode.trim(),
		offerUnique: draft.offerUnique,
		buttonText: draft.buttonText.trim(),
		placeholder: draft.placeholder.trim(),
		allowedDomains: draft.domains
			.split(/[\s,]+/)
			.map((domain) => domain.trim())
			.filter(Boolean),
	};
}

const LAYOUT_OPTIONS = [
	{ value: "inline", label: "Inline", content: "Inline" },
	{ value: "card", label: "Card", content: "Card" },
];
// Without BotID, a script can still name a listed site: the frame's policy only binds browsers.
const SITES_WITHOUT_BOT_CHECK =
	" On this server, the list keeps the form off other sites' pages, but a script can still name one of yours: the signup limits apply, and confirmed opt-in keeps its addresses out of your list.";

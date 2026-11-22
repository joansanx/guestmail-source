import { cookies, headers } from "next/headers";
import TranslateDom from "@/components/TranslateDom";
import { LOCALE_COOKIE, READY_ATTRIBUTE, REVEAL_AFTER_MS, resolveLocale } from "@/lib/i18n/locale";

// Until TranslateDom has translated the page it stays invisible, so nobody reads English that turns into Spanish. The
// animation is the way out when the script never runs: after REVEAL_AFTER_MS the page shows, in English. Opacity and
// not visibility: a field with autofocus still takes the focus.
const HIDE_UNTIL_TRANSLATED = `@keyframes translate-reveal{to{opacity:1}}html:not([${READY_ATTRIBUTE}]) body>*{opacity:0;animation:translate-reveal 0s linear ${REVEAL_AFTER_MS}ms forwards}`;

// guestmail: put once in each layout of the dashboard, the welcome and the sign-in. For someone whose language is
// Spanish (lib/i18n/locale.js) it sends the dictionary and the script that applies it; for anyone else, nothing. The
// HTML is English either way.
export default async function TranslatePage() {
	const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
	if (resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value, headerStore.get("accept-language")) !== "es") return null;

	return (
		<>
			<style>{HIDE_UNTIL_TRANSLATED}</style>
			<TranslateDom />
		</>
	);
}

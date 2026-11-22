"use client";

import { useState } from "react";
import { Languages } from "lucide-react";
import {
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { DEFAULT_LOCALE, LOCALES, LOCALE_COOKIE, resolveLocale } from "@/lib/i18n/locale";

// guestmail: the account menu's Language submenu. The choice is a cookie the server reads on the next page
// (components/TranslatePage.jsx), so the page loads again with it.
export default function MenuLanguage() {
	return (
		<DropdownMenuSub>
			<DropdownMenuSubTrigger>
				<Languages />
				Language
			</DropdownMenuSubTrigger>
			<DropdownMenuPortal>
				<DropdownMenuSubContent className="w-36">
					<RadioGroupLanguage />
				</DropdownMenuSubContent>
			</DropdownMenuPortal>
		</DropdownMenuSub>
	);
}

function RadioGroupLanguage() {
	const [locale] = useState(readLocale);

	return (
		<DropdownMenuRadioGroup value={locale} onValueChange={chooseLocale} translate="no">
			{LOCALES.map(({ id, label }) => (
				<DropdownMenuRadioItem key={id} value={id}>
					{label}
				</DropdownMenuRadioItem>
			))}
		</DropdownMenuRadioGroup>
	);
}

// The same answer the server gave this page: the cookie, else the browser's first language.
function readLocale() {
	if (typeof document === "undefined") return DEFAULT_LOCALE;
	const saved = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`))?.[1];
	return resolveLocale(saved, navigator.languages?.join(","));
}

function chooseLocale(locale) {
	document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
	window.location.reload();
}

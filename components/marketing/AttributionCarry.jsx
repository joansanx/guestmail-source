"use client";

import { useEffect } from "react";
import { ATTRIBUTION_PARAMS } from "@/lib/marketing/attribution";

// guestmail: the visit's UTM parameters, and the external site it came from as ref, ride along on the links to the
// sign-up, so the sign-in form can keep them (lib/signup-source.js). Read from the address bar, never stored.
const CARRIED_PATHS = /^\/(es\/?)?(signin|pricing|agents|landing)?\/?$/;

export default function AttributionCarry() {
	useEffect(() => {
		const current = new URLSearchParams(window.location.search);
		const carried = new URLSearchParams();
		for (const key of ATTRIBUTION_PARAMS) if (current.get(key)) carried.set(key, current.get(key));
		if (!carried.get("ref") && document.referrer) {
			const from = new URL(document.referrer);
			if (from.hostname !== window.location.hostname) carried.set("ref", from.hostname);
		}
		if ([...carried.keys()].length === 0) return;

		function carry(event) {
			const link = event.target.closest?.("a[href]");
			if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
			const url = new URL(link.href, window.location.href);
			if (url.origin !== window.location.origin || !CARRIED_PATHS.test(url.pathname)) return;
			for (const [key, value] of carried) if (!url.searchParams.has(key)) url.searchParams.set(key, value);
			// A full navigation: client-side links ignore an href changed under them.
			event.preventDefault();
			window.location.assign(url.toString());
		}
		document.addEventListener("click", carry, true);
		return () => document.removeEventListener("click", carry, true);
	}, []);
	return null;
}

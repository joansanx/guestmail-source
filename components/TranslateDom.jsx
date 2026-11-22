"use client";

import { useEffect, useRef } from "react";
import dictionary from "@/lib/i18n/es";
import { ATTRIBUTES, createDomTranslator } from "@/lib/i18n/dom";
import { READY_ATTRIBUTE } from "@/lib/i18n/locale";
import { createTranslator } from "@/lib/i18n/translate";

const TEXT_NODE = 3;
// How often the nodes React hasn't hydrated yet are looked at again, and how long the page stays hidden for them once
// the rest is translated.
const RETRY_MS = 50;
const GRACE_MS = 250;

// One for the page's whole life: it remembers what each node said in English, which a remount must not forget.
let page;

// guestmail: the dashboard in Spanish, without a word of upstream's JSX changed. The server renders English, as the
// tests read it; once React has hydrated, this replaces what the dictionary has (lib/i18n/es), and again whenever React
// writes English back. Rendered by TranslatePage, only for someone whose language is Spanish. What it leaves alone and
// why: lib/i18n/dom.js.
export default function TranslateDom() {
	const anchor = useRef(null);

	useEffect(() => {
		const root = document.documentElement;
		const reveal = () => root.setAttribute(READY_ATTRIBUTE, "");
		page ??= createPageTranslator(anchor.current);
		if (!page) return void reveal();
		const { translator, translate } = page;

		// Upstream asks a few things in the browser's own dialog (sign out, leave without saving), which isn't in the page.
		const nativeConfirm = window.confirm;
		window.confirm = (message) => nativeConfirm.call(window, translate(String(message)) ?? message);

		const language = root.lang;
		const hideUntil = performance.now() + GRACE_MS;
		let timer;
		// After each pass: its own writes aren't news, and nodes still waiting for React get another look.
		function settle() {
			observer.takeRecords();
			clearTimeout(timer);
			if (translator.pendingCount() === 0 || performance.now() > hideUntil) reveal();
			if (translator.pendingCount() === 0) return;
			timer = setTimeout(() => {
				translator.retryPending();
				settle();
			}, RETRY_MS);
		}
		const observer = new MutationObserver((records) => {
			translator.handleMutations(records);
			settle();
		});

		root.lang = "es";
		translator.translateTree(root);
		observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRIBUTES });
		settle();

		return () => {
			observer.disconnect();
			clearTimeout(timer);
			root.lang = language;
			window.confirm = nativeConfirm;
		};
	}, []);

	return <span ref={anchor} hidden />;
}

// React marks each node it has hydrated or created with its fiber, under a key it makes up per page. A text it hasn't
// reached yet must stay as the server sent it, or its hydration fails and React renders that part of the page again.
// A lone text child is its element's own text, and has no fiber of its own. No key to be found means React changed how
// it marks nodes: then nothing is translated, loudly, rather than risk every hydration (tests/i18n.test.mjs watches for it).
function createPageTranslator(anchor) {
	const fiberKey = anchor && Object.keys(anchor).find((key) => key.startsWith("__reactFiber$"));
	if (!fiberKey) {
		console.error("[i18n] Can't tell which nodes React has hydrated, so the dashboard stays in English.");
		return null;
	}
	const isReady = (node) => fiberKey in node || (node.nodeType === TEXT_NODE && node.parentNode.childNodes.length === 1 && fiberKey in node.parentNode);
	const translate = createTranslator(dictionary);
	return { translate, translator: createDomTranslator({ translate, isReady }) };
}

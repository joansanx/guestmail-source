// guestmail: the walk that puts a translation on a page React owns, without React noticing. Used by
// components/TranslateDom.jsx; it only asks nodes for what every DOM has, so tests run it on a parsed HTML tree.
//
// It only ever sets a text node's value or one of four attributes. It never adds, removes or replaces a node: React
// keeps its own reference to each one, and a node swapped under it is how browser translators break React apps.
//
// What it never touches, whatever the dictionary says: anything editable (the campaign editor is a contenteditable:
// a translated node there would be saved as the customer's email), a field's value, code, and anything under
// translate="no" or data-no-translate, which is how a component marks what a customer wrote.
export const ATTRIBUTES = ["placeholder", "title", "aria-label", "alt"];

const ELEMENT = 1;
const TEXT = 3;
const COMMENT = 8;
const SKIPPED_TAGS = new Set(["script", "style", "noscript", "textarea", "code", "pre", "kbd", "samp", "template", "iframe"]);
// How long a node waits for React to hydrate it before it's left in English.
const PENDING_MS = 15000;

function isSkipped(element) {
	const tag = element.tagName.toLowerCase();
	if (SKIPPED_TAGS.has(tag)) return true;
	if (element.hasAttribute("data-no-translate") || element.getAttribute("translate") === "no") return true;
	const editable = element.getAttribute("contenteditable");
	if (editable !== null && editable !== "false") return true;
	// An option without a value submits its text.
	if (tag === "option" && !element.hasAttribute("value")) return true;
	return /(^|\s)notranslate(\s|$)/.test(element.getAttribute("class") ?? "");
}

function isInsideSkipped(node) {
	for (let element = node.nodeType === ELEMENT ? node : node.parentNode; element && element.nodeType === ELEMENT; element = element.parentNode) {
		if (isSkipped(element)) return true;
	}
	return false;
}

// React puts an empty comment between two texts it rendered side by side on the server; its other comments mark where
// a Suspense boundary starts and ends.
const isSeparator = (node) => node.nodeType === COMMENT && !node.nodeValue.trim();

// translate: lib/i18n/translate.js. isReady(node): whether React is done with a node, so changing it can't make its
// hydration fail; a node that isn't waits, and retryPending() looks again. now: for tests.
export function createDomTranslator({ translate, isReady = () => true, now = Date.now }) {
	// What each node said in English, and what it was made to say: a node that still says the second still means the first.
	const texts = new WeakMap();
	const attributes = new WeakMap();
	// Each waiting node, and since when: a retry keeps the time of its first wait.
	const pending = new Map();
	let waitingSince = null;
	let writes = 0;

	const sourceOf = (memory, value) => (memory && memory.shown === value ? memory.source : value);

	function wait(node) {
		if (!pending.has(node)) pending.set(node, waitingSince ?? now());
	}

	// The texts that read as one: a text node and the ones beside it, with nothing but React's separators between them.
	function runOf(node) {
		const run = [node];
		for (let previous = node.previousSibling; previous && (previous.nodeType === TEXT || isSeparator(previous)); previous = previous.previousSibling) {
			if (previous.nodeType === TEXT) run.unshift(previous);
		}
		for (let next = node.nextSibling; next && (next.nodeType === TEXT || isSeparator(next)); next = next.nextSibling) {
			if (next.nodeType === TEXT) run.push(next);
		}
		return run;
	}

	function write(node, value) {
		if (node.nodeValue === value) return;
		node.nodeValue = value;
		writes += 1;
	}

	// The whole translation goes in the run's first node and the others are emptied, so it holds whatever the order of
	// the words. Each keeps its English: when React changes one of them, the run is read again in English.
	function translateRun(run) {
		const sources = run.map((node) => sourceOf(texts.get(node), node.nodeValue));
		const translated = translate(sources.join(""));
		if (translated === null) {
			run.forEach((node, index) => {
				write(node, sources[index]);
				texts.delete(node);
			});
			return;
		}
		if (!run.every(isReady)) return void wait(run[0]);
		run.forEach((node, index) => {
			const shown = index === 0 ? translated : "";
			write(node, shown);
			texts.set(node, { source: sources[index], shown });
		});
	}

	function translateAttribute(element, name) {
		if (!element.hasAttribute(name)) return;
		const memory = attributes.get(element) ?? {};
		const value = element.getAttribute(name);
		const source = sourceOf(memory[name], value);
		const translated = translate(source);
		if (translated === null) {
			if (value !== source) {
				element.setAttribute(name, source);
				writes += 1;
			}
			delete memory[name];
			return;
		}
		if (!isReady(element)) return void wait(element);
		if (value !== translated) {
			element.setAttribute(name, translated);
			writes += 1;
		}
		memory[name] = { source, shown: translated };
		attributes.set(element, memory);
	}

	function translateTexts(parent, done) {
		for (let child = parent.firstChild; child; child = child.nextSibling) {
			if (child.nodeType !== TEXT || done.has(child)) continue;
			const run = runOf(child);
			run.forEach((node) => done.add(node));
			translateRun(run);
		}
	}

	function walk(element, done) {
		if (isSkipped(element)) return;
		for (const name of ATTRIBUTES) translateAttribute(element, name);
		translateTexts(element, done);
		for (let child = element.firstChild; child; child = child.nextSibling) {
			if (child.nodeType === ELEMENT) walk(child, done);
		}
	}

	function translateNode(node, done = new Set()) {
		if (!node || isInsideSkipped(node)) return;
		if (node.nodeType === ELEMENT) return void walk(node, done);
		if (node.nodeType !== TEXT || done.has(node) || !node.parentNode) return;
		const run = runOf(node);
		run.forEach((text) => done.add(text));
		translateRun(run);
	}

	return {
		// A page, or any part of it.
		translateTree(root) {
			translateNode(root);
		},
		// What a MutationObserver saw. Its own writes come back here too, and change nothing: a node that says what it was
		// made to say is left alone.
		handleMutations(records) {
			const done = new Set();
			for (const record of records) {
				if (record.type === "characterData") translateNode(record.target, done);
				else if (record.type === "attributes") {
					if (ATTRIBUTES.includes(record.attributeName) && !isInsideSkipped(record.target)) translateAttribute(record.target, record.attributeName);
				} else if (record.type === "childList") {
					// A text added or removed changes the run its neighbours are part of.
					const changed = [...record.addedNodes, ...record.removedNodes];
					if (changed.some((node) => node.nodeType !== ELEMENT) && !isInsideSkipped(record.target)) translateTexts(record.target, done);
					for (const node of record.addedNodes) if (node.nodeType === ELEMENT && node.parentNode) translateNode(node, done);
				}
			}
		},
		// The nodes React hadn't hydrated yet, again. Returns how many still wait.
		retryPending() {
			const waiting = [...pending];
			pending.clear();
			const done = new Set();
			for (const [node, since] of waiting) {
				if (!node.parentNode || now() - since > PENDING_MS) continue;
				waitingSince = since;
				if (node.nodeType !== ELEMENT) translateNode(node, done);
				else if (!isInsideSkipped(node)) for (const name of ATTRIBUTES) translateAttribute(node, name);
			}
			waitingSince = null;
			return pending.size;
		},
		pendingCount: () => pending.size,
		writeCount: () => writes,
	};
}

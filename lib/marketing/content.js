import "server-only";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { BLOG_SLUG, LANGS, PAGE_SLUGS, getPagePath, getPostPath } from "./site-pages.js";

// guestmail: the public site's words, read from the Markdown files of content/ (their shape: CONTRATO_CONTENIDO.md in
// the agents' workspace, repeated in tests/site-content.test.mjs). content/site/<lang>/<slug>.md is a page,
// content/blog/<lang>/<slug>.md an article. Only a published file is served; a draft answers 404 and is listed nowhere.
// CONTENT_DIR moves the folder, for tests and for a server that keeps its content outside the code.
export function getContentDir(env = process.env) {
	return env.CONTENT_DIR?.trim() || join(process.cwd(), "content");
}

const STATUSES = ["draft", "published"];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
const REQUIRED = ["title", "description", "slug", "lang", "date", "updated", "status"];

function readScalar(text, fail) {
	const double = /^"((?:[^"\\]|\\.)*)"\s*(?:#.*)?$/.exec(text);
	if (double) {
		try {
			return JSON.parse(`"${double[1]}"`);
		} catch {
			fail();
		}
	}
	const single = /^'((?:[^']|'')*)'\s*(?:#.*)?$/.exec(text);
	if (single) return single[1].replaceAll("''", "'");
	const bare = text.replace(/\s+#.*$/, "").trim();
	if (!bare || /^["'[{|>&*!%@`]/.test(bare)) fail();
	return bare;
}

// The header's subset of YAML: "key: value" lines, and under a "key:" line a list of "- value" or of "- key: value"
// maps. Values in double quotes (read as JSON strings), in single quotes or bare, with # comments. Anything else throws
// with its line: a header half read would publish half a page.
// ponytail: no nested maps, block scalars or anchors. Swap for a YAML package if the content ever needs them.
export function parseHeader(text, file = "content") {
	const header = {};
	let list = null;
	text.split("\n").forEach((raw, index) => {
		const line = raw.trimEnd();
		if (!line.trim() || line.trim().startsWith("#")) return;
		const fail = () => {
			throw new Error(`${file}:${index + 2}: can't read "${line.trim()}" (lib/marketing/content.js says what a header takes)`);
		};
		const top = /^([A-Za-z]\w*):(?:\s+(.*))?$/.exec(line);
		if (top) {
			list = top[2] ? null : [];
			header[top[1]] = top[2] ? readScalar(top[2], fail) : list;
			return;
		}
		const entry = list && /^\s+(-\s+)?(?:([A-Za-z]\w*):\s+)?(.+)$/.exec(line);
		if (!entry) fail();
		const [, dash, key, value] = entry;
		if (dash && !key) list.push(readScalar(value, fail));
		else if (dash) list.push({ [key]: readScalar(value, fail) });
		else if (key && typeof list.at(-1) === "object") list.at(-1)[key] = readScalar(value, fail);
		else fail();
	});
	return header;
}

// A file as { ...header, body }, checked against the contract. Throws on a file that breaks it.
export function parseContent(source, { file = "content", lang, slug } = {}) {
	const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(source.replaceAll("\r\n", "\n"));
	if (!match) throw new Error(`${file}: no header between --- lines`);
	const doc = { ...parseHeader(match[1], file), body: match[2].trim() };
	const problem =
		REQUIRED.find((key) => typeof doc[key] !== "string" || !doc[key]) ||
		(slug && doc.slug !== slug && "slug (its file's name)") ||
		(lang && doc.lang !== lang && "lang (its folder's)") ||
		(!LANGS.includes(doc.lang) && "lang") ||
		(!STATUSES.includes(doc.status) && "status") ||
		(![doc.date, doc.updated].every((date) => DATE_PATTERN.test(date) && !Number.isNaN(Date.parse(date))) && "date or updated") ||
		(doc.updated < doc.date && "updated (before date)") ||
		((doc.faq ?? []).some((item) => !item?.q || !item.a) && "faq (each needs q and a)") ||
		((doc.sources ?? []).some((item) => !item?.title || !/^https?:\/\//.test(item.url ?? "") || (item.checked && !DATE_PATTERN.test(item.checked))) &&
			"sources (each needs a title, a url and, when it has one, a checked day)");
	if (problem) throw new Error(`${file}: bad or missing ${problem}`);
	return doc;
}

function readFile(kind, lang, slug) {
	if (!LANGS.includes(lang) || !SLUG_PATTERN.test(String(slug))) return null;
	const file = join(getContentDir(), kind, lang, `${slug}.md`);
	let source;
	try {
		source = readFileSync(file, "utf8");
	} catch (error) {
		if (error.code === "ENOENT") return null;
		throw error;
	}
	return { ...parseContent(source, { file: `content/${kind}/${lang}/${slug}.md`, lang, slug }), kind };
}

// One of the site's pages (lib/marketing/site-pages.js), with its address. The site can't run without one of them, or
// with one that isn't published or can't be read: this throws then, and the build stops.
export function getPage(lang, slug) {
	if (!PAGE_SLUGS.includes(slug) && slug !== BLOG_SLUG) return null;
	const page = readFile("site", lang, slug);
	if (page?.status !== "published") throw new Error(`content/site/${lang}/${slug}.md is missing or not published`);
	return { ...page, path: getPagePath(lang, slug), translation: getPagePath(page.lang === "en" ? "es" : "en", slug) };
}

// A file the robot wrote wrong doesn't take the blog down with it: it's left out, with a line in the log, and
// tests/site-content.test.mjs fails on it before a deploy.
function readPost(lang, slug) {
	try {
		const post = readFile("blog", lang, slug);
		return post && { ...post, path: getPostPath(lang, slug) };
	} catch (error) {
		console.error("[content] Left out:", error.message);
		return null;
	}
}

// Published articles, newest first. Empty when the folder isn't there.
export function listPosts(lang) {
	let files;
	try {
		files = readdirSync(join(getContentDir(), "blog", lang));
	} catch (error) {
		if (error.code === "ENOENT") return [];
		throw error;
	}
	return files
		.filter((file) => file.endsWith(".md"))
		.map((file) => readPost(lang, file.slice(0, -3)))
		.filter((post) => post?.status === "published")
		.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

// A published article, with the address of its translation when that one is published too. Null for a draft.
export function getPost(lang, slug) {
	const post = readPost(lang, slug);
	if (post?.status !== "published") return null;
	const other = post.translationOf ? readPost(lang === "en" ? "es" : "en", post.translationOf) : null;
	return { ...post, translation: other?.status === "published" ? other.path : null };
}

// What the sitemap lists for the marketing site, each with the day its file was last reviewed: its pages in their
// order, then each language's blog, once it has an article, and its articles.
export function listSitemapEntries() {
	const pages = LANGS.flatMap((lang) => PAGE_SLUGS.map((slug) => getPage(lang, slug))).map(({ path, updated }) => ({ path, updated }));
	return [...pages, ...listBlogEntries()];
}

function listBlogEntries() {
	return LANGS.flatMap((lang) => {
		const posts = listPosts(lang);
		if (posts.length === 0) return [];
		const updated = posts.map((post) => post.updated).sort().at(-1);
		return [{ path: getPagePath(lang, BLOG_SLUG), updated }, ...posts.map(({ path, updated: reviewed }) => ({ path, updated: reviewed }))];
	});
}

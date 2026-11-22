import { cleanTag } from "./contact-fields.js";

// guestmail: an automation's path (models/Automation.js), checked and walked. Its steps are a flat list: each step is in
// the lane of the condition branch it follows (parent and branch), or on the main path, in the list's order. A condition
// ends its lane and splits it in two, Yes and No, so the path is a tree and nobody goes through a step twice. Pure, for
// the server and the editor alike.
export const TRIGGER_TYPES = ["join", "tag", "click", "manual", "booking"];
export const STEP_TYPES = ["email", "wait", "condition"];
export const WAIT_UNITS = ["hours", "days"];
export const CONDITION_CHECKS = ["opened", "clicked", "tag", "segment"];
export const BRANCHES = ["yes", "no"];
export const MAX_STEPS = 40;
export const MAX_WAIT = { hours: 720, days: 365 };
export const STEP_ID_PATTERN = /^[a-z0-9_-]{1,40}$/i;
const HOUR_MS = 60 * 60 * 1000;

function laneKey(parent, branch) {
	return parent ? `${parent}:${branch}` : "";
}

// The steps of one lane, in order: the main path, or a condition's Yes or No.
export function getLane(steps, parent = null, branch = null) {
	const key = laneKey(parent, branch);
	return steps.filter((step) => laneKey(step.parent, step.branch) === key);
}

export function getFirstStep(steps) {
	return getLane(steps)[0] ?? null;
}

// Where someone goes after a step, down a condition's branch: null where the path ends.
export function getNextStep(steps, stepId, branch = null) {
	const step = steps.find(({ id }) => id === stepId);
	if (!step) return null;
	if (step.type === "condition") return getLane(steps, step.id, branch)[0] ?? null;
	const lane = getLane(steps, step.parent, step.branch);
	return lane[lane.indexOf(step) + 1] ?? null;
}

// Every step someone went through to reach this one, first to last.
export function getStepsBefore(steps, step) {
	const lane = getLane(steps, step.parent, step.branch);
	const before = lane.slice(0, lane.indexOf(step));
	const parent = step.parent ? steps.find(({ id }) => id === step.parent) : null;
	return parent ? [...getStepsBefore(steps, parent), parent, ...before] : before;
}

// The step and every step under it, for a condition both of its branches.
export function getStepsUnder(steps, stepId) {
	const under = steps.filter(({ parent }) => parent === stepId);
	return under.flatMap(({ id }) => [id, ...getStepsUnder(steps, id)]);
}

export function getWaitMs({ amount, unit }) {
	return amount * (unit === "days" ? 24 : 1) * HOUR_MS;
}

// A trigger as given: { type, tag, campaign } or what's wrong with it. Whether the campaign is the newsletter's is the
// caller's to check.
export function checkTrigger(trigger) {
	if (!TRIGGER_TYPES.includes(trigger?.type)) return { problem: `trigger.type must be one of ${TRIGGER_TYPES.join(", ")}` };
	if (trigger.type === "tag") {
		const tag = cleanTag(trigger.tag ?? "");
		return tag ? { trigger: { type: "tag", tag } } : { problem: "Pick the tag that starts it" };
	}
	if (trigger.type === "click") {
		const campaign = String(trigger.campaign ?? "").trim();
		return campaign ? { trigger: { type: "click", campaign } } : { problem: "Pick the campaign whose links start it" };
	}
	return { trigger: { type: trigger.type } };
}

// Steps as given, each with only its own type's fields, or the first problem, in words for the person editing them.
// An email step keeps whatever else it came with (its campaign, a new email's words) for the caller.
export function checkSteps(input) {
	if (!Array.isArray(input)) return { problem: "steps must be a list" };
	if (input.length > MAX_STEPS) return { problem: `An automation has ${MAX_STEPS} steps at most` };
	const steps = [];
	const seen = new Map();
	for (const raw of input) {
		const id = String(raw?.id ?? "");
		if (!STEP_ID_PATTERN.test(id)) return { problem: `"${id.slice(0, 40)}" isn't a step id: letters, digits, - and _, 40 at most` };
		if (seen.has(id)) return { problem: `Two steps are called "${id}"` };
		if (!STEP_TYPES.includes(raw.type)) return { problem: `Step "${id}": type must be email, wait or condition` };
		const parent = raw.parent || null;
		if (parent && seen.get(parent)?.type !== "condition") return { problem: `Step "${id}" follows "${parent}", which isn't a condition before it` };
		if (parent && !BRANCHES.includes(raw.branch)) return { problem: `Step "${id}": branch must be yes or no` };
		const step = { ...readFields(raw), id, type: raw.type, ...(parent && { parent, branch: raw.branch }) };
		if (step.problem) return { problem: `Step "${id}": ${step.problem}` };
		seen.set(id, step);
		steps.push(step);
	}
	for (const step of steps) {
		const lane = getLane(steps, step.parent, step.branch);
		if (step.type === "condition" && lane.at(-1) !== step) return { problem: "A condition ends its path: the steps after it go in its Yes or No" };
		if (["opened", "clicked"].includes(step.check)) {
			const email = getStepsBefore(steps, step).find(({ id, type }) => id === step.email && type === "email");
			if (!email) return { problem: "A condition can only look at an email before it on its path" };
		}
	}
	return { steps };
}

function readFields(raw) {
	if (raw.type === "email") {
		const { id, type, parent, branch, ...rest } = raw;
		return rest;
	}
	if (raw.type === "wait") {
		const amount = Number(raw.amount);
		if (!WAIT_UNITS.includes(raw.unit)) return { problem: "a wait is in hours or days" };
		if (!Number.isInteger(amount) || amount < 1 || amount > MAX_WAIT[raw.unit]) return { problem: `a wait is 1 to ${MAX_WAIT[raw.unit]} ${raw.unit}` };
		return { amount, unit: raw.unit };
	}
	if (!CONDITION_CHECKS.includes(raw.check)) return { problem: "pick what the condition checks" };
	if (raw.check === "tag") {
		const tag = cleanTag(raw.tag ?? "");
		return tag ? { check: "tag", tag } : { problem: "pick the tag it checks" };
	}
	if (raw.check === "segment") {
		const segment = String(raw.segment ?? "").trim();
		return segment ? { check: "segment", segment } : { problem: "pick the segment it checks" };
	}
	const email = String(raw.email ?? "").trim();
	return email ? { check: raw.check, email } : { problem: "pick the email it checks" };
}

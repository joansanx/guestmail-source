import { CalendarCheck, Hand, MousePointerClick, Tag, UserPlus } from "lucide-react";

// guestmail: the colour of each part of an automation, the same on the canvas, the list and the menus: the trigger amber,
// an email sky, a wait violet, a condition fuchsia, and its Yes and No green and orange. Full class names, so Tailwind
// finds them. Only colour here: the words stay where they are, so the dashboard's translation (lib/i18n) still matches.
export const TONES = {
	trigger: { tile: "bg-amber-500 text-white", head: "bg-amber-500/10", icon: "text-amber-600 dark:text-amber-400" },
	email: { tile: "bg-sky-500 text-white", head: "bg-sky-500/10", icon: "text-sky-600 dark:text-sky-400" },
	wait: { tile: "bg-violet-500 text-white", head: "bg-violet-500/10", icon: "text-violet-600 dark:text-violet-400" },
	condition: { tile: "bg-fuchsia-500 text-white", head: "bg-fuchsia-500/10", icon: "text-fuchsia-600 dark:text-fuchsia-400" },
	yes: { tile: "bg-emerald-500 text-white" },
	no: { tile: "bg-orange-500 text-white" },
	pink: { tile: "bg-pink-500 text-white", icon: "text-pink-600 dark:text-pink-400" },
};

export const TRIGGER_ICONS = { join: UserPlus, tag: Tag, click: MousePointerClick, manual: Hand, booking: CalendarCheck };

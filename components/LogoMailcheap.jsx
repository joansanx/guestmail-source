import { cn } from "@/lib/utils";

// guestmail: an envelope in two facets, its flap over its body. The share images draw the same shapes, so they import these.
export const LOGO_VIEWBOX = "11 9 45 45";
export const LOGO_FACETS = { upper: "M14 18H53L33.5 34Z", lower: "M14 23 33.5 39 53 23V45H14Z" };
export const LOGO_SHADE = 0.35;

export default function LogoMailcheap({ className }) {
	return (
		<svg viewBox={LOGO_VIEWBOX} aria-hidden="true" className={cn("size-6 shrink-0 text-foreground", className)}>
			<path d={LOGO_FACETS.upper} fill="currentColor" />
			<path d={LOGO_FACETS.lower} fill="currentColor" fillOpacity={LOGO_SHADE} />
		</svg>
	);
}

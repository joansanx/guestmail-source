"use client";

// guestmail: a link in a popover menu that closes the menu as it's followed. A link to a section of the page it's on,
// like the landing's templates (components/HeaderSite.jsx), keeps the page, and the open menu would stay over it.
// Before the page's script loads it's the plain link it renders.
export default function LinkPopover({ href, className, children }) {
	return (
		<a href={href} className={className} onClick={(event) => event.currentTarget.closest("[popover]")?.hidePopover()}>
			{children}
		</a>
	);
}

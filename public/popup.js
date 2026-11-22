// The signup popup for your site, with your offer's code once someone joins: one tag, anywhere in the page.
// <script src="https://<server>/popup.js" data-form="<newsletter id>" async></script>
// data-delay: seconds before it opens (6). data-days: days before a visitor who closed it sees it again (14).
(function () {
	var script = document.currentScript;
	var id = script && script.getAttribute("data-form");
	if (!id) return;
	var origin = new URL(script.src).origin;
	var key = "guestmail-popup-" + id;
	var days = Number(script.getAttribute("data-days")) || 14;
	var delay = Number(script.getAttribute("data-delay"));
	if (!(delay >= 0)) delay = 6;

	// A browser that blocks storage shows the popup on every page: nothing breaks.
	function wasSeen() {
		try {
			return Date.now() - Number(localStorage.getItem(key)) < days * 864e5;
		} catch (error) {
			return false;
		}
	}
	function remember() {
		try {
			localStorage.setItem(key, String(Date.now()));
		} catch (error) {}
	}
	if (wasSeen()) return;

	function open() {
		if (document.getElementById(key) || wasSeen()) return;
		var overlay = document.createElement("div");
		overlay.id = key;
		overlay.setAttribute("role", "dialog");
		overlay.setAttribute("aria-modal", "true");
		overlay.setAttribute("aria-label", "Sign up");
		overlay.style.cssText = "position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.45)";
		var box = document.createElement("div");
		box.style.cssText = "position:relative;width:100%;max-width:440px";
		var close = document.createElement("button");
		close.type = "button";
		close.setAttribute("aria-label", "Close");
		close.textContent = "×";
		close.style.cssText = "position:absolute;top:-14px;right:-6px;width:32px;height:32px;padding:0;border:0;border-radius:999px;background:#fff;color:#111;font:20px/1 sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.25)";
		var frame = document.createElement("iframe");
		frame.src = origin + "/embed/" + encodeURIComponent(id) + "?popup=1";
		frame.title = "Sign up";
		frame.setAttribute("scrolling", "no");
		frame.style.cssText = "display:block;width:100%;height:220px;border:0;background:transparent";

		// Remembered only once the visitor closes it: nothing is stored on a visit where they never saw it through.
		function shut() {
			remember();
			overlay.remove();
			document.removeEventListener("keydown", onKey);
			window.removeEventListener("message", onMessage);
		}
		function onKey(event) {
			if (event.key === "Escape") shut();
		}
		function onMessage(event) {
			var data = event.data;
			if (event.origin !== origin || event.source !== frame.contentWindow || !data || data.type !== "mailcheap:height") return;
			if (data.height > 0) frame.style.height = Math.ceil(data.height) + "px";
		}
		close.addEventListener("click", shut);
		overlay.addEventListener("click", function (event) {
			if (event.target === overlay) shut();
		});
		document.addEventListener("keydown", onKey);
		window.addEventListener("message", onMessage);
		box.appendChild(frame);
		box.appendChild(close);
		overlay.appendChild(box);
		document.body.appendChild(overlay);
		close.focus();
	}

	setTimeout(open, delay * 1000);
	// On a computer, also when the pointer leaves through the top of the page, on its way to the tabs.
	document.addEventListener("mouseout", function (event) {
		if (!event.relatedTarget && event.clientY <= 0) open();
	});
})();

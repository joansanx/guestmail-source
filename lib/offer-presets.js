// guestmail: ready offers for the signup form and popup (components/FormEmbed.jsx): the reason a guest gives their
// email. Each one is what the venue gives and a code its booking engine or till takes. The owner edits both after.
export const OFFER_PRESETS = {
	hotel: [
		{ en: "10% off your next direct booking", es: "10% de descuento en tu próxima reserva directa", code: "DIRECT10" },
		{ en: "A welcome drink on arrival", es: "Una bebida de bienvenida al llegar", code: "WELCOME" },
		{ en: "Late check-out on your next stay", es: "Salida tardía en tu próxima estancia", code: "LATE" },
		{ en: "Breakfast included when you book direct", es: "Desayuno incluido si reservas directo", code: "BREAKFAST" },
	],
	restaurant: [
		{ en: "10% off your next table", es: "10% de descuento en tu próxima mesa", code: "TABLE10" },
		{ en: "A glass of cava with your next dinner", es: "Una copa de cava con tu próxima cena", code: "CAVA" },
		{ en: "Dessert on us on your next visit", es: "El postre invita la casa en tu próxima visita", code: "DESSERT" },
	],
	other: [
		{ en: "10% off your next order", es: "10% de descuento en tu próximo pedido", code: "WELCOME10" },
		{ en: "Free shipping on your next order", es: "Envío gratis en tu próximo pedido", code: "SHIPFREE" },
		{ en: "A gift with your next purchase", es: "Un regalo con tu próxima compra", code: "GIFT" },
	],
};

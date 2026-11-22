// guestmail: hospitality photos that come with GuestMail, for the designs (lib/campaign-designs.js) and the editor's image
// picker. Each is a file in public/stock, 1200×800, with a small copy in public/stock/thumbs, from Unsplash under the Unsplash License, with no recognizable
// person, brand or text in it: public/stock/CREDITS.md says where each one comes from. tags: what the picker's search
// finds it by, in English and Spanish. kinds: the venues it's shown first to.
export const STOCK_PHOTO_SIZE = { width: 1200, height: 800 };

const photo = (id, kinds, en, es, tags, author, source) => ({ id, file: `${id}.jpg`, kinds, alt: { en, es }, tags, author, source: `https://unsplash.com/photos/${source}` });

export const STOCK_PHOTOS = [
	photo("room-white-linen", ["hotel"], "Hotel room with a large bed in white linen", "Habitación de hotel con una cama grande de sábanas blancas", ["room", "bed", "bedroom", "habitación", "cama", "dormitorio"], "Vojtech Bruzek", "white-bed-linen-with-throw-pillows-Yrxr3bsPdS0"),
	photo("room-bright", ["hotel"], "Bright hotel room with a bed by the window", "Habitación luminosa con la cama junto a la ventana", ["room", "bed", "bedroom", "window", "habitación", "cama", "ventana"], "Point3D Commercial Imaging Ltd.", "white-bed-linen-on-bed-oxeCZrodz78"),
	photo("room-suite-sofa", ["hotel"], "Suite with a sofa at the foot of the bed", "Suite con un sofá a los pies de la cama", ["room", "suite", "sofa", "bed", "habitación", "suite", "sofá", "cama"], "reisetopia", "red-throw-pillow-on-white-couch-aI6Su7Mu9Ro"),
	photo("bathroom-bathtub", ["hotel"], "Bathroom with a freestanding bathtub", "Baño con una bañera exenta", ["bathroom", "bathtub", "bath", "baño", "bañera"], "Jared Rice", "white-ceramic-bathtub-PibraWHb4h8"),
	photo("lobby-lounge", ["hotel"], "Hotel lobby with armchairs and plants", "Vestíbulo de hotel con sillones y plantas", ["lobby", "reception", "lounge", "recepción", "vestíbulo", "salón"], "Frames For Your Heart", "modern-hotel-lobby-with-designer-furniture-and-wood-walls-zSG-kd-L6vw"),
	photo("reception-bell", ["hotel"], "Brass service bell on the reception desk", "Timbre de latón en el mostrador de recepción", ["reception", "bell", "desk", "welcome", "recepción", "timbre", "bienvenida"], "Jonathan Cosens Photography", "a-vintage-brass-service-bell-on-a-wooden-desk-ZiMY3tT7y5Q"),
	photo("breakfast-spread", ["hotel", "restaurant"], "Breakfast table with waffles, eggs and juice", "Mesa de desayuno con gofres, huevos y zumo", ["breakfast", "brunch", "food", "desayuno", "brunch", "comida"], "Rachel Park", "breakfast-spread-with-waffles-eggs-and-juice-hrlvr2ZlUNk"),
	photo("breakfast-terrace", ["hotel", "restaurant"], "Breakfast with fruit and juice on a terrace table", "Desayuno con fruta y zumo en una mesa de terraza", ["breakfast", "terrace", "fruit", "juice", "desayuno", "terraza", "fruta", "zumo"], "Antonio Araujo", "a-wooden-table-topped-with-plates-of-food-DnZiQ0hSk6M"),
	photo("pool-garden", ["hotel"], "Swimming pool among palm trees with mountains behind", "Piscina entre palmeras con montañas al fondo", ["pool", "swimming", "garden", "summer", "piscina", "jardín", "verano"], "Sara Dubler", "photo-of-brown-bench-near-swimming-pool-Koei_7yYtIo"),
	photo("pool-loungers", ["hotel"], "Row of sun loungers by the swimming pool", "Fila de tumbonas junto a la piscina", ["pool", "swimming", "loungers", "summer", "piscina", "tumbonas", "hamacas", "verano"], "NATHAN MULLET", "a-row-of-lounge-chairs-sitting-next-to-a-swimming-pool-gxFc9OA09es"),
	photo("spa-treatment-room", ["hotel"], "Spa treatment room with a massage table", "Cabina de spa con una camilla de masaje", ["spa", "massage", "wellness", "treatment", "masaje", "bienestar", "tratamiento"], "Cherosi", "white-and-black-round-table-near-white-wall-AV0KNliGvQc"),
	photo("spa-towels", ["hotel"], "Stack of rolled white towels", "Toallas blancas enrolladas y apiladas", ["spa", "towels", "wellness", "toallas", "bienestar"], "iridial", "stack-of-white-rolled-towels-0Qv4fUvlSrI"),
	photo("terrace-sea", ["hotel", "restaurant"], "Terrace with tables looking out to sea", "Terraza con mesas y vistas al mar", ["terrace", "sea", "view", "outdoor", "terraza", "mar", "vistas", "exterior"], "Tetiana Shevereva", "brown-wooden-table-and-chairs-near-swimming-pool-during-daytime-K_qfWkLZHic"),
	photo("terrace-rooftop", ["hotel", "restaurant"], "Rooftop terrace over the city at sunset", "Terraza en la azotea sobre la ciudad al atardecer", ["terrace", "rooftop", "city", "skyline", "sunset", "terraza", "azotea", "ciudad", "atardecer"], "garrett parker", "patio-set-in-terrace-overlooking-city-xQWLtlQb7L0"),
	photo("dish-fish", ["restaurant"], "Fish fillet with sprouts in a light sauce", "Lomo de pescado con brotes sobre una salsa ligera", ["dish", "food", "fish", "plate", "plato", "comida", "pescado"], "hirok yam", "delicate-fish-fillet-with-crispy-skin-sprouts-and-sauce--VwE7jyvsqA"),
	photo("dish-plated", ["restaurant"], "Plated dish seen from above with glasses of white wine", "Plato servido visto desde arriba con copas de vino blanco", ["dish", "food", "plate", "wine", "plato", "comida", "vino"], "Sebastian Coman Photography", "bread-with-green-vegetable-on-white-ceramic-plate-dUqX2Eq-2jk"),
	photo("pasta-plate", ["restaurant"], "Plate of fresh pasta with mushrooms and herbs", "Plato de pasta fresca con setas y hierbas", ["pasta", "dish", "food", "italian", "plato", "comida", "italiana"], "Eaters Collective", "pasta-dish-on-white-plate-ddZYOtZUnBk"),
	photo("tapas-table", ["restaurant"], "Small plates to share on a wooden table", "Platos para compartir sobre una mesa de madera", ["tapas", "sharing", "dishes", "food", "compartir", "platos", "raciones", "comida"], "Maddi Bazzocco", "flat-lay-photography-of-cooked-food-cVmNIJCa1XA"),
	photo("tapas-spread", ["restaurant"], "Boards of appetizers with glasses of wine", "Tablas de aperitivos con copas de vino", ["tapas", "appetizers", "buffet", "event", "aperitivos", "picoteo", "evento"], "Olivier Amyot", "a-spread-of-appetizers-and-drinks-on-a-table-YC6w96pRwuQ"),
	photo("bread-basket", ["restaurant"], "Basket of freshly baked bread", "Cesta de pan recién horneado", ["bread", "bakery", "basket", "pan", "panadería", "cesta"], "Mae Mu", "assorted-breads-in-basket-Emhz3miT6mo"),
	photo("dining-room-classic", ["restaurant"], "Dining room with set tables and warm light", "Sala de restaurante con las mesas puestas y luz cálida", ["restaurant", "dining room", "interior", "tables", "restaurante", "sala", "comedor", "mesas"], "Glenov Brankovic", "a-room-with-tables-and-chairs-e4B5AvA7Jqo"),
	photo("dining-room-lake", ["restaurant", "hotel"], "Restaurant terrace on the water at sunset", "Terraza de restaurante sobre el agua al atardecer", ["restaurant", "terrace", "lake", "view", "restaurante", "terraza", "lago", "vistas"], "Albert", "a-restaurant-with-a-view-of-the-water-YYZU0Lo1uXE"),
	photo("table-set", ["restaurant"], "Table set with wine glasses and napkins", "Mesa puesta con copas de vino y servilletas", ["table", "glasses", "setting", "restaurant", "mesa", "copas", "restaurante"], "CJ Toscano", "a-wooden-table-topped-with-glasses-of-wine-bWccSy5Ivcc"),
	photo("dinner-candles", ["restaurant", "hotel"], "Table set for dinner with candles and a checked tablecloth", "Mesa preparada para cenar con velas y mantel de cuadros", ["dinner", "candles", "table", "event", "celebration", "cena", "velas", "mesa", "evento", "celebración"], "Libby Penner", "white-candles-on-round-table-4CnaFQRDI0A"),
	photo("dinner-long-table", ["restaurant", "hotel"], "Long table set for a group dinner by candlelight", "Mesa larga preparada para una cena de grupo a la luz de las velas", ["dinner", "group", "event", "private", "candles", "cena", "grupo", "evento", "privado", "velas"], "Nadia Valko", "dining-table-set-with-candles-0hAdietsUrE"),
	photo("wine-glasses", ["restaurant"], "Wine glasses lined up on a bar", "Copas de vino alineadas en una barra", ["wine", "glasses", "bar", "tasting", "vino", "copas", "barra", "cata"], "Ambitious Studio* | Rick Barrett", "a-group-of-glasses-with-liquid-in-them-qRfjRzzily0"),
	photo("wine-barrels", ["restaurant"], "Oak barrels in a stone wine cellar", "Barricas de roble en una bodega de piedra", ["wine", "cellar", "barrels", "winery", "vino", "bodega", "barricas"], "Tamara Malaniy", "brown-wooden-barrels-on-brown-brick-wall-jyii09cghJE"),
	photo("cocktail", ["restaurant", "hotel"], "Cocktail poured over a large ice cube", "Cóctel servido sobre un gran cubo de hielo", ["cocktail", "bar", "drink", "cóctel", "bar", "copa", "bebida"], "Adam Jaime", "amber-cocktail-pouring-over-ice-dmkmrNptMpw"),
	photo("champagne", ["restaurant", "hotel"], "Tray of champagne flutes ready to serve", "Bandeja de copas de champán listas para servir", ["champagne", "celebration", "event", "toast", "cava", "champán", "celebración", "evento", "brindis"], "Bruno Ngarukiye", "champagne-flutes-filled-with-bubbly-liquid-on-tray-C3kKfLuN1mI"),
	photo("coffee-espresso", ["restaurant", "other"], "Cup of espresso seen from above", "Taza de café espresso vista desde arriba", ["coffee", "espresso", "cafe", "café", "cafetería"], "Darryn Altclass", "espresso-cup-on-black-saucer-0EB9bNEMJqA"),
	photo("beach-golden", ["hotel", "other"], "Waves on a sandy beach at sunset", "Olas en una playa de arena al atardecer", ["beach", "sea", "sunset", "summer", "playa", "mar", "atardecer", "verano"], "Sean Oulashin", "seashore-during-golden-hour-KMn4VEeEPR8"),
	photo("beach-blue", ["hotel", "other"], "White sand beach and turquoise sea", "Playa de arena blanca y mar turquesa", ["beach", "sea", "summer", "playa", "mar", "verano"], "Stephan van de Schootbrugge", "a-sandy-beach-with-blue-water-and-clouds-38d2sYcM0XM"),
	photo("coast", ["hotel", "other"], "Green coastline over a blue sea", "Costa verde sobre un mar azul", ["coast", "sea", "view", "landscape", "costa", "mar", "vistas", "paisaje"], "Salmen Bejaoui", "rock-formation-near-ocean-aCr45O_PaZY"),
	photo("mountain-lake", ["hotel", "other"], "Turquoise lake among forests and snowy peaks", "Lago turquesa entre bosques y cumbres nevadas", ["mountain", "lake", "nature", "landscape", "montaña", "lago", "naturaleza", "paisaje"], "Adam Vradenburg", "turquoise-lake-reflecting-snow-capped-mountains-GA09PKfRIQY"),
	photo("sunset-sea", ["hotel", "other"], "Sun setting over a calm sea", "Puesta de sol sobre un mar en calma", ["sunset", "sea", "evening", "atardecer", "puesta de sol", "mar"], "Sebastien Gabriel", "sea-under-white-clouds-at-golden-hour--IMlv9Jlb24"),
	photo("flowers-tulips", ["other", "hotel", "restaurant"], "Yellow tulips in a vase on a sunlit table", "Tulipanes amarillos en un jarrón sobre una mesa al sol", ["flowers", "tulips", "spring", "detail", "flores", "tulipanes", "primavera", "detalle"], "Chi Pham", "yellow-tulips-in-green-ceramic-vase-QOoZBD6nKfI"),
];

const byId = new Map(STOCK_PHOTOS.map((item) => [item.id, item]));

export function findStockPhoto(id) {
	return byId.get(id) ?? null;
}

// Where a photo loads from, an address a sent email can load too. baseUrl: the app's (getAppUrl), or the dashboard's own
// origin in the browser.
export function getStockPhotoUrl(item, baseUrl) {
	return `${String(baseUrl ?? "").replace(/\/$/, "")}/stock/${item.file}`;
}

// Its small copy, 400px wide, for the dashboard's own pages: the picker's grid and the designs' previews.
export function getStockThumbUrl(item) {
	return `/stock/thumbs/${item.file}`;
}

// A photo as the editor's image: its address, its description in the venue's language and its size in an email, which is
// 600px wide (lib/upload-image.js).
export function getStockImage(item, { baseUrl, language }) {
	const width = 600;
	return { src: getStockPhotoUrl(item, baseUrl), alt: item.alt[language] ?? "", width, height: Math.round((STOCK_PHOTO_SIZE.height * width) / STOCK_PHOTO_SIZE.width) };
}

// What a new banner or row of photos shows until its photos are swapped, the banner's first: a venue's own kind's, and
// any business's for one that hasn't said what it is.
const STARTER_PHOTOS = {
	hotel: ["pool-garden", "room-white-linen", "breakfast-terrace", "spa-treatment-room"],
	restaurant: ["dining-room-classic", "dish-plated", "pasta-plate", "wine-glasses"],
	other: ["flowers-tulips", "coffee-espresso", "beach-golden", "mountain-lake"],
};

export function getStarterPhotos(kind) {
	return (STARTER_PHOTOS[kind] ?? STARTER_PHOTOS.other).map(findStockPhoto);
}

// The photos whose name, description or tags have every word of the search, a venue's own kind first. Without a search,
// all of them.
export function searchStockPhotos(query, kind = null) {
	const words = String(query ?? "").toLowerCase().split(/\s+/).filter(Boolean);
	const found = STOCK_PHOTOS.filter((item) => {
		const text = `${item.id} ${item.alt.en} ${item.alt.es} ${item.tags.join(" ")}`.toLowerCase();
		return words.every((word) => text.includes(word));
	});
	return kind ? [...found.filter(({ kinds }) => kinds.includes(kind)), ...found.filter(({ kinds }) => !kinds.includes(kind))] : found;
}

// guestmail: see lib/i18n/es/index.js. The text the dashboard builds while it runs, which no file has whole: dates,
// counts, "3 days ago". Every one is a pattern declared here, never a regular expression somewhere else.
//
// Dates stay as the server wrote them but for their words and their order: "Oct 7, 2026" is "7 oct 2026". Hours keep
// upstream's 12-hour clock ("4:00 PM"): turning them into 16:00 would take arithmetic a pattern doesn't do.
const MONTHS_SHORT = { Jan: "ene", Feb: "feb", Mar: "mar", Apr: "abr", May: "may", Jun: "jun", Jul: "jul", Aug: "ago", Sep: "sep", Oct: "oct", Nov: "nov", Dec: "dic" };
const MONTHS_LONG = {
	January: "enero",
	February: "febrero",
	March: "marzo",
	April: "abril",
	June: "junio",
	July: "julio",
	August: "agosto",
	September: "septiembre",
	October: "octubre",
	November: "noviembre",
	December: "diciembre",
};

// Upstream writes numbers the American way. "1,204" is "1.204" and "41.8" is "41,8"; anything else that has digits
// (a year, a time, a version with two dots) stays as it is.
export function formatNumber(number) {
	if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(number)) return number.replace(/[.,]/g, (separator) => (separator === "," ? "." : ","));
	if (/^\d+\.\d+$/.test(number)) return number.replace(".", ",");
	return number;
}

export const lists = {
	month: { ...MONTHS_SHORT, ...MONTHS_LONG },
	weekday: {
		Mon: "lun",
		Tue: "mar",
		Wed: "mié",
		Thu: "jue",
		Fri: "vie",
		Sat: "sáb",
		Sun: "dom",
		Monday: "lunes",
		Tuesday: "martes",
		Wednesday: "miércoles",
		Thursday: "jueves",
		Friday: "viernes",
		Saturday: "sábado",
		Sunday: "domingo",
	},
	ampm: { AM: "AM", PM: "PM" },
	// lib/plans.js: names, so they stay.
	plan: { Starter: "Starter", Growth: "Growth", Pro: "Pro", Scale: "Scale", Max: "Max", Ultra: "Ultra" },
	// What a plan is billed by (components/CardSubscription.jsx).
	interval: { month: "mes", quarter: "trimestre", year: "año" },
};

// A date as lib/format.js writes one: "Oct 7", "Oct 7, 2026", "Wed, Oct 7, 4:00 PM". Patterns name it {date}, so that
// "{date} to {date}" can't take "Reply to it" for two dates.
const MONTH = "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*";
export const shapes = {
	date: `(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,? )?${MONTH} \\d{1,2}(?:, \\d{4})?(?:,? \\d{1,2}:\\d{2} [AP]M)?`,
};

export const patterns = {
	// Every page's tab: "Campaigns · GuestMail". A page named after a campaign or a contact keeps its name.
	"{e} · GuestMail": "{e} · GuestMail",

	// lib/format.js and the pages' own dates.
	"{month} {n}": "{n} {month}",
	"{month} {n1}, {n2}": "{n1} {month} {n2}",
	"{month} {n1}, {n2}:{n3} {ampm}": "{n1} {month}, {n2}:{n3} {ampm}",
	"{month} {n1}, {n2}, {n3}:{n4} {ampm}": "{n1} {month} {n2}, {n3}:{n4} {ampm}",
	"{weekday}, {month} {n1}, {n2}:{n3} {ampm}": "{weekday}, {n1} {month}, {n2}:{n3} {ampm}",
	"{weekday}, {month} {n1}": "{weekday}, {n1} {month}",
	"{weekday}, {month} {n1}, {n2}": "{weekday}, {n1} de {month} de {n2}",
	"{weekday} {n} {ampm}": "{weekday} {n} {ampm}",
	"{weekday} {n1}:{n2} {ampm}": "{weekday} {n1}:{n2} {ampm}",
	"{month} {n1} – {month} {n2}": "{n1} {month} – {n2} {month}",
	"{month} {n1} – {month} {n2}, {n3}": "{n1} {month} – {n2} {month} {n3}",
	"{month} {n1}, {n2} – {month} {n3}, {n4}": "{n1} {month} {n2} – {n3} {month} {n4}",
	"just now": "ahora mismo",
	now: "ahora",
	"{n}m": "{n} min",
	"{n}h": "{n} h",
	"{n}d": "{n} d",
	"{n} minute ago": "hace {n} minuto",
	"{n} minutes ago": "hace {n} minutos",
	"{n} hour ago": "hace {n} hora",
	"{n} hours ago": "hace {n} horas",
	"{n} day ago": "hace {n} día",
	"{n} days ago": "hace {n} días",
	"{n} month ago": "hace {n} mes",
	"{n} months ago": "hace {n} meses",
	"{n} year ago": "hace {n} año",
	"{n} years ago": "hace {n} años",

	// A label and the punctuation its component adds: "{title}." and "{label}:".
	"{t}.": "{t}.",
	"{t}:": "{t}:",

	// Words the code puts inside a sentence: a span of time, a unit, a rate limit's window, the kind of venue.
	"{n} hour": "{n} hora",
	"{n} hours": "{n} horas",
	"{n} day": "{n} día",
	"{n} days": "{n} días",
	"{n} week": "{n} semana",
	"{n} weeks": "{n} semanas",
	"{n} month": "{n} mes",
	"{n} months": "{n} meses",
	hour: "hora",
	day: "día",
	week: "semana",
	month: "mes",
	"a minute": "por minuto",
	"an hour": "por hora",
	"a day": "al día",
	restaurant: "restaurante",
	business: "negocio",
	guests: "huéspedes",
	customers: "clientes",
	menu: "tu carta",
	services: "tus servicios",
	"{n} minute": "{n} minuto",
	"{n} minutes": "{n} minutos",
	"{n} h": "{n} h",
	"about {n} hour": "alrededor de {n} hora",
	"about {n} hours": "unas {n} horas",
	"about {n} day": "alrededor de {n} día",
	"about {n} days": "unos {n} días",
	"in {n} minutes": "en {n} minutos",
	"in {n} hour": "en {n} hora",
	"in {n} hours": "en {n} horas",
	"in about {n} minutes": "en unos {n} minutos",
	"in about {n} hour": "en {n} hora más o menos",
	"in about {n} hours": "en unas {n} horas",
	"in about {n} day": "en {n} día más o menos",
	"in about {n} days": "en unos {n} días",
	"in the last {n} days": "en los últimos {n} días",
	"in the last {n} hours": "en las últimas {n} horas",
	"in the last {n} months": "en los últimos {n} meses",
	"from {date} to {date}": "del {date} al {date}",
	tomorrow: "mañana",
	today: "hoy",

	// lib/segments.js counts with its own plural: "3 issues", "2 nights".
	"{n} issue": "{n} campaña",
	"{n} issues": "{n} campañas",
	"{n} email": "{n} correo",
	"{n} emails": "{n} correos",
	"{n} visit": "{n} visita",
	"{n} visits": "{n} visitas",
	"{n} night": "{n} noche",
	"{n} nights": "{n} noches",

	// app/(app)/contacts/[id]/page.js adds where to "Signed up again".
	"Signed up again on your website": "Se apuntó otra vez en tu web",
	"Signed up again with the form on your site": "Se apuntó otra vez con el formulario de tu web",

	// components/BadgeStatus.jsx writes a status from its key: "past_due" is "Past due". One word for each wherever it
	// shows, so they read as a state, not as a count: "Enviado", not "Enviados".
	Active: "Activo",
	Dormant: "Inactivo",
	Pending: "Pendiente",
	Complained: "Queja",
	Draft: "Borrador",
	Sending: "Enviando",
	Queued: "En cola",
	Failed: "Fallido",
	Verified: "Verificado",
	Healthy: "Bien",
	Success: "Correcto",
	Trialing: "En prueba",
	"Past due": "Pago atrasado",
	Incomplete: "Incompleto",
	Unpaid: "Sin pagar",
	Canceled: "Cancelado",
	"Temporary failure": "Fallo temporal",
	Probation: "En observación",
	Shutdown: "Cerrado",
	Deleting: "Eliminando",
	// components/DialogImportContacts.jsx: a status and how many contacts have it, "Subscribed 120".
	"{t} {n}": "{t} {n}",

	// components/CalendarMonth.jsx heads each column with a weekday's first two letters.
	Su: "do",
	Mo: "lu",
	Tu: "ma",
	We: "mi",
	Th: "ju",
	Fr: "vi",
	Sa: "sá",

	// A status as the code names it, inside a sentence: "ana@example.com added as subscribed", "This campaign is sent".
	// A contact's are masculine and a campaign's feminine, and the two never share a word.
	subscribed: "suscrito",
	pending: "pendiente",
	dormant: "inactivo",
	unsubscribed: "dado de baja",
	bounced: "rebotado",
	complained: "con queja",
	active: "activo",
	draft: "en borrador",
	scheduled: "programada",
	sending: "enviándose",
	paused: "en pausa",
	sent: "enviada",

	// lib/actions/errors.js: what any action answers when it fails for no reason it can name.
	"Something went wrong, try again in a minute": "Algo ha fallado, inténtalo en un minuto",

	// Upstream joins what it has to say with a middle dot: "readers.csv into Weekly notes · 3 already there". Last, so a
	// sentence with a dot of its own that the dictionary has whole is found first. Each part has to be one it translates.
	"{t} · {t}": "{t} · {t}",
};

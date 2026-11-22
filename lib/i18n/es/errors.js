// guestmail: see lib/i18n/es/index.js.
const entries = {
	// lib/actions/agent.js
	"The content agent isn't available on this server yet": "El agente de contenido todavía no está disponible en este servidor",
	"No idea has this ID": "Ninguna idea tiene este identificador",
	"This idea was already decided": "Esta idea ya se decidió",
	"The agent found nothing about this venue on the web: write the brief yourself": "El agente no encontró nada sobre este negocio en internet: escribe tú el resumen",
	"The agent couldn't write the brief right now. Try again in a minute": "El agente no pudo escribir el resumen ahora. Inténtalo en un minuto",
	// lib/actions/api-keys.js
	"An account has up to {n} active API keys. Revoke one to create another.": "Una cuenta puede tener hasta {n} claves de API activas. Revoca una para crear otra.",
	"Key not found": "No se encontró la clave",
	// lib/actions/authors.js
	"Author not found": "No se encontró el autor",
	"A newsletter has {n} authors at most": "Un boletín tiene {n} autores como máximo",
	"A campaign by this author is scheduled or in review: give it another author, or wait until it's out": "Hay una campaña de este autor programada o en revisión: ponle otro autor, o espera a que salga",
	// lib/actions/automations.js
	"Automatic emails are for hotels for now": "Los correos automáticos son para hoteles por ahora",
	"Fill in {x} in the email first, then turn it on": "Rellena antes {x} en el correo y después actívalo",
	// lib/actions/billing.js
	"Billing is off on this server: every account has every feature, without plan limits": "La facturación está desactivada en este servidor: todas las cuentas tienen todas las funciones, sin límites de plan",
	"Billing isn't set up on this server": "La facturación no está configurada en este servidor",
	"Pick a plan first: the account has no billing details yet": "Elige antes un plan: la cuenta todavía no tiene datos de facturación",
	// lib/actions/campaigns.js
	"Campaign not found": "No se encontró la campaña",
	"Only the newsletter's admins can change a campaign once it's scheduled or sent": "Solo los administradores del boletín pueden cambiar una campaña cuando ya está programada o enviada",
	"Segment not found": "No se encontró el segmento",
	"A sent issue needs a URL": "Una campaña enviada necesita una URL",
	"Use lowercase letters, digits and hyphens": "Usa minúsculas, números y guiones",
	"Another issue uses this URL": "Otra campaña usa esta URL",
	"This campaign isn't on the website": "Esta campaña no está en la web",
	"Someone joined this newsletter's team: reload the page to keep writing with them": "Alguien se ha unido al equipo de este boletín: recarga la página para seguir escribiendo con esa persona",
	"This campaign is already sending": "Esta campaña ya se está enviando",
	"Contact not found": "No se encontró el contacto",
	"Couldn't schedule it: {x}": "No se pudo programar: {x}",
	"It isn't scheduled anymore": "Ya no está programada",
	"A web-only issue doesn't go out by email": "Una campaña solo de web no sale por correo",
	"Wait until the current step has gone out": "Espera a que haya salido el paso actual",
	"Only sent campaigns can go to more contacts": "Solo las campañas enviadas pueden ir a más contactos",
	"Only a campaign that is sending can pause": "Solo se puede pausar una campaña que se está enviando",
	"Only paused campaigns can resume": "Solo se pueden reanudar las campañas en pausa",
	"Not listed on the archive": "No aparece en el archivo",
	// lib/actions/connector.js
	"Confirm that your guests were told about your emails and can unsubscribe": "Confirma que a tus huéspedes se les informó de tus correos y que pueden darse de baja",
	// lib/actions/contacts.js
	"Check that this person agreed to get your emails": "Comprueba que esta persona aceptó recibir tus correos",
	"email is invalid": "El correo no es válido",
	"tags: each is 40 characters at most, without commas, and listed once": "Etiquetas: cada una tiene 40 caracteres como máximo, sin comas, y va una sola vez",
	"Field not found": "No se encontró el campo",
	"The \"{q}\" segment uses this field: change it first": "El segmento \"{q}\" usa este campo: cámbialo antes",
	"Confirm that these people agreed to receive your emails": "Confirma que estas personas aceptaron recibir tus correos",
	// lib/actions/newsletters.js
	"You can change slugs {n} times {t}. Try again later.": "Puedes cambiar el identificador {n} veces {t}. Inténtalo más tarde.",
	"Only the account's owner can change the newsletter's notifications": "Solo el propietario de la cuenta puede cambiar las notificaciones del boletín",
	// lib/actions/notifications.js
	"This server can't send GuestMail's own emails": "Este servidor no puede enviar los correos propios de GuestMail",
	"The account has no owner to email": "La cuenta no tiene un propietario al que escribir",
	// lib/actions/pilot.js
	"Nothing could be read from it: try another address, or upload the PDF": "No se pudo leer nada: prueba con otra dirección, o sube el PDF",
	"The menu couldn't be read right now. Try again in a minute": "Ahora mismo no se pudo leer la carta. Inténtalo en un minuto",
	// lib/actions/reputation.js
	"Google Maps has no review with text for this place yet": "Google Maps todavía no tiene reseñas con texto de este sitio",
	// lib/actions/segments.js
	"A newsletter has {n} segments at most": "Un boletín tiene {n} segmentos como máximo",
	"A scheduled or sending campaign goes to this segment: change who it goes to first": "Hay una campaña programada o enviándose a este segmento: cambia antes a quién va",
	"A scheduled or sending campaign has a section for this segment: change who sees it first": "Hay una campaña programada o enviándose con una sección para este segmento: cambia antes quién la ve",
	// lib/actions/shared.js
	"Create a newsletter first": "Crea antes un boletín",
	// lib/actions/team.js
	"Team member not found": "No se encontró a esa persona del equipo",
	// lib/actions/uploads.js
	"Images must be under 4 MB": "Las imágenes tienen que pesar menos de 4 MB",
	"This file isn't a valid image": "Este archivo no es una imagen válida",
	// lib/team.js
	"{x} is already on this newsletter's team: change their role instead": "{x} ya está en el equipo de este boletín: cambia su rol",
	"{x} is already invited": "{x} ya tiene una invitación",
	// lib/test-recipients.js
	"{x} got enough test emails today. Try again tomorrow.": "{x} ya ha recibido bastantes correos de prueba hoy. Inténtalo mañana.",
	// lib/actions/campaigns.js: the status is one of lib/i18n/es/patterns.js
	"This campaign is {t}": "Esta campaña está {t}",
	// guestmail: lib/actions/automations.js
	"Automation not found": "No se encuentra la automatización",
	"trigger.campaign isn't one of the newsletter's campaigns": "trigger.campaign no es una de las campañas del boletín",
	"Bookings start automations for hotels and restaurants, through the booking connector": "Las reservas inician automatizaciones en hoteles y restaurantes, con el conector de reservas",
	"Step \"{q}\": its segment isn't one of the newsletter's": "Paso \"{q}\": su segmento no es uno de los del boletín",
	"Turn the automation on first": "Activa primero la automatización",
	"Add an email first": "Añade primero un correo",
	"The campaign that starts it was deleted: pick another": "Se eliminó la campaña que la inicia: elige otra",
	"Fill in {x} in \"{q}\" first": "Rellena primero {x} en \"{q}\"",
	"\"{q}\" is under review: a person checks it before it goes out": "\"{q}\" está en revisión: una persona lo comprueba antes de que salga",
	"\"{q}\": {t}": "\"{q}\": {t}",
	"They were on it already: each person goes along an automation once": "Ya estaba en ella: cada persona recorre una automatización una sola vez",
	"They're {t}: only active contacts get automations": "Está {t}: solo los contactos activos reciben automatizaciones",
};

export default entries;

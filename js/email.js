// ==============================
// TICKETONE — EmailJS Integration
// ==============================

const EMAILJS_SERVICE_ID  = 'service_uiug5ka';
const EMAILJS_TEMPLATE_ID = 'template_a3yctcf';

// .trim() strips any invisible whitespace/newline accidentally copied
// along with the key — a very common copy-paste issue.
const EMAILJS_PUBLIC_KEY  = 'FNCEXVM2aEdcN1h42'.trim();

let _emailjsReady = false;

/** Lazy-init EmailJS — called right before every send */
function _ensureEmailJS() {
  if (typeof emailjs === 'undefined') {
    throw new Error('La librería EmailJS no se ha cargado. Comprueba la conexión a internet o que el script no esté bloqueado por un adblocker.');
  }

  // Diagnostic: print key length/preview so hidden characters (stray
  // newlines, spaces) from a copy-paste are easy to spot in DevTools.
  if (!_emailjsReady) {
    console.log(
      `[TicketOne] EmailJS public key: "${EMAILJS_PUBLIC_KEY.slice(0, 4)}...${EMAILJS_PUBLIC_KEY.slice(-4)}" ` +
      `(${EMAILJS_PUBLIC_KEY.length} caracteres)`
    );
  }

  if (!EMAILJS_PUBLIC_KEY) {
    throw new Error('La Public Key de EmailJS está vacía en js/email.js.');
  }

  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  _emailjsReady = true;
}

/** Local date helpers (self-contained so email.js has no deps on utils.js load order) */
function _fmtDate(d) {
  if (!d) return '';
  const [y,m,day] = d.split('-');
  const meses = ['enero','febrero','marzo','abril','mayo','junio',
                 'julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${parseInt(day)} de ${meses[parseInt(m)-1]} de ${y}`;
}
function _fmtTime(t) { return t ? t.substring(0,5)+'h' : ''; }

/**
 * Send ticket confirmation email via EmailJS.
 * Template variables sent:
 *   {{to_name}}, {{to_email}}, {{event_name}}, {{event_date}},
 *   {{event_time}}, {{event_location}}, {{ticket_id}},
 *   {{qr_image_url}}, {{ticket_url}}
 */
async function sendTicketEmail(ticket, event) {
  _ensureEmailJS();

  const origin    = window.location.origin;
  const ticketUrl = `${origin}/mis-entradas?email=${encodeURIComponent(ticket.email)}`;
  // External QR service — works reliably without Firebase Storage
  const qrUrl     = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(ticket.ticketId)}&color=1A6EF7&bgcolor=03061A`;

  const params = {
    to_name:        ticket.name        || '',
    to_email:       ticket.email       || '',
    event_name:     event.title        || ticket.eventName || '',
    event_date:     _fmtDate(event.date || ticket.eventDate || ''),
    event_time:     _fmtTime(event.time || ticket.eventTime || ''),
    event_location: event.location     || ticket.eventLocation || '',
    ticket_id:      ticket.ticketId    || '',
    qr_image_url:   qrUrl,
    ticket_url:     ticketUrl
  };

  try {
    // The publicKey is passed explicitly here as well (4th param), so the
    // request carries it even if a particular SDK build mishandles the
    // global init() call — this removes that entire class of bugs.
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      params,
      { publicKey: EMAILJS_PUBLIC_KEY }
    );
    console.log('EmailJS OK:', result.status, result.text);
    return result;
  } catch (err) {
    console.error('EmailJS error (raw):', err);
    throw new Error(
      typeof err === 'object'
        ? (err.text || err.message || JSON.stringify(err))
        : String(err)
    );
  }
}

/**
 * Resend ticket email — called from admin panel.
 */
async function resendTicketEmail(ticket) {
  _ensureEmailJS();

  let event = {
    title:    ticket.eventName     || '',
    date:     ticket.eventDate     || '',
    time:     ticket.eventTime     || '',
    location: ticket.eventLocation || ''
  };

  // Try to get fresh event data if db is available
  try {
    if (typeof db !== 'undefined' && ticket.eventId) {
      const snap = await db.collection('events').doc(ticket.eventId).get();
      if (snap.exists) event = snap.data();
    }
  } catch (_) { /* use fallback */ }

  return sendTicketEmail(ticket, event);
}

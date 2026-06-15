// ==============================
// TICKETONE — EmailJS Integration
// ==============================

const EMAILJS_SERVICE_ID  = 'service_uiug5ka';
const EMAILJS_TEMPLATE_ID = 'template_a3yctcf';
const EMAILJS_PUBLIC_KEY  = '3knvNMS4hnVW1wQm_1tFM';

// Initialize EmailJS
(function () {
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }
})();

/**
 * Send ticket confirmation email via EmailJS.
 * Template variables expected in EmailJS template:
 *   {{to_name}}, {{to_email}}, {{event_name}}, {{event_date}},
 *   {{event_time}}, {{event_location}}, {{ticket_id}}, {{qr_image_url}}, {{ticket_url}}
 */
async function sendTicketEmail(ticket, event) {
  if (typeof emailjs === 'undefined') {
    console.warn('EmailJS not loaded');
    return;
  }

  const ticketUrl = `${window.location.origin}/mis-entradas?email=${encodeURIComponent(ticket.email)}`;
  const qrImageUrl = getQrUrl(ticket.ticketId, 250);

  const params = {
    to_name:        ticket.name,
    to_email:       ticket.email,
    event_name:     event.title,
    event_date:     formatDate(event.date),
    event_time:     formatTime(event.time),
    event_location: event.location,
    ticket_id:      ticket.ticketId,
    qr_image_url:   qrImageUrl,
    ticket_url:     ticketUrl
  };

  return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
}

/**
 * Resend ticket email (same function, called from admin panel).
 */
async function resendTicketEmail(ticket) {
  if (typeof emailjs === 'undefined') {
    throw new Error('EmailJS no disponible');
  }

  // Fetch fresh event data
  const eventSnap = await db.collection('events').doc(ticket.eventId).get();
  const event = eventSnap.exists ? eventSnap.data() : {
    title: ticket.eventName,
    date:  ticket.eventDate  || '',
    time:  ticket.eventTime  || '',
    location: ticket.eventLocation || ''
  };

  return sendTicketEmail(ticket, event);
}

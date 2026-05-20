import { CONTACT, WHATSAPP_MESSAGES, getWhatsAppUrl } from '@data/config';

/**
 * Opens WhatsApp with a predefined message.
 */
export function openWhatsApp(messageKey = 'general') {
  const message = WHATSAPP_MESSAGES[messageKey] || WHATSAPP_MESSAGES.general;
  window.open(getWhatsAppUrl(message), '_blank');
}

/**
 * Opens WhatsApp with a custom message.
 */
export function openWhatsAppCustom(message) {
  window.open(getWhatsAppUrl(message), '_blank');
}

/**
 * Opens phone dialer.
 */
export function callPhone() {
  window.open(`tel:${CONTACT.phone}`);
}

/**
 * Opens mailto with subject and body.
 */
export function sendEmail(subject, body) {
  const mailto = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailto, '_blank');
}

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

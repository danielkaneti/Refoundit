// ============================================================
// SITE CONFIGURATION
// Update these values to customize the site
// ============================================================

export const COMPANY = {
  name: 'REFOUNDIT',
  tagline: 'הדרך המהירה והפשוטה לקבלת החזרי מס',
  description: 'בדיקת זכאות חינמית, ללא סיכון',
};

export const CONTACT = {
  whatsappNumber: '972554671450',
  whatsappDisplay: '055-467-1450',
  phone: '0554671450',
  phoneDisplay: '055-467-1450',
};

export const WHATSAPP_MESSAGES = {
  general: 'היי, אשמח לקבל פרטים על החזרי מס',
  eligible: 'היי, עשיתי בדיקת זכאות באתר ויש לי סיכוי להחזר. אשמח לפרטים נוספים!',
  inquiry: 'היי, אשמח לברר זכאות להחזרי מס',
  contact: 'היי, אשמח לפרטים נוספים',
};

export const getWhatsAppUrl = (message = WHATSAPP_MESSAGES.general) =>
  `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;

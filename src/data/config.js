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
  whatsappNumber: '972509936301',
  whatsappDisplay: '050-993-6301',
  email: 'info@refoundit.co.il',
  phone: '0509936301',
  phoneDisplay: '050-993-6301',
};

export const WHATSAPP_MESSAGES = {
  general: 'היי, אשמח לקבל פרטים על החזרי מס',
  eligible: 'היי, עשיתי בדיקת זכאות באתר ויש לי סיכוי להחזר. אשמח לפרטים נוספים!',
  inquiry: 'היי, אשמח לברר זכאות להחזרי מס',
  contact: 'היי, אשמח לפרטים נוספים',
};

export const getWhatsAppUrl = (message = WHATSAPP_MESSAGES.general) =>
  `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;

export const getMailtoUrl = (subject, body) =>
  `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

/**
 * Validates the contact form fields.
 * Returns an object of errors — empty if valid.
 */
export function validateContactForm({ firstName, lastName, phone }) {
  const errors = {};

  if (!firstName.trim()) {
    errors.firstName = 'שדה חובה';
  }

  if (!lastName.trim()) {
    errors.lastName = 'שדה חובה';
  }

  if (!phone.trim()) {
    errors.phone = 'שדה חובה';
  } else if (!/^0\d{8,9}$/.test(phone.replace(/[-\s]/g, ''))) {
    errors.phone = 'מספר טלפון לא תקין';
  }

  return errors;
}

/**
 * Validates a single email address.
 */
export function validateEmail(email) {
  if (!email) return true; // optional field
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

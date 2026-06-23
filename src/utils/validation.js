/**
 * Validates the contact form fields.
 * Returns an object of errors — empty if valid.
 */
export function validateContactForm({ firstName, lastName }) {
  const errors = {};

  if (!firstName.trim()) {
    errors.firstName = 'שדה חובה';
  }

  if (!lastName.trim()) {
    errors.lastName = 'שדה חובה';
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

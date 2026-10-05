// ============================================================
// Shared PDF geometry — used by the browser (admin fill) and by
// Cloudflare Functions (signature embedding).
//
// Field coordinates are normalized 0..1 relative to the page's
// visible area (crop box), with a TOP-LEFT origin — the same frame
// pdf.js renders in. pdf-lib uses a BOTTOM-LEFT origin in points.
// ============================================================

export const FIELD_TYPES = {
  /** Client detail / fixed text, filled when the document is prepared */
  text: 'text',
  /** Where the client signs */
  signature: 'signature',
  /** The representative's stored signature, stamped when prepared */
  ownerSignature: 'ownerSignature',
  /** Date — stamped when prepared or when the client signs (see DATE_WHEN) */
  date: 'date',
  /** A V / X mark, stamped when prepared */
  check: 'check',
};

export const DATE_WHEN = {
  prepare: 'prepare',
  sign: 'sign',
};

export const CHECK_MARKS = {
  v: 'v',
  x: 'x',
};

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/** Convert a normalized field to a pdf-lib rectangle (points, bottom-left origin). */
export function fieldToPdfRect(page, field) {
  const box = page.getCropBox();
  return {
    x: box.x + field.x * box.width,
    y: box.y + box.height - (field.y + field.h) * box.height,
    width: field.w * box.width,
    height: field.h * box.height,
  };
}

/** Rotated pages are not supported — field positions would not line up. */
export const isPageRotated = (page) => page.getRotation().angle % 360 !== 0;

/** Israeli short date, e.g. 4.10.2026 (digits only — safe for standard PDF fonts). */
export function formatDateIL(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jerusalem',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).formatToParts(date);
  const get = (type) => Number(parts.find((part) => part.type === type)?.value);
  return `${get('day')}.${get('month')}.${get('year')}`;
}

export const isSignDateField = (field) =>
  field.type === FIELD_TYPES.date && field.when === DATE_WHEN.sign;

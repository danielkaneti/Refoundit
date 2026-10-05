import { CHECK_MARKS, DATE_WHEN, FIELD_TYPES, clamp } from '../shared/pdfGeometry';

export const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export const MAX_PDF_BYTES = 10 * 1024 * 1024;
export const MAX_FIELDS = 50;

const PNG_DATA_URL_PREFIX = 'data:image/png;base64,';
const MAX_SIGNATURE_CHARS = 700_000;
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export function sanitizeText(value, maxLength = 200) {
  if (typeof value !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, maxLength);
}

export const isPdfBytes = (bytes) =>
  bytes.length > 5 && String.fromCharCode(...bytes.subarray(0, 5)) === '%PDF-';

export async function readPdfUpload(file) {
  if (!file || typeof file.arrayBuffer !== 'function') return { error: 'לא צורף קובץ' };
  if (file.size > MAX_PDF_BYTES) return { error: 'הקובץ גדול מ-10MB' };
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!isPdfBytes(bytes)) return { error: 'הקובץ אינו PDF תקין' };
  return { bytes };
}

const isUnit = (n) => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 1;
const EPSILON = 0.0001;

/**
 * Validate a field layout coming from the admin UI.
 * Returns the sanitized array, or null if anything is malformed.
 */
export function parseFields(raw, pageCount, { allowedTypes = Object.values(FIELD_TYPES) } = {}) {
  if (!Array.isArray(raw) || raw.length > MAX_FIELDS) return null;

  const fields = [];
  for (const field of raw) {
    if (!field || !allowedTypes.includes(field.type)) return null;
    if (!Number.isInteger(field.page) || field.page < 0 || field.page >= pageCount) return null;

    const { x, y, w, h } = field;
    if (![x, y, w, h].every(isUnit)) return null;
    if (x + w > 1 + EPSILON || y + h > 1 + EPSILON || w < 0.01 || h < 0.005) return null;

    const label = sanitizeText(field.label, 80);
    if (field.type === FIELD_TYPES.text && !label) return null;

    const hasFont = field.type === FIELD_TYPES.text || field.type === FIELD_TYPES.date;
    fields.push({
      id: sanitizeText(field.id, 64) || crypto.randomUUID(),
      type: field.type,
      label,
      page: field.page,
      x,
      y,
      w,
      h,
      ...(hasFont && { fontSize: clamp(Number(field.fontSize) || 11, 6, 36) }),
      ...(field.type === FIELD_TYPES.text && { defaultValue: sanitizeText(field.defaultValue, 200) }),
      ...(field.type === FIELD_TYPES.date && {
        when: field.when === DATE_WHEN.sign ? DATE_WHEN.sign : DATE_WHEN.prepare,
      }),
      ...(field.type === FIELD_TYPES.check && {
        mark: field.mark === CHECK_MARKS.x ? CHECK_MARKS.x : CHECK_MARKS.v,
      }),
    });
  }
  return fields;
}

/** Optional normalized box (used by presets to locate the client's name). */
export function parseRegion(region, pageCount) {
  if (!region) return null;
  const { page, x, y, w, h } = region;
  if (!Number.isInteger(page) || page < 0 || page >= pageCount) return null;
  if (![x, y, w, h].every(isUnit) || x + w > 1 + EPSILON || y + h > 1 + EPSILON) return null;
  return { page, x, y, w, h };
}

export function decodeSignaturePng(dataUrl) {
  if (
    typeof dataUrl !== 'string' ||
    !dataUrl.startsWith(PNG_DATA_URL_PREFIX) ||
    dataUrl.length > MAX_SIGNATURE_CHARS
  ) {
    return null;
  }
  let binary;
  try {
    binary = atob(dataUrl.slice(PNG_DATA_URL_PREFIX.length));
  } catch {
    return null;
  }
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return PNG_MAGIC.every((byte, i) => bytes[i] === byte) ? bytes : null;
}

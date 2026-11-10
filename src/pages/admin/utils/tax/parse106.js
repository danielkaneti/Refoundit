// Reads a Form 106 (annual salary certificate) from a PDF's text layer.
// Pure: takes positioned text items so it runs under `node --test`.
//
// Every 106 — whatever payroll software produced it — prints each amount next to its
// official field code (158/172, 042, 045/086, 244/245 …). We group text into visual lines
// and, for each known code, take the closest amount on the same line. A code can appear
// more than once (monthly table + annual summary), so the largest amount wins.

import { isValidIsraeliId } from '../bundle/extract1301.js';

/** Form-106 field codes → calculator fields. Each entry lists the code and its spouse twin. */
export const FIELD_CODES_106 = [
  { field: 'income', codes: ['158', '172'], label: 'הכנסה ממשכורת (158/172)', required: true },
  { field: 'taxWithheld', codes: ['042'], label: 'מס שנוכה (042)', required: true },
  { field: 'pension', codes: ['045', '086'], label: 'הפקדות עובד לקצבה (045/086)' },
  { field: 'insuredIncome', codes: ['244', '245'], label: 'הכנסה מבוטחת (244/245)' },
  { field: 'lifeInsurance', codes: ['036', '081'], label: 'ביטוח חיים (036/081)' },
  { field: 'donations', codes: ['037', '237'], label: 'תרומות (037/237)' },
];

const CODE_TO_FIELD = new Map(FIELD_CODES_106.flatMap(({ field, codes }) => codes.map((code) => [code, field])));

// A code may be bare ("042") or wrapped in parentheses inside a label ("(158/172)").
// pdf.js returns RTL parentheses mirrored, so ")042(" is just as common.
const CODE_TOKEN_RE = /^[()]*(\d{3})(?:\/(\d{3}))?[()]*$/;

/** Known field-code numbers in a token, e.g. ")086/045(" → ['086', '045']. */
function codesOf(text) {
  const match = text.match(CODE_TOKEN_RE);
  return match ? [match[1], match[2]].filter((code) => code && CODE_TO_FIELD.has(code)) : [];
}
// OCR sometimes reads the thousands comma as a dot ("21.733") — accepted as thousands.
const DOT_THOUSANDS_RE = /^\d{1,3}(?:\.\d{3})+$/;
const AMOUNT_RE = /^\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?$|^\d+(?:\.\d{1,2})?$|^\d{1,3}(?:\.\d{3})+$/;
const YEAR_LABELLED_RE = /(?:שנת\s*ה?מס|לשנת|בשנת)\s*:?\s*(20\d{2})/;
const YEAR_RE = /(?<!\d)(20[1-4]\d)(?!\d)/g;
const YEAR_TOKEN_RE = /^20[1-4]\d$/;
const LINE_TOLERANCE = 0.006; // fraction of page height (text layer); OCR passes a looser one

/** Label fallback when a code is missing or misread (mainly OCR). */
const LABEL_FALLBACKS = [
  { field: 'income', re: /משכורת\s*ותשלומים/ },
  { field: 'taxWithheld', re: /ניכויי\s*מס/ },
  { field: 'pension', re: /הפקדות\s*(?:ה)?עובד.*לקצבה/ },
  { field: 'insuredIncome', re: /הכנסה\s*מבוטחת/ },
];

/** Splits pdf.js items into whitespace tokens, spreading each token across the item's width. */
function tokenize(items) {
  return items.flatMap((item, itemIndex) => {
    const parts = String(item.str ?? '').trim().split(/\s+/).filter(Boolean);
    const width = item.width ?? 0;
    return parts.map((text, i) => ({
      text: text.replace(/[₪]/g, ''),
      page: item.page ?? 0,
      itemIndex,
      order: i,
      itemRight: item.x + width,
      // pdf.js gives the left edge; approximate each token's centre inside the item.
      x: item.x + (parts.length > 1 ? (width * (i + 0.5)) / parts.length : width / 2),
      y: item.y,
    }));
  });
}

function groupLines(tokens, tolerance = LINE_TOLERANCE) {
  const sorted = [...tokens].sort((a, b) => a.page - b.page || a.y - b.y);
  const lines = [];
  for (const token of sorted) {
    const line = lines.at(-1);
    if (line && line.page === token.page && Math.abs(line.y - token.y) <= tolerance) line.tokens.push(token);
    else lines.push({ page: token.page, y: token.y, tokens: [token] });
  }
  return lines;
}

const toAmount = (text) => Number(DOT_THOUSANDS_RE.test(text) ? text.replace(/\./g, '') : text.replace(/,/g, ''));

const HEBREW_WORD_RE = /[֐-׿]{2,}/;
const CURRENCY_TOKEN_RE = /^ש['"׳״]{1,2}ח$/;
const TABLE_TOP_MARGIN = 0.035; // fraction of page height
const MAX_PLAIN_DIGITS = 7; // longer bare numbers are IDs / file numbers, not amounts

/** Every field code printed in a token, known or not — only when it looks like a code. */
function rawCodesOf(text) {
  const match = text.match(CODE_TOKEN_RE);
  if (!match) return [];
  const codes = [match[1], match[2]].filter(Boolean);
  // A bare unknown 3-digit number is far more likely an amount than a code.
  return /[()]/.test(text) || codes.every((code) => CODE_TO_FIELD.has(code)) ? codes : [];
}

const isAmountToken = (t) =>
  AMOUNT_RE.test(t.text) &&
  !YEAR_TOKEN_RE.test(t.text) &&
  (t.text.includes(',') || t.text.replace(/\..*$/, '').length <= MAX_PLAIN_DIGITS);

/** pdf.js returns RTL parentheses mirrored — ")x(" → "(x)". */
function fixMirroredParens(text) {
  const firstOpen = text.indexOf('(');
  const firstClose = text.indexOf(')');
  if (firstClose === -1 || (firstOpen !== -1 && firstOpen < firstClose)) return text;
  return text.replace(/[()]/g, (c) => (c === '(' ? ')' : '('));
}

/**
 * Every "label … [code] … amount" row on the form, in reading order:
 * [{ codes: ['045', '086'], label, value }]. Rows with no code keep the label only.
 */
function extractRows(lines) {
  const rows = [];
  for (const { tokens: lineTokens, page, y } of lines) {
    const codeTokens = lineTokens.filter((t) => rawCodesOf(t.text).length);
    const codeSet = new Set(codeTokens);
    const amounts = lineTokens.filter((t) => !codeSet.has(t) && isAmountToken(t));
    if (amounts.length !== 1) continue;

    const label = fixMirroredParens(
      lineTokens
        .filter((t) => !codeSet.has(t) && t !== amounts[0] && !CURRENCY_TOKEN_RE.test(t.text))
        // Hebrew reads right-to-left across items, in logical order within an item.
        .sort((a, b) => b.itemRight - a.itemRight || a.itemIndex - b.itemIndex || a.order - b.order)
        .map((t) => t.text)
        .join(' ')
    ).trim();
    if (!codeTokens.length && !HEBREW_WORD_RE.test(label)) continue;
    // Lines carrying an ID / withholding-file number are header rows, not amounts.
    if (/\d{8,}/.test(label)) continue;

    const codes = [...new Set(codeTokens.flatMap((t) => rawCodesOf(t.text)))].sort();
    rows.push({ codes, label, value: toAmount(amounts[0].text), page, y });
  }

  // The amounts table starts at the first row with a known field code (the salary row's
  // heading sits just above it). Anything higher up is page header — dates, IDs, OCR noise.
  const firstCoded = rows.find((row) => row.codes.some((code) => CODE_TO_FIELD.has(code)));
  const kept = firstCoded
    ? rows.filter((row) => row.page > firstCoded.page || (row.page === firstCoded.page && row.y >= firstCoded.y - TABLE_TOP_MARGIN))
    : rows;
  return kept.map(({ codes, label, value }) => ({ codes, label, value }));
}

/**
 * items: [{ str, x, y, width?, page? }] — x/y normalized 0..1, y from the top.
 * Returns { fields, rows, found, missing, taxYear, employeeId, employerName, hasText }.
 */
export function parse106Items(items = [], { lineTolerance = LINE_TOLERANCE } = {}) {
  const tokens = tokenize(items).filter((t) => t.text);
  const fullText = tokens.map((t) => t.text).join(' ');
  const hasText = /\d/.test(fullText) && tokens.length > 20;

  const lines = groupLines(tokens, lineTolerance);
  const candidates = new Map(); // field → [amount]
  for (const { tokens: lineTokens } of lines) {
    const codes = lineTokens.filter((t) => codesOf(t.text).length);
    if (!codes.length) continue;

    const codeSet = new Set(codes);
    const amounts = lineTokens.filter((t) => !codeSet.has(t) && AMOUNT_RE.test(t.text) && !YEAR_TOKEN_RE.test(t.text));

    for (const codeToken of codes) {
      const field = CODE_TO_FIELD.get(codesOf(codeToken.text)[0]);
      // Hebrew rows read right-to-left: label, code, then the amount to its left. Prefer that side.
      const nearest = amounts
        .map((a) => ({ a, distance: Math.abs(a.x - codeToken.x) + (a.x > codeToken.x ? 0.05 : 0) }))
        .sort((p, q) => p.distance - q.distance)[0];
      if (!nearest) continue;
      const value = toAmount(nearest.a.text);
      if (Number.isFinite(value)) candidates.set(field, [...(candidates.get(field) ?? []), value]);
    }
  }

  const fields = {};
  for (const [field, values] of candidates) fields[field] = Math.max(...values);

  const rows = extractRows(lines);
  for (const { field, re } of LABEL_FALLBACKS) {
    if (field in fields) continue;
    const match = rows.filter((row) => re.test(row.label)).map((row) => row.value);
    if (match.length) fields[field] = Math.max(...match);
  }

  const found = FIELD_CODES_106.filter(({ field }) => field in fields).map(({ field }) => field);
  const missing = FIELD_CODES_106.filter(({ field, required }) => required && !(field in fields)).map(
    ({ label }) => label
  );

  return {
    fields,
    rows,
    found,
    missing,
    taxYear: detectTaxYear(fullText),
    employeeId: detectEmployeeId(fullText),
    employerName: detectEmployerName(items),
    hasText,
  };
}

export function detectTaxYear(text, now = new Date()) {
  const labelled = text.match(YEAR_LABELLED_RE)?.[1];
  if (labelled) return Number(labelled);
  const counts = new Map();
  for (const [, y] of text.matchAll(YEAR_RE)) {
    const year = Number(y);
    if (year < now.getFullYear()) counts.set(year, (counts.get(year) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0]?.[0] ?? null;
}

/** First valid Israeli ID that isn't an employer withholding file (those start with 9). */
export function detectEmployeeId(text) {
  for (const [, id] of text.matchAll(/(?<!\d)(\d{9})(?!\d)/g)) {
    if (!id.startsWith('9') && isValidIsraeliId(id)) return id;
  }
  return null;
}

const EMPLOYER_LABEL_RE = /^\s*שם\s+ה?מעביד\s*:?\s*$|^\s*שם\s+המעסיק\s*:?\s*$/;

/** Text printed under the "שם המעביד" label (up to two lines), if present. */
export function detectEmployerName(items = []) {
  const label = items.find((item) => EMPLOYER_LABEL_RE.test(String(item.str ?? '')));
  if (!label) return null;
  const labelRight = label.x + (label.width ?? 0);
  const below = items
    .filter(
      (item) =>
        item !== label &&
        (item.page ?? 0) === (label.page ?? 0) &&
        item.y > label.y + 0.005 &&
        item.y < label.y + 0.055 &&
        // Same column: overlaps the label horizontally (RTL — aligned on the right edge).
        item.x + (item.width ?? 0) > label.x - 0.1 &&
        item.x < labelRight + 0.05 &&
        !/^\d+$/.test(String(item.str).trim())
    )
    .sort((a, b) => a.y - b.y || b.x - a.x);
  const name = below.map((item) => String(item.str).trim()).filter(Boolean).join(' ');
  return name || null;
}

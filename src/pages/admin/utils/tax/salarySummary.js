// "ריכוז נתוני שכר" — every field of every 106 in a tax year, side by side, with totals.
// The editable employer fields are the source of truth for the mapped codes; any other
// row read from an imported PDF (248/249, שכר חייב בדמי ביטוח …) is shown as printed.

import { parseAmount } from './taxEngine.js';

const EMPLOYER_ROWS = [
  { key: 'income', codes: ['158', '172'], label: 'משכורת ותשלומים' },
  { key: 'taxWithheld', codes: ['042'], label: 'מס הכנסה שנוכה' },
  { key: 'pension', codes: ['045', '086'], label: 'הפקדות עובד לקופת גמל לקצבה' },
  { key: 'insuredIncome', codes: ['244', '245'], label: 'הכנסה מבוטחת' },
];

const MAPPED_CODES = new Set(EMPLOYER_ROWS.flatMap((row) => row.codes));
// Section headings that repeat the 158/172 total on Tax Authority printouts.
const DUPLICATE_LABELS = new Set(['משכורת ותשלומים']);

const valueOf = (raw) => (String(raw ?? '').trim() === '' ? null : parseAmount(raw).value);

/**
 * yearInput: calculator year state ({ employers: [{ id, name, income, …, rawRows? }] }).
 * Returns { columns: [{ id, name }], rows: [{ key, code, label, values: (number|null)[], total }] }.
 */
export function buildSalarySummary(yearInput) {
  const employers = yearInput?.employers ?? [];
  const columns = employers.map((e, i) => ({ id: e.id, name: e.name?.trim() || `מעסיק ${i + 1}` }));

  const rows = EMPLOYER_ROWS.map(({ key, codes, label }) => ({
    key,
    code: codes.join('/'),
    label,
    values: employers.map((e) => valueOf(e[key])),
  }));

  const extra = new Map();
  employers.forEach((employer, column) => {
    for (const raw of employer.rawRows ?? []) {
      if (raw.codes.some((code) => MAPPED_CODES.has(code))) continue;
      if (!raw.codes.length && DUPLICATE_LABELS.has(raw.label)) continue;
      const code = raw.codes.join('/');
      const key = code || raw.label;
      if (!extra.has(key)) extra.set(key, { key, code, label: raw.label, values: employers.map(() => null) });
      const row = extra.get(key);
      row.values[column] = (row.values[column] ?? 0) + raw.value;
    }
  });

  const extraRows = [...extra.values()].sort((a, b) => {
    if (a.code && b.code) return a.code.localeCompare(b.code);
    if (a.code || b.code) return a.code ? -1 : 1;
    return 0;
  });

  return {
    columns,
    rows: [...rows, ...extraRows].map((row) => ({
      ...row,
      total: row.values.reduce((sum, v) => sum + (v ?? 0), 0),
      hasValue: row.values.some((v) => v !== null),
    })),
  };
}

import assert from 'node:assert/strict';
import test from 'node:test';
import { detectEmployeeId, detectTaxYear, parse106Items } from '../src/pages/admin/utils/tax/parse106.js';
import { buildSalarySummary } from '../src/pages/admin/utils/tax/salarySummary.js';

/** Builds a fake text layer: each row is [y, [x, str]...]. */
function layer(rows, filler = 30) {
  const items = rows.flatMap(([y, ...cells]) => cells.map(([x, str]) => ({ str, x, y, width: 0.05 })));
  // Real 106s have plenty of other text — the parser treats near-empty layers as scans.
  for (let i = 0; i < filler; i += 1) items.push({ str: `טקסט ${i}`, x: 0.5, y: 0.9 + i / 1000, width: 0.05 });
  return items;
}

const SAMPLE = layer([
  [0.05, [0.7, 'אישור על הכנסות מעבודה לשנת המס 2024']],
  [0.1, [0.8, 'מספר זהות'], [0.6, '000000018'], [0.3, 'תיק ניכויים'], [0.1, '937123456']],
  [0.3, [0.85, 'משכורת ותשלומים'], [0.6, '158/172'], [0.4, '300,000']],
  [0.33, [0.85, 'מס הכנסה שנוכה'], [0.6, '042'], [0.4, '60,000.00']],
  [0.36, [0.85, 'הפקדות עובד לקצבה'], [0.6, '045/086'], [0.4, '15,000']],
  [0.39, [0.85, 'הכנסה מבוטחת'], [0.6, '244/245'], [0.4, '280,000']],
  // Monthly table: same code, smaller values — the annual total must win.
  [0.6, [0.9, '158'], [0.7, '25,000'], [0.5, '25,000']],
]);

test('reads the annual 106 summary fields', () => {
  const r = parse106Items(SAMPLE);
  assert.equal(r.hasText, true);
  assert.deepEqual(r.fields, { income: 300000, taxWithheld: 60000, pension: 15000, insuredIncome: 280000 });
  assert.deepEqual(r.missing, []);
  assert.equal(r.taxYear, 2024);
  assert.equal(r.employeeId, '000000018');
});

test('two-column rows pair each code with its nearest amount', () => {
  const r = parse106Items(
    layer([[0.3, [0.9, '158'], [0.75, '120,000'], [0.45, '042'], [0.3, '9,500']]])
  );
  assert.equal(r.fields.income, 120000);
  assert.equal(r.fields.taxWithheld, 9500);
});

test('code and amount inside one text item', () => {
  const r = parse106Items(layer([[0.3, [0.4, '042 12,345']]]));
  assert.equal(r.fields.taxWithheld, 12345);
});

test('missing required fields are reported', () => {
  const r = parse106Items(layer([[0.3, [0.6, '045'], [0.4, '1,000']]]));
  assert.deepEqual(r.fields, { pension: 1000 });
  assert.equal(r.missing.length, 2);
});

test('a scan (no text layer) is detected', () => {
  assert.equal(parse106Items([]).hasText, false);
});

test('year tokens are not taken as amounts', () => {
  const r = parse106Items(layer([[0.3, [0.6, '042'], [0.5, '2024'], [0.2, '7,000']]]));
  assert.equal(r.fields.taxWithheld, 7000);
});

// Layout of the Tax Authority's "מידע על הכנסות לשנת המס" printout (personal area):
// codes sit inside the labels, in parentheses that pdf.js returns mirrored. Fake data.
const TAX_AUTHORITY_LAYOUT = [
  { str: 'מידע על הכנסות לשנת המס', x: 0.383, y: 0.114, width: 0.2 },
  { str: '2021', x: 0.314, y: 0.114, width: 0.04 },
  { str: 'מספר ישות / זהות', x: 0.225, y: 0.141, width: 0.1 },
  { str: '000000018', x: 0.244, y: 0.163, width: 0.07 },
  { str: 'שם המעביד', x: 0.834, y: 0.224, width: 0.07 },
  { str: 'חברה לדוגמה בע"מ', x: 0.754, y: 0.247, width: 0.15 },
  { str: 'מס\' תיק ניכויים', x: 0.581, y: 0.224, width: 0.09 },
  { str: '935000000', x: 0.598, y: 0.246, width: 0.07 },
  { str: 'משכורת ותשלומים', x: 0.786, y: 0.288, width: 0.12 },
  { str: '65,071', x: 0.198, y: 0.288, width: 0.05 },
  { str: "(158/172) סה''כ", x: 0.489, y: 0.308, width: 0.1 },
  { str: '65,071', x: 0.198, y: 0.308, width: 0.05 },
  { str: "סה''כ ניכויי מס )042(", x: 0.765, y: 0.329, width: 0.15 },
  { str: '3,219', x: 0.208, y: 0.329, width: 0.04 },
  { str: 'הכנסה מבוטחת )244/245(', x: 0.717, y: 0.349, width: 0.18 },
  { str: '6,190', x: 0.208, y: 0.349, width: 0.04 },
  { str: "הפקדות העובד לקופ''ג לקצבה )עמית שכיר - זיכוי 35%( )086/045(", x: 0.392, y: 0.37, width: 0.5 },
  { str: '371', x: 0.225, y: 0.37, width: 0.03 },
  { str: 'סכום הפרשות המעביד לקופות גמל לקצבה )248/249(', x: 0.5, y: 0.391, width: 0.4 },
  { str: '773', x: 0.225, y: 0.391, width: 0.03 },
  ...Array.from({ length: 12 }, (_, i) => ({ str: String(i + 1), x: 0.08 + i * 0.03, y: 0.227, width: 0.01 })),
  ...Array.from({ length: 6 }, () => ({ str: "ש''ח", x: 0.077, y: 0.5, width: 0.02 })),
];

test('Tax Authority income printout — parenthesized, mirrored codes', () => {
  const r = parse106Items(TAX_AUTHORITY_LAYOUT);
  assert.deepEqual(r.fields, { income: 65071, taxWithheld: 3219, insuredIncome: 6190, pension: 371 });
  assert.deepEqual(r.missing, []);
  assert.equal(r.taxYear, 2021);
  assert.equal(r.employerName, 'חברה לדוגמה בע"מ');
});

test('zero tax withheld is still a found field', () => {
  const items = TAX_AUTHORITY_LAYOUT.map((item) => (item.str === '3,219' ? { ...item, str: '0' } : item));
  const r = parse106Items(items);
  assert.equal(r.fields.taxWithheld, 0);
  assert.deepEqual(r.missing, []);
});

test('tax year and employee id helpers', () => {
  assert.equal(detectTaxYear('טופס 106 2023 2023 2024', new Date(2026, 0, 1)), 2023);
  assert.equal(detectTaxYear('בשנת 2022', new Date(2026, 0, 1)), 2022);
  assert.equal(detectEmployeeId('937123456 000000018'), '000000018');
  assert.equal(detectEmployeeId('123456789'), null);
});

test('raw rows keep every printed field with its code', () => {
  const { rows } = parse106Items(TAX_AUTHORITY_LAYOUT);
  const byCode = Object.fromEntries(rows.filter((r) => r.codes.length).map((r) => [r.codes.join('/'), r]));
  assert.equal(byCode['158/172'].value, 65071);
  assert.equal(byCode['045/086'].value, 371); // printed mirrored as 086/045
  assert.equal(byCode['045/086'].label, "הפקדות העובד לקופ''ג לקצבה (עמית שכיר - זיכוי 35%)");
  assert.equal(byCode['248/249'].value, 773);
  // Header lines (IDs, withholding-file numbers, month grids) are not rows.
  assert.ok(rows.every((r) => !/\d{8,}/.test(r.label)));
});

test('salary summary — every field across all forms, with totals', () => {
  const { rows } = parse106Items(TAX_AUTHORITY_LAYOUT);
  const summary = buildSalarySummary({
    employers: [
      { id: 'a', name: 'חברה א', income: '65071', taxWithheld: '3219', pension: '371', insuredIncome: '6190', rawRows: rows },
      { id: 'b', name: '', income: '20,058', taxWithheld: '1444', pension: '', insuredIncome: '' },
    ],
  });
  assert.deepEqual(summary.columns.map((c) => c.name), ['חברה א', 'מעסיק 2']);
  const row = (code) => summary.rows.find((r) => r.code === code);
  assert.deepEqual(row('158/172').values, [65071, 20058]);
  assert.equal(row('158/172').total, 85129);
  assert.equal(row('042').total, 4663);
  assert.deepEqual(row('045/086').values, [371, null]);
  assert.deepEqual(row('248/249').values, [773, null]);
  // Mapped codes come from the editable fields only — never duplicated from the PDF rows.
  assert.equal(summary.rows.filter((r) => r.code === '158/172').length, 1);
  assert.ok(!summary.rows.some((r) => r.label === 'משכורת ותשלומים' && !r.code));
});

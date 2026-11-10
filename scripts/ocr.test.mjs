import assert from 'node:assert/strict';
import test from 'node:test';
import { amountColumn, binarizeRgba, linesOf, mergeOcrPasses } from '../src/pages/admin/utils/tax/ocrImage.js';
import { parse106Items } from '../src/pages/admin/utils/tax/parse106.js';

test('binarize: grey box and white background become white, text becomes black', () => {
  const rgba = (values) => new Uint8Array(values.flatMap((v) => [v, v, v, 255]));
  const data = rgba([255, 255, 222, 222, 30, 40, 255, 222]); // white, grey box, dark text
  binarizeRgba(data);
  const out = [...data].filter((_, i) => i % 4 === 0);
  assert.deepEqual(out, [255, 255, 255, 255, 0, 0, 255, 255]);
});

test('merge: labels/codes from the Hebrew pass, amounts from the digits pass', () => {
  const hebrew = [
    { str: 'ניכויי', x: 0.7, y: 0.3 },
    { str: '(042)', x: 0.55, y: 0.3 },
    { str: '488', x: 0.2, y: 0.3 }, // garbled digits — dropped
  ];
  const digits = [
    { str: '638', x: 0.2, y: 0.3 },
    { str: '(158/172)', x: 0.5, y: 0.31 }, // not a pure number — dropped
  ];
  assert.deepEqual(mergeOcrPasses(hebrew, digits).map((i) => i.str), ['ניכויי', '(042)', '638']);
});

const line = (y, words) => ({
  bbox: { x0: Math.min(...words.map((w) => w[1])), y0: y - 20, x1: Math.max(...words.map((w) => w[2])), y1: y },
  words: words.map(([text, x0, x1]) => ({ text, bbox: { x0, y0: y - 20, x1, y1: y } })),
});

test('amount column: left of the labels, spanning the table rows', () => {
  const lines = [
    line(100, [['מידע', 600, 700], ['2023', 520, 590]]), // title: centred, not a table row
    line(300, [['ש"ח', 60, 90], ['משכורת', 1700, 1900], ['ותשלומים', 1500, 1690]]),
    line(330, [['סה"כ', 1100, 1180], ['(158/172)', 950, 1090]]),
    line(360, [['ש"ח', 60, 90], ['ניכויי', 1600, 1800], ['(042)', 1450, 1590]]),
  ];
  const column = amountColumn(lines, 2000, 4000);
  assert.ok(column);
  assert.equal(column.lineHeight, 20);
  assert.equal(column.rectangle.left, 0);
  assert.equal(column.rectangle.width, 950 - 10); // left of the left-most label, minus half a line
  assert.ok(column.rectangle.top <= 280 && column.rectangle.top + column.rectangle.height >= 360);
});

test('amount column: none when there is no table', () => {
  assert.equal(amountColumn([line(100, [['שלום', 900, 1000]])], 2000, 4000), null);
});

test('linesOf flattens Tesseract blocks', () => {
  const data = { blocks: [{ paragraphs: [{ lines: [1, 2] }, { lines: [3] }] }] };
  assert.deepEqual(linesOf(data), [1, 2, 3]);
});

test('OCR-like input: dot thousands, label fallback when a code is misread', () => {
  const filler = Array.from({ length: 25 }, (_, i) => ({ str: `מילה${i}`, x: 0.5, y: 0.9 + i / 1000, width: 0.02 }));
  const items = [
    { str: 'משכורת', x: 0.8, y: 0.3, width: 0.08 },
    { str: 'ותשלומים', x: 0.7, y: 0.3, width: 0.09 },
    { str: '21.733', x: 0.2, y: 0.3, width: 0.05 },
    { str: 'סה"כ', x: 0.8, y: 0.33, width: 0.05 },
    { str: 'ניכויי', x: 0.72, y: 0.33, width: 0.06 },
    { str: 'מס', x: 0.68, y: 0.33, width: 0.03 },
    { str: '(O42)', x: 0.6, y: 0.33, width: 0.05 }, // OCR read 0 as O — no code match
    { str: '638', x: 0.22, y: 0.33, width: 0.03 },
    ...filler,
  ];
  const r = parse106Items(items, { lineTolerance: 0.008 });
  assert.equal(r.fields.income, 21733);
  assert.equal(r.fields.taxWithheld, 638);
});

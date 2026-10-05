// ============================================================
// Ready-made field layouts for fixed government forms.
// Coordinates are measured in PDF points (bottom-left origin) on the
// form's page and converted to the normalized frame used everywhere else.
// ============================================================
import { CHECK_MARKS, DATE_WHEN, FIELD_TYPES } from './pdfGeometry';

const LETTER = { width: 612, height: 792 };

/** [x1, y1, x2, y2] in points → normalized top-left box */
const fromPdfRect = ([x1, y1, x2, y2], page = 0, size = LETTER) => ({
  page,
  x: x1 / size.width,
  y: (size.height - y2) / size.height,
  w: (x2 - x1) / size.width,
  h: (y2 - y1) / size.height,
});

/** Tax Authority form 2279א — בקשה לרישום ייצוג ראשי / מתן ייפוי כוח */
const FORM_2279A = {
  id: 'form-2279a',
  name: 'בקשה לרישום ייצוג ראשי (טופס 2279א)',
  pageCount: 1,
  // "שם פרטי / שם משפחה" row of the client — used to prefill the client's name
  clientNameRegion: fromPdfRect([330, 604, 450, 622]),
  fields: [
    // ── Client section ──────────────────────────────────────
    {
      id: '2279a-sms-consent',
      type: FIELD_TYPES.check,
      mark: CHECK_MARKS.v,
      label: 'אישור הודעות SMS / מייל',
      ...fromPdfRect([538.5, 380.9, 549.4, 390.5]),
    },
    {
      id: '2279a-client-date',
      type: FIELD_TYPES.date,
      when: DATE_WHEN.sign,
      label: 'תאריך חתימת הלקוח',
      fontSize: 10,
      ...fromPdfRect([388, 365, 437, 379.5]),
    },
    {
      id: '2279a-client-x',
      type: FIELD_TYPES.check,
      mark: CHECK_MARKS.x,
      label: 'סימון X ליד חתימת הלקוח',
      ...fromPdfRect([215.6, 362.2, 230.8, 377.5]),
    },
    {
      id: '2279a-client-signature',
      type: FIELD_TYPES.signature,
      label: 'חתימת הלקוח',
      ...fromPdfRect([233, 359.5, 342, 381]),
    },
    // ── Representative section ──────────────────────────────
    {
      id: '2279a-original-confirm',
      type: FIELD_TYPES.check,
      mark: CHECK_MARKS.v,
      label: 'אישור ייפוי כוח מקורי',
      ...fromPdfRect([533.7, 202.5, 544.6, 211.6]),
    },
    {
      id: '2279a-rep-date',
      type: FIELD_TYPES.date,
      when: DATE_WHEN.prepare,
      label: 'תאריך המייצג',
      fontSize: 10,
      ...fromPdfRect([388, 189, 434, 202.5]),
    },
    {
      id: '2279a-office-name',
      type: FIELD_TYPES.text,
      label: 'שם משרד המייצג',
      defaultValue: 'מתן אלקבץ, רואה חשבון',
      fontSize: 9,
      ...fromPdfRect([225, 190, 309, 203]),
    },
    {
      id: '2279a-rep-name',
      type: FIELD_TYPES.text,
      label: 'שם המייצג (ליד החתימה)',
      defaultValue: 'מתן אלקבץ',
      fontSize: 9.5,
      ...fromPdfRect([140, 193, 188, 207]),
    },
    {
      id: '2279a-rep-signature',
      type: FIELD_TYPES.ownerSignature,
      label: 'חתימת המייצג',
      ...fromPdfRect([61, 191.5, 111, 215.5]),
    },
  ],
};

export const TEMPLATE_PRESETS = [FORM_2279A];

export const findPreset = (id) => TEMPLATE_PRESETS.find((preset) => preset.id === id) ?? null;

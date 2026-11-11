// Browser-only: extracts positioned text from a 106 PDF with pdf.js and parses it.
// Image-only PDFs (phone screenshots, scans) fall back to local OCR.
// The file never leaves the browser — nothing is uploaded.

import { loadPdfDocument } from '@components/pdf/pdfjs';
import { isPdfFile, MAX_FILE_BYTES } from '../bundle/fileInfo';
import { detectTaxYear, parse106Items } from './parse106';

const MAX_PAGES = 4;
const OCR_LINE_TOLERANCE = 0.008; // fallback when OCR couldn't measure the line height

async function readItems(doc) {
  const items = [];
  for (let pageIndex = 0; pageIndex < Math.min(doc.numPages, MAX_PAGES); pageIndex += 1) {
    const page = await doc.getPage(pageIndex + 1);
    const [x0, y0, x1, y1] = page.view;
    const width = x1 - x0;
    const height = y1 - y0;
    const { items: pageItems } = await page.getTextContent();
    for (const item of pageItems) {
      if (!item.str?.trim()) continue;
      items.push({
        str: item.str,
        page: pageIndex,
        x: (item.transform[4] - x0) / width,
        y: 1 - (item.transform[5] - y0) / height,
        width: (item.width ?? 0) / width,
      });
    }
  }
  return items;
}

async function readWithOcr(doc, onStatus) {
  onStatus?.('מזהה טקסט בתמונה (OCR)…');
  const { ocrPdfItems } = await import('./ocr');
  const { items, hebrewText, lineTolerance } = await ocrPdfItems(doc);
  const parsed = parse106Items(items, { lineTolerance: lineTolerance ?? OCR_LINE_TOLERANCE });
  return { ...parsed, taxYear: detectTaxYear(hebrewText) ?? parsed.taxYear };
}

/**
 * Returns { fileName, status: 'ok' | 'partial' | 'error', error?, ocr?, ...parse106Items result }.
 * onStatus(message) reports progress for slow steps (OCR).
 */
export async function read106Pdf(file, { onStatus } = {}) {
  const base = { fileName: file.name };
  if (!isPdfFile(file)) return { ...base, status: 'error', error: 'יש להעלות קובץ PDF' };
  if (file.size > MAX_FILE_BYTES) return { ...base, status: 'error', error: 'הקובץ גדול מדי' };

  let doc;
  try {
    doc = await loadPdfDocument(new Uint8Array(await file.arrayBuffer()));
  } catch (err) {
    const error = err?.name === 'PasswordException' ? 'הקובץ מוגן בסיסמה' : 'הקובץ פגום או אינו PDF תקין';
    return { ...base, status: 'error', error };
  }

  try {
    let parsed = parse106Items(await readItems(doc));
    let ocr = false;
    if (!parsed.hasText) {
      try {
        parsed = await readWithOcr(doc, onStatus);
        ocr = true;
      } catch {
        return { ...base, status: 'error', error: 'זיהוי הטקסט בתמונה נכשל — יש להזין ידנית' };
      }
      if (!parsed.hasText) {
        return { ...base, ...parsed, ocr, status: 'error', error: 'לא זוהה טקסט בתמונה — יש להזין ידנית' };
      }
    }
    if (!parsed.found.length) {
      return { ...base, ...parsed, ocr, status: 'error', error: 'לא זוהו שדות של טופס 106 בקובץ' };
    }
    // OCR values are never fully trusted — always flag them for review.
    const status = parsed.missing.length || ocr ? 'partial' : 'ok';
    return { ...base, ...parsed, ocr, status };
  } catch {
    return { ...base, status: 'error', error: 'שגיאה בקריאת הקובץ' };
  } finally {
    doc.destroy();
  }
}

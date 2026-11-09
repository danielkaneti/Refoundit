// Browser-only: extracts positioned text from a 106 PDF with pdf.js and parses it.
// The file never leaves the browser — nothing is uploaded.

import { loadPdfDocument } from '@components/pdf/pdfjs';
import { isPdfFile, MAX_FILE_BYTES } from '../bundle/fileInfo';
import { parse106Items } from './parse106';

const MAX_PAGES = 4;

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

/** Returns { fileName, status: 'ok' | 'partial' | 'error', error?, ...parse106Items result }. */
export async function read106Pdf(file) {
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
    const parsed = parse106Items(await readItems(doc));
    if (!parsed.hasText) {
      return { ...base, ...parsed, status: 'error', error: 'לא נמצא טקסט בקובץ (כנראה סריקה) — יש להזין ידנית' };
    }
    if (!parsed.found.length) {
      return { ...base, ...parsed, status: 'error', error: 'לא זוהו שדות של טופס 106 בקובץ' };
    }
    return { ...base, ...parsed, status: parsed.missing.length ? 'partial' : 'ok' };
  } catch {
    return { ...base, status: 'error', error: 'שגיאה בקריאת הקובץ' };
  } finally {
    doc.destroy();
  }
}

// Legacy build — supports older mobile browsers the signing link may be opened on.
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

// pdf.js transfers (detaches) the buffer to its worker, so always hand it a copy.
export const loadPdfDocument = (bytes) => pdfjs.getDocument({ data: bytes.slice() }).promise;

export async function getPageCount(bytes) {
  const doc = await loadPdfDocument(bytes);
  try {
    return doc.numPages;
  } finally {
    doc.destroy();
  }
}

/**
 * Text found inside a normalized box (top-left origin), joined right-to-left
 * as Hebrew reads. Used to prefill the client's name from fixed government forms.
 */
export async function extractTextInRegion(bytes, region) {
  const doc = await loadPdfDocument(bytes);
  try {
    const page = await doc.getPage(region.page + 1);
    const [x0, y0, x1, y1] = page.view;
    const width = x1 - x0;
    const height = y1 - y0;
    const { items } = await page.getTextContent();
    return items
      .filter((item) => item.str.trim())
      .map((item) => ({
        text: item.str.trim(),
        x: (item.transform[4] - x0) / width,
        y: 1 - (item.transform[5] - y0) / height,
      }))
      .filter(
        (item) =>
          item.x >= region.x && item.x <= region.x + region.w && item.y >= region.y && item.y <= region.y + region.h
      )
      .sort((a, b) => b.x - a.x)
      .map((item) => item.text)
      .join(' ');
  } finally {
    doc.destroy();
  }
}

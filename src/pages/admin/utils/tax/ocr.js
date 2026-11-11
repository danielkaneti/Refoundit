// Browser-only OCR for image-only 106s (phone screenshots, scans).
// Runs locally with tesseract.js (WebAssembly). Its worker, core and Hebrew model are
// served from our own /tesseract folder (scripts/copy-ocr-assets.mjs), never a CDN, and
// the images never leave the browser.
//
// Two passes per page: the Hebrew model reads labels and field codes and locates the
// amounts column; a digits-only English pass then reads just that column (the Hebrew
// model garbles digits on low-resolution screenshots).

import { amountColumn, binarizeRgba, DIGIT_WHITELIST, linesOf, mergeOcrPasses } from './ocrImage';

const OCR_OPTIONS = {
  workerPath: '/tesseract/worker.min.js',
  corePath: '/tesseract/core',
  langPath: '/tesseract/lang',
  gzip: true,
  // Don't persist the model in IndexedDB — the HTTP cache is enough.
  cacheMethod: 'none',
};

const TARGET_WIDTH = 2400; // px — OCR accuracy drops sharply on small renders
const MAX_SCALE = 4;
const MAX_PAGES = 2;

let workersPromise = null;

function getWorkers() {
  if (!workersPromise) {
    workersPromise = import('tesseract.js')
      .then(async ({ createWorker }) => {
        const [hebrew, digits] = await Promise.all([
          createWorker('heb', 1, OCR_OPTIONS),
          createWorker('eng', 1, OCR_OPTIONS),
        ]);
        // PSM 6 = one uniform block — the amounts column.
        await digits.setParameters({ tessedit_char_whitelist: DIGIT_WHITELIST, tessedit_pageseg_mode: '6' });
        return { hebrew, digits };
      })
      .catch((err) => {
        workersPromise = null;
        throw err;
      });
  }
  return workersPromise;
}

/** Frees the OCR workers (WASM memory). Safe to call when none are running. */
export async function terminateOcr() {
  const pending = workersPromise;
  workersPromise = null;
  const workers = pending ? await pending.catch(() => null) : null;
  if (workers) await Promise.all([workers.hebrew.terminate(), workers.digits.terminate()]);
}

function toItems(data, width, height, pageIndex) {
  const items = [];
  for (const line of linesOf(data)) {
    // One y per OCR line keeps its words together; baseline-ish = bottom of the line box.
    const y = line.bbox.y1 / height;
    for (const word of line.words ?? []) {
      const text = word.text?.trim();
      if (!text) continue;
      items.push({
        str: text,
        page: pageIndex,
        x: word.bbox.x0 / width,
        width: (word.bbox.x1 - word.bbox.x0) / width,
        y,
      });
    }
  }
  return items;
}

async function renderPage(page) {
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: Math.min(MAX_SCALE, TARGET_WIDTH / base.width) });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const context = canvas.getContext('2d');
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, viewport }).promise;
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  binarizeRgba(image.data);
  context.putImageData(image, 0, 0);
  return canvas;
}

/**
 * OCRs the first pages of a loaded pdf.js document.
 * Returns { items, hebrewText, lineTolerance }:
 * - items: positioned text ({ str, x, y, width, page }, normalized 0..1 from top-left)
 * - hebrewText: the Hebrew pass's plain text (its 4-digit years are reliable)
 * - lineTolerance: half the measured line height, for parse106Items row grouping
 */
export async function ocrPdfItems(doc) {
  const { hebrew, digits } = await getWorkers();
  const items = [];
  let hebrewText = '';
  let lineTolerance = null;

  for (let pageIndex = 0; pageIndex < Math.min(doc.numPages, MAX_PAGES); pageIndex += 1) {
    const canvas = await renderPage(await doc.getPage(pageIndex + 1));
    const { width, height } = canvas;
    const { data: hebrewData } = await hebrew.recognize(canvas, {}, { blocks: true, text: true });
    hebrewText += ` ${hebrewData.text ?? ''}`;

    const column = amountColumn(linesOf(hebrewData), width, height);
    let digitItems = [];
    if (column) {
      const { data: digitData } = await digits.recognize(canvas, { rectangle: column.rectangle }, { blocks: true });
      digitItems = toItems(digitData, width, height, pageIndex);
      lineTolerance ??= (column.lineHeight * 0.5) / height;
    }

    items.push(...mergeOcrPasses(toItems(hebrewData, width, height, pageIndex), digitItems));
    canvas.width = 0; // release the bitmap early
  }
  return { items, hebrewText, lineTolerance };
}

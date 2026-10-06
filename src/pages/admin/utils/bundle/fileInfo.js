import { PDFDocument } from 'pdf-lib';
import { loadPdfDocument } from '@components/pdf/pdfjs';

export const MAX_FILE_BYTES = 25 * 1024 * 1024;
const THUMB_WIDTH = 220;
const TEXT_PAGES = 3;

export const isPdfFile = (file) => file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
export const isImageFile = (file) => ['image/png', 'image/jpeg'].includes(file.type) || /\.(png|jpe?g)$/i.test(file.name);

async function renderPageToDataUrl(page, width) {
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: width / base.width });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  return canvas.toDataURL('image/jpeg', 0.8);
}

/** Renders page N (1-based) of a PDF to a JPEG data URL. */
export async function renderPdfPage(bytes, pageNumber = 1, width = THUMB_WIDTH) {
  const doc = await loadPdfDocument(bytes);
  try {
    return await renderPageToDataUrl(await doc.getPage(pageNumber), width);
  } finally {
    doc.destroy();
  }
}

/**
 * Page count, first-page thumbnail and text (first pages) of a PDF.
 * Never throws — problems come back as status 'encrypted' / 'invalid'.
 */
export async function readPdfInfo(bytes) {
  let doc;
  try {
    doc = await loadPdfDocument(bytes);
  } catch (err) {
    if (err?.name === 'PasswordException') return { status: 'encrypted', error: 'הקובץ מוגן בסיסמה', pageCount: 0 };
    return { status: 'invalid', error: 'הקובץ פגום או אינו PDF תקין', pageCount: 0 };
  }

  try {
    const pageCount = doc.numPages;
    const thumb = await renderPageToDataUrl(await doc.getPage(1), THUMB_WIDTH);
    let text = '';
    for (let i = 1; i <= Math.min(pageCount, TEXT_PAGES); i += 1) {
      const content = await (await doc.getPage(i)).getTextContent();
      text += ` ${content.items.map((item) => item.str).join(' ')}`;
    }

    // pdf-lib must also be able to read it, or merging will fail later.
    const check = await PDFDocument.load(bytes, { ignoreEncryption: true });
    if (check.isEncrypted) {
      return { status: 'encrypted', error: 'הקובץ מוצפן (נעול לעריכה) ולא ניתן לצרף אותו', pageCount, thumb, text };
    }
    return { status: 'ok', pageCount, thumb, text: text.replace(/\s+/g, ' ').trim() };
  } catch {
    return { status: 'invalid', error: 'לא ניתן לקרוא את הקובץ', pageCount: 0 };
  } finally {
    doc.destroy();
  }
}

export function readImageInfo(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const scale = THUMB_WIDTH / image.width;
      const canvas = document.createElement('canvas');
      canvas.width = THUMB_WIDTH;
      canvas.height = Math.round(image.height * scale);
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve({ status: 'ok', pageCount: 1, thumb: canvas.toDataURL('image/jpeg', 0.8), text: '' });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ status: 'invalid', error: 'לא ניתן לקרוא את התמונה', pageCount: 0 });
    };
    image.src = url;
  });
}

/** Splits a PDF into one single-page PDF per page. */
export async function splitPdfIntoPages(bytes) {
  const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const parts = [];
  for (const index of source.getPageIndices()) {
    const part = await PDFDocument.create();
    const [page] = await part.copyPages(source, [index]);
    part.addPage(page);
    parts.push(await part.save());
  }
  return parts;
}

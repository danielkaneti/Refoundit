import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { fieldToPdfRect, formatDateIL, isPageRotated } from '../shared/pdfGeometry';

const A4 = [595.28, 841.89];
const INK = rgb(0.04, 0.09, 0.16);
const MUTED = rgb(0.35, 0.42, 0.49);

const loadPdf = (bytes) => PDFDocument.load(bytes, { ignoreEncryption: true });

/** Validates an uploaded template and returns its page count. */
export async function inspectPdf(bytes) {
  let document;
  try {
    document = await loadPdf(bytes);
  } catch {
    return { error: 'לא ניתן לקרוא את קובץ ה-PDF' };
  }
  const pages = document.getPages();
  if (!pages.length) return { error: 'קובץ ה-PDF ריק' };
  if (pages.some(isPageRotated)) {
    return { error: 'ה-PDF מכיל עמודים מסובבים — יש לשמור אותו מחדש ללא סיבוב' };
  }
  return { pageCount: pages.length };
}

/** Writes the signing date (digits only) centered in each sign-time date box. */
async function stampSignDates(document, pages, dateFields, signedAt) {
  if (!dateFields.length) return;
  const font = await document.embedFont(StandardFonts.Helvetica);
  const text = formatDateIL(new Date(signedAt));
  for (const field of dateFields) {
    const page = pages[field.page];
    if (!page) continue;
    const box = fieldToPdfRect(page, field);
    let size = Math.min(field.fontSize || 10, box.height * 0.85);
    while (size > 4 && font.widthOfTextAtSize(text, size) > box.width - 2) size -= 0.5;
    page.drawText(text, {
      x: box.x + (box.width - font.widthOfTextAtSize(text, size)) / 2,
      y: box.y + (box.height - font.heightAtSize(size, { descender: false })) / 2,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  }
}

/**
 * Stamps the signature into every signature box, the signing date into
 * sign-time date boxes, and appends a signature certificate page
 * (ASCII only — standard fonts have no Hebrew).
 */
export async function signPdf(preparedBytes, signaturePng, signatureFields, audit, signDateFields = []) {
  const document = await loadPdf(preparedBytes);
  const signature = await document.embedPng(signaturePng);
  const pages = document.getPages();
  await stampSignDates(document, pages, signDateFields, audit.signedAt);

  for (const field of signatureFields) {
    const page = pages[field.page];
    if (!page) continue;
    const box = fieldToPdfRect(page, field);
    const scale = Math.min(box.width / signature.width, box.height / signature.height);
    const width = signature.width * scale;
    const height = signature.height * scale;
    page.drawImage(signature, {
      x: box.x + (box.width - width) / 2,
      y: box.y + (box.height - height) / 2,
      width,
      height,
    });
  }

  await appendCertificatePage(document, signature, audit);

  document.setModificationDate(new Date(audit.signedAt));
  document.setProducer('REFOUNDIT e-sign');
  return document.save();
}

async function appendCertificatePage(document, signature, audit) {
  const page = document.addPage(A4);
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const left = 56;
  let y = A4[1] - 72;

  page.drawText('Electronic Signature Certificate', { x: left, y, size: 18, font: bold, color: INK });
  y -= 36;

  const rows = [
    ['Document ID', audit.token.slice(0, 12)],
    ['Signed at (UTC)', audit.signedAt.replace('T', ' ').replace(/\.\d+Z$/, '')],
    ['Signer IP address', audit.ip],
    ['Signer device', audit.userAgent || 'unknown'],
    ['Original document SHA-256', audit.originalSha256],
    ['Signature boxes stamped', String(audit.signatureCount)],
    ['Consent', 'Signer confirmed they read and approve the document'],
  ];

  for (const [label, value] of rows) {
    page.drawText(label, { x: left, y, size: 10, font: bold, color: MUTED });
    y -= 15;
    for (const line of wrap(toAscii(value), 88)) {
      page.drawText(line, { x: left, y, size: 10, font: regular, color: INK });
      y -= 14;
    }
    y -= 10;
  }

  const width = Math.min(220, signature.width);
  const height = (signature.height / signature.width) * width;
  page.drawText('Signature', { x: left, y, size: 10, font: bold, color: MUTED });
  page.drawImage(signature, { x: left, y: y - height - 8, width, height });
}

// Standard PDF fonts only support WinAnsi — strip anything else.
// eslint-disable-next-line no-control-regex
const toAscii = (value) => String(value).replace(/[^\x20-\x7E]/g, '?');

function wrap(text, maxChars) {
  const lines = [];
  for (let i = 0; i < text.length; i += maxChars) lines.push(text.slice(i, i + maxChars));
  return lines.length ? lines : [''];
}

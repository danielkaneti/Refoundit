import { PDFDocument, rgb } from 'pdf-lib';
import { CHECK_MARKS, DATE_WHEN, FIELD_TYPES, fieldToPdfRect, formatDateIL } from '@shared/pdfGeometry';

const RENDER_SCALE = 4;
const FONT_FAMILY = "Heebo, Arial, sans-serif";
const FONT_WEIGHT = 500;
const TEXT_COLOR = '#000000';

const canvasToPngBytes = (canvas) =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Canvas export failed'));
      blob.arrayBuffer().then((buffer) => resolve(new Uint8Array(buffer)), reject);
    }, 'image/png');
  });

/**
 * Hebrew / mixed RTL text is rendered by the browser (correct bidi + Heebo glyphs)
 * and embedded as an image; pdf-lib has no bidi support.
 */
async function renderTextPng(text, widthPt, heightPt, fontSizePt, align = 'right') {
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(widthPt * RENDER_SCALE);
  canvas.height = Math.ceil(heightPt * RENDER_SCALE);
  const ctx = canvas.getContext('2d');

  let size = fontSizePt * RENDER_SCALE;
  const font = () => `${FONT_WEIGHT} ${size}px ${FONT_FAMILY}`;
  await document.fonts.load(font(), text);

  ctx.direction = 'rtl';
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = font();

  // Shrink to fit long values instead of clipping them.
  const padding = RENDER_SCALE;
  while (size > RENDER_SCALE * 4 && ctx.measureText(text).width > canvas.width - padding * 2) {
    size -= 1;
    ctx.font = font();
  }

  ctx.fillText(text, align === 'center' ? canvas.width / 2 : canvas.width - padding, canvas.height / 2);
  return canvasToPngBytes(canvas);
}

// Marks drawn as vector strokes in a unit box (SVG coords, y down)
const MARK_PATHS = {
  [CHECK_MARKS.v]: [[0.12, 0.55], [0.4, 0.85], [0.9, 0.12]],
  [CHECK_MARKS.x]: [[0.12, 0.12], [0.88, 0.88], null, [0.88, 0.12], [0.12, 0.88]],
};

function drawMark(page, rect, mark) {
  const points = MARK_PATHS[mark] ?? MARK_PATHS[CHECK_MARKS.v];
  const thickness = Math.max(1, Math.min(rect.width, rect.height) * 0.12);
  let previous = null;
  for (const point of points) {
    if (point && previous) {
      page.drawLine({
        start: { x: rect.x + previous[0] * rect.width, y: rect.y + (1 - previous[1]) * rect.height },
        end: { x: rect.x + point[0] * rect.width, y: rect.y + (1 - point[1]) * rect.height },
        thickness,
        color: rgb(0, 0, 0),
        lineCap: 1,
      });
    }
    previous = point;
  }
}

function fitImage(rect, image) {
  const scale = Math.min(rect.width / image.width, rect.height / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  return { x: rect.x + (rect.width - width) / 2, y: rect.y + (rect.height - height) / 2, width, height };
}

/** Text value a field gets at prepare time, or null when nothing is stamped yet. */
export function preparedValue(field, values, date = new Date()) {
  if (field.type === FIELD_TYPES.text) return (values[field.id] ?? field.defaultValue ?? '').trim() || null;
  if (field.type === FIELD_TYPES.date && field.when !== DATE_WHEN.sign) return formatDateIL(date);
  return null;
}

/**
 * Returns the PDF with every prepare-time field stamped: client details / fixed text,
 * prepare dates, V/X marks and the representative's signature.
 * Client signatures and sign-time dates are stamped later by the server.
 */
export async function buildPreparedPdf(pdfBytes, fields, values, { ownerSignaturePng = null, date = new Date() } = {}) {
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const ownerSignature = ownerSignaturePng ? await pdf.embedPng(ownerSignaturePng) : null;

  for (const field of fields) {
    const page = pages[field.page];
    if (!page) continue;
    const rect = fieldToPdfRect(page, field);

    if (field.type === FIELD_TYPES.check) {
      drawMark(page, rect, field.mark);
    } else if (field.type === FIELD_TYPES.ownerSignature) {
      if (!ownerSignature) throw new Error('missing-owner-signature');
      page.drawImage(ownerSignature, fitImage(rect, ownerSignature));
    } else {
      const text = preparedValue(field, values, date);
      if (!text) continue;
      const align = field.type === FIELD_TYPES.date ? 'center' : 'right';
      const png = await pdf.embedPng(
        await renderTextPng(text, rect.width, rect.height, field.fontSize || 11, align)
      );
      page.drawImage(png, rect);
    }
  }

  return pdf.save();
}

import { PDFDocument, degrees } from 'pdf-lib';
import { FOOTER_PX } from './introRenderer';
import { isUsable, parsePageSelection } from './pageCalc';

const A4_PT = { width: 595.28, height: 841.89 };
const IMAGE_MARGIN_PT = 36;

const canvasToPng = (canvas) =>
  new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? blob.arrayBuffer().then((b) => resolve(new Uint8Array(b))) : reject()), 'image/png')
  );

/**
 * Draws a source page (respecting its /Rotate) scaled into `box` on `target`.
 * pdf-lib's embedPage ignores /Rotate, so the rotation is applied here.
 */
function drawRotatedPage(target, embedded, rotation, box) {
  const { width: w, height: h } = embedded;
  const quarter = ((rotation % 360) + 360) % 360;
  const sideways = quarter === 90 || quarter === 270;
  const scale = Math.min(box.width / (sideways ? h : w), box.height / (sideways ? w : h));
  const dw = (sideways ? h : w) * scale;
  const dh = (sideways ? w : h) * scale;
  const x0 = box.x + (box.width - dw) / 2;
  const y0 = box.y + (box.height - dh) / 2;

  const origin = {
    0: { x: x0, y: y0 },
    90: { x: x0, y: y0 + dh },
    180: { x: x0 + dw, y: y0 + dh },
    270: { x: x0 + dw, y: y0 },
  }[quarter];
  target.drawPage(embedded, { ...origin, xScale: scale, yScale: scale, rotate: degrees(-quarter) });
}

/**
 * Merges intro canvases + documents into one PDF with the footer on every page.
 * Document pages are scaled down slightly so the footer never covers their content.
 */
export async function buildMergedPdf({ introCanvases, footerCanvas, docs, title }) {
  const out = await PDFDocument.create();
  out.setTitle(title);
  out.setProducer('REFOUNDIT');
  out.setCreationDate(new Date());

  const footer = await out.embedPng(await canvasToPng(footerCanvas));
  const footerHeightFor = (pageWidth) => (pageWidth * FOOTER_PX.height) / FOOTER_PX.width;
  const stampFooter = (page) => {
    const { width } = page.getSize();
    page.drawImage(footer, { x: 0, y: 0, width, height: footerHeightFor(width) });
  };

  for (const canvas of introCanvases) {
    const image = await out.embedPng(await canvasToPng(canvas));
    const page = out.addPage([A4_PT.width, A4_PT.height]);
    page.drawImage(image, { x: 0, y: 0, width: A4_PT.width, height: A4_PT.height });
    stampFooter(page);
  }

  for (const doc of docs.filter(isUsable)) {
    if (doc.kind === 'image') {
      const image = doc.mime === 'image/png' ? await out.embedPng(doc.bytes) : await out.embedJpg(doc.bytes);
      const page = out.addPage([A4_PT.width, A4_PT.height]);
      const reserve = footerHeightFor(A4_PT.width) + 8;
      const box = {
        x: IMAGE_MARGIN_PT,
        y: reserve + IMAGE_MARGIN_PT / 2,
        width: A4_PT.width - IMAGE_MARGIN_PT * 2,
        height: A4_PT.height - reserve - IMAGE_MARGIN_PT * 1.5,
      };
      const scale = Math.min(box.width / image.width, box.height / image.height);
      page.drawImage(image, {
        x: box.x + (box.width - image.width * scale) / 2,
        y: box.y + (box.height - image.height * scale) / 2,
        width: image.width * scale,
        height: image.height * scale,
      });
      stampFooter(page);
      continue;
    }

    const source = await PDFDocument.load(doc.bytes, { ignoreEncryption: true });
    const sourcePages = source.getPages();
    for (const index of parsePageSelection(doc.pages, doc.pageCount)) {
      const sourcePage = sourcePages[index];
      const rotation = sourcePage.getRotation().angle;
      const embedded = await out.embedPage(sourcePage);
      const sideways = rotation % 180 !== 0;
      const width = sideways ? embedded.height : embedded.width;
      const height = sideways ? embedded.width : embedded.height;
      const page = out.addPage([width, height]);
      const reserve = footerHeightFor(width);
      drawRotatedPage(page, embedded, rotation, { x: 0, y: reserve, width, height: height - reserve });
      stampFooter(page);
    }
  }

  return out.save();
}

export function downloadPdf(bytes, filename) {
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.replace(/[\\/:*?"<>|]+/g, '').trim() || 'bundle.pdf';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

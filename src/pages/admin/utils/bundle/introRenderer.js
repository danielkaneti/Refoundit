// ============================================================
// Branded A4 cover letter + footer, drawn with the Canvas 2D API.
// Canvas text gets correct Hebrew bidi from the browser, needs no extra
// library, and the result is embedded in the bundle PDF as page images.
//
// Two passes: layoutIntro() measures and paginates (cheap — used for page
// counts while editing), paintPages() draws the canvases for preview/export.
// Units are CSS px of an A4 page at 96dpi (794 × 1123).
// ============================================================

export const A4_PX = { width: 794, height: 1123 };
export const FOOTER_PX = { width: 794, height: 40 };
const RENDER_SCALE = 2;
const MARGIN = 60;
const FOOTER_RESERVE = 70;
const FONT = 'Heebo, Arial, sans-serif';
const INK = '#1b2433';
const MUTED = '#5a6a7e';
const BORDER = '#dde3ed';
const MONOGRAM_COLOR = '#1B2446';

const font = (size, weight = 400) => `${weight} ${size}px ${FONT}`;

export async function ensureIntroFonts() {
  await Promise.all([document.fonts.load(font(16, 400), 'א'), document.fonts.load(font(16, 700), 'א')]);
}

let measureContext;
function measure(text, size, weight) {
  measureContext ??= document.createElement('canvas').getContext('2d');
  measureContext.font = font(size, weight);
  return measureContext.measureText(text).width;
}

function wrap(text, maxWidth, size, weight = 400) {
  const lines = [];
  for (const paragraph of String(text ?? '').split('\n')) {
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && measure(candidate, size, weight) > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    lines.push(line);
  }
  return lines;
}

function subjectLines({ caseNumber, taxYear }, title) {
  const report = taxYear ? `דוח 1301 לשנת המס ${taxYear}` : null;
  if (caseNumber) return [`תיק מספר ${caseNumber} (בז"ר)`, report].filter(Boolean);
  return [report ?? title];
}

/**
 * @returns {Array<Array<object>>} pages of draw operations
 */
export function layoutIntro({ office, packageData, title, entries, hasSignature, hasLogo = true }) {
  const pages = [[]];
  let ops = pages[0];
  let y = MARGIN;
  const right = A4_PX.width - MARGIN;
  const contentWidth = A4_PX.width - MARGIN * 2;
  const maxY = A4_PX.height - FOOTER_RESERVE;
  const primary = office.primaryColor || '#1e3a5f';

  const newPage = () => {
    ops = [];
    pages.push(ops);
    y = MARGIN;
  };
  const ensure = (height) => {
    if (y + height > maxY) newPage();
  };
  const text = (value, x, top, size, { weight = 400, color = INK, align = 'right' } = {}) =>
    ops.push({ type: 'text', value, x, y: top, size, weight, color, align });

  // ── Header: logo on the left; date, then the recipient block on the right ──
  const LOGO_BOX = { w: 190, h: 130 };
  if (hasLogo) {
    ops.push({ type: 'logo', x: MARGIN, y: y - 10, ...LOGO_BOX });
  } else {
    ops.push({ type: 'monogram', x: MARGIN, y: y - 4, size: 64, color: MONOGRAM_COLOR });
    text(office.officeName, MARGIN + 78, y + 22, 22, { weight: 700, color: MONOGRAM_COLOR, align: 'left' });
    if (office.tagline) text(office.tagline, MARGIN + 78, y + 46, 13, { color: MUTED, align: 'left' });
  }

  let recipientY = y + 14;
  if (packageData.docDateText) {
    text(packageData.docDateText, right, recipientY, 15);
    recipientY += 36;
  }
  ['לכבוד', 'פקיד השומה', 'א.ג.נ.'].forEach((line, i) => {
    text(line, right, recipientY, 15, { weight: i === 1 ? 700 : 400 });
    recipientY += 22;
  });
  y = Math.max(y + LOGO_BOX.h, recipientY) + 6;

  ops.push({ type: 'line', x1: MARGIN, y1: y, x2: right, y2: y, color: primary, width: 2 });
  y += 44;

  // ── Title ──
  for (const line of wrap(title, contentWidth, 22, 700)) {
    text(line, A4_PX.width / 2, y, 22, { weight: 700, color: primary, align: 'center' });
    y += 32;
  }
  y += 12;

  // ── Subject ──
  subjectLines(packageData, title).forEach((line, i) => {
    const value = i === 0 ? `הנדון: ${line}` : line;
    const indent = i === 0 ? 0 : measure('הנדון: ', 16, 700);
    text(value, right - indent, y, 16, { weight: 700 });
    const width = measure(value, 16, 700);
    ops.push({ type: 'line', x1: right - indent - width, y1: y + 6, x2: right - indent, y2: y + 6, color: INK, width: 1 });
    y += 26;
  });
  y += 12;

  // ── Body ──
  for (const line of wrap(office.bodyText, contentWidth, 15)) {
    text(line, right, y, 15);
    y += 24;
  }
  y += 18;

  // ── Documents table (80% of the page, centered) ──
  const tableWidth = A4_PX.width * 0.8;
  const tableRight = (A4_PX.width + tableWidth) / 2;
  const tableLeft = tableRight - tableWidth;
  const pagesColumn = 120;
  const nameWidth = tableWidth - pagesColumn - 24;
  const headerRow = () => {
    ops.push({ type: 'rect', x: tableLeft, y, w: tableWidth, h: 34, fill: primary });
    text('שם המסמך', tableRight - 12, y + 22, 14, { weight: 700, color: '#ffffff' });
    text('מספר עמודים', tableLeft + pagesColumn / 2, y + 22, 14, { weight: 700, color: '#ffffff', align: 'center' });
    y += 34;
  };

  ensure(34 + 32);
  headerRow();
  entries.forEach((entry, index) => {
    const lines = wrap(`${index + 1}. ${entry.title}`, nameWidth, 14);
    const height = Math.max(32, lines.length * 20 + 12);
    if (y + height > maxY) {
      newPage();
      headerRow();
    }
    ops.push({ type: 'rect', x: tableLeft, y, w: tableWidth, h: height, fill: index % 2 ? '#f7f9fc' : '#ffffff', stroke: BORDER });
    ops.push({ type: 'line', x1: tableLeft + pagesColumn, y1: y, x2: tableLeft + pagesColumn, y2: y + height, color: BORDER, width: 1 });
    lines.forEach((line, i) => text(line, tableRight - 12, y + 21 + i * 20, 14));
    text(String(entry.pageCount), tableLeft + pagesColumn / 2, y + height / 2 + 5, 14, { align: 'center' });
    y += height;
  });
  y += 28;

  // ── Notes ──
  if (packageData.notes?.trim()) {
    const lines = wrap(packageData.notes, contentWidth - 24, 14);
    const height = lines.length * 22 + 20;
    ensure(height);
    ops.push({ type: 'rect', x: MARGIN, y, w: contentWidth, h: height, fill: '#f7f9fc' });
    ops.push({ type: 'rect', x: right - 4, y, w: 4, h: height, fill: primary });
    lines.forEach((line, i) => text(line, right - 16, y + 25 + i * 22, 14));
    y += height + 24;
  }

  // ── Contact line ──
  const contact = [office.phone, office.email, office.address].filter(Boolean).join('  ·  ');
  if (contact) {
    ensure(30);
    text(contact, A4_PX.width / 2, y, 13, { color: MUTED, align: 'center' });
    y += 36;
  }

  // ── Closing (left aligned), kept together ──
  const closingHeight = 24 + (hasSignature ? 70 : 10) + 48;
  ensure(closingHeight);
  text(office.closingText, MARGIN, y, 15, { align: 'left' });
  y += 12;
  if (hasSignature) {
    ops.push({ type: 'signature', x: MARGIN, y, w: 150, h: 60 });
    y += 66;
  } else {
    y += 10;
  }
  text(office.contactName, MARGIN, y + 16, 15, { weight: 700, align: 'left' });
  if (office.contactTitle) text(office.contactTitle, MARGIN, y + 38, 14, { color: MUTED, align: 'left' });

  return pages;
}

function drawMonogram(ctx, { x, y, size, color }) {
  const s = size / 100;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 7 * s;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeRect(3 * s, 3 * s, 94 * s, 94 * s);
  ctx.beginPath();
  // M
  ctx.moveTo(16 * s, 76 * s);
  ctx.lineTo(16 * s, 26 * s);
  ctx.lineTo(33 * s, 52 * s);
  ctx.lineTo(50 * s, 26 * s);
  ctx.lineTo(50 * s, 76 * s);
  // E
  ctx.moveTo(84 * s, 26 * s);
  ctx.lineTo(62 * s, 26 * s);
  ctx.lineTo(62 * s, 76 * s);
  ctx.lineTo(84 * s, 76 * s);
  ctx.moveTo(62 * s, 51 * s);
  ctx.lineTo(80 * s, 51 * s);
  ctx.stroke();
  ctx.restore();
}

function drawImageContained(ctx, image, { x, y, w, h }) {
  const scale = Math.min(w / image.width, h / image.height);
  ctx.drawImage(image, x, y + (h - image.height * scale) / 2, image.width * scale, image.height * scale);
}

function newCanvas({ width, height }) {
  const canvas = document.createElement('canvas');
  canvas.width = width * RENDER_SCALE;
  canvas.height = height * RENDER_SCALE;
  const ctx = canvas.getContext('2d');
  ctx.scale(RENDER_SCALE, RENDER_SCALE);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  return { canvas, ctx };
}

/** Crops the white margins around an image (e.g. a logo exported with padding). */
export function trimWhitespace(image, threshold = 235) {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      if (data[i + 3] > 20 && (data[i] < threshold || data[i + 1] < threshold || data[i + 2] < threshold)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return canvas;
  const out = document.createElement('canvas');
  out.width = maxX - minX + 1;
  out.height = maxY - minY + 1;
  out.getContext('2d').drawImage(canvas, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
  return out;
}

/** Draws laid-out pages. Images are HTMLImageElement / canvas, or null. */
export function paintPages(pages, { signatureImage = null, logoImage = null } = {}) {
  return pages.map((ops) => {
    const { canvas, ctx } = newCanvas(A4_PX);
    for (const op of ops) {
      if (op.type === 'text') {
        ctx.font = font(op.size, op.weight);
        ctx.fillStyle = op.color;
        ctx.direction = 'rtl';
        ctx.textAlign = op.align;
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(op.value, op.x, op.y);
      } else if (op.type === 'line') {
        ctx.strokeStyle = op.color;
        ctx.lineWidth = op.width;
        ctx.beginPath();
        ctx.moveTo(op.x1, op.y1);
        ctx.lineTo(op.x2, op.y2);
        ctx.stroke();
      } else if (op.type === 'rect') {
        if (op.fill) {
          ctx.fillStyle = op.fill;
          ctx.fillRect(op.x, op.y, op.w, op.h);
        }
        if (op.stroke) {
          ctx.strokeStyle = op.stroke;
          ctx.lineWidth = 1;
          ctx.strokeRect(op.x, op.y, op.w, op.h);
        }
      } else if (op.type === 'monogram') {
        drawMonogram(ctx, op);
      } else if (op.type === 'signature' && signatureImage) {
        drawImageContained(ctx, signatureImage, op);
      } else if (op.type === 'logo' && logoImage) {
        drawImageContained(ctx, logoImage, op);
      }
    }
    return canvas;
  });
}

/** Contact band drawn at the bottom of every page of the bundle. */
export function renderFooterCanvas(office) {
  const { canvas, ctx } = newCanvas(FOOTER_PX);
  ctx.fillStyle = office.primaryColor || '#1e3a5f';
  ctx.fillRect(MARGIN, 4, FOOTER_PX.width - MARGIN * 2, 1.5);
  const parts = [
    office.officeName,
    [office.contactName, office.contactTitle].filter(Boolean).join(' '),
    office.phone,
    office.email,
  ].filter(Boolean);
  ctx.font = font(11);
  ctx.fillStyle = MUTED;
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.fillText(parts.join('   ·   '), FOOTER_PX.width / 2, 26);
  return canvas;
}

export const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

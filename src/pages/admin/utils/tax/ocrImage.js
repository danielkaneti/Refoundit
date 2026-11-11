// Image clean-up before OCR. Phone screenshots of Tax Authority printouts put the
// amounts in light-grey boxes — at screenshot resolution Tesseract misreads them unless
// the image is turned into crisp black-on-white first. Pure: works on RGBA arrays.

/** Otsu's threshold for a 256-bin luminance histogram. */
function otsuThreshold(histogram, total) {
  let sum = 0;
  for (let i = 0; i < 256; i += 1) sum += i * histogram[i];
  let sumBackground = 0;
  let weightBackground = 0;
  let best = 127;
  let bestVariance = -1;
  for (let t = 0; t < 256; t += 1) {
    weightBackground += histogram[t];
    if (!weightBackground) continue;
    const weightForeground = total - weightBackground;
    if (!weightForeground) break;
    sumBackground += t * histogram[t];
    const meanBackground = sumBackground / weightBackground;
    const meanForeground = (sum - sumBackground) / weightForeground;
    const variance = weightBackground * weightForeground * (meanBackground - meanForeground) ** 2;
    if (variance > bestVariance) {
      bestVariance = variance;
      best = t;
    }
  }
  return best;
}

/**
 * Converts RGBA pixels (in place) to pure black/white using a global Otsu threshold.
 * data: Uint8ClampedArray | Uint8Array of RGBA.
 */
export function binarizeRgba(data) {
  const pixels = data.length / 4;
  const luma = new Uint8Array(pixels);
  const histogram = new Array(256).fill(0);
  for (let i = 0; i < pixels; i += 1) {
    const o = i * 4;
    const y = Math.round(0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2]);
    luma[i] = y;
    histogram[y] += 1;
  }
  const threshold = otsuThreshold(histogram, pixels);
  for (let i = 0; i < pixels; i += 1) {
    const v = luma[i] > threshold ? 255 : 0;
    const o = i * 4;
    data[o] = v;
    data[o + 1] = v;
    data[o + 2] = v;
    data[o + 3] = 255;
  }
  return threshold;
}

const NUMBER_TOKEN_RE = /^\d[\d,.]*$/;

/**
 * Combines two OCR passes of the same image: the Hebrew pass reads labels and field
 * codes well but garbles digits; the digits-only pass reads amounts well.
 * Keeps every non-numeric Hebrew item plus every pure number from the digits pass.
 */
export function mergeOcrPasses(hebrewItems, digitItems) {
  return [
    ...hebrewItems.filter((item) => !NUMBER_TOKEN_RE.test(item.str)),
    ...digitItems.filter((item) => NUMBER_TOKEN_RE.test(item.str)),
  ];
}

/** Characters the digits-only pass may output; parentheses/slash keep codes out of amounts. */
export const DIGIT_WHITELIST = '0123456789,./()';

const HEBREW_RE = /[֐-׿]/;

/** Left edge of a line's label: the right-most run of words, up to the first wide gap. */
function labelLeftOf(line, gapLimit) {
  const words = (line.words ?? []).filter((w) => w.text?.trim()).sort((a, b) => b.bbox.x0 - a.bbox.x0);
  if (!words.some((w) => HEBREW_RE.test(w.text))) return null;
  let left = words[0].bbox.x0;
  for (let i = 1; i < words.length; i += 1) {
    if (words[i - 1].bbox.x0 - words[i].bbox.x1 > gapLimit) break;
    left = words[i].bbox.x0;
  }
  return left;
}

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
};

/**
 * Layout of the amounts table from the Hebrew pass: printouts put every amount in a
 * column to the left of the labels. Re-reading just that column as a block of digits is
 * far more reliable than a whole-page digits pass on low-resolution screenshots.
 *
 * lines: Tesseract lines ({ bbox: {x0,y0,x1,y1}, words: [{ text, bbox }] }) in pixels.
 * Returns { rectangle, lineHeight } or null when no label column is found.
 */
export function amountColumn(lines, imageWidth, imageHeight) {
  const gapLimit = imageWidth * 0.06;
  const labelLines = lines
    .map((line) => ({ line, left: labelLeftOf(line, gapLimit) }))
    // Table rows sit on the right half with a wide gap before their amount.
    .filter(({ left }) => left !== null && left > imageWidth * 0.3);
  if (labelLines.length < 2) return null;

  const lineHeight = median(labelLines.map(({ line }) => line.bbox.y1 - line.bbox.y0));
  const right = Math.round(Math.min(...labelLines.map(({ left }) => left)) - lineHeight * 0.5);
  const top = Math.max(0, Math.min(...labelLines.map(({ line }) => line.bbox.y0)) - lineHeight);
  const bottom = Math.min(imageHeight, Math.max(...labelLines.map(({ line }) => line.bbox.y1)) + lineHeight);
  if (right < imageWidth * 0.05) return null;
  return { rectangle: { left: 0, top, width: right, height: bottom - top }, lineHeight };
}

/** Tesseract output → flat list of its lines. */
export const linesOf = (data) =>
  (data?.blocks ?? []).flatMap((b) => (b.paragraphs ?? []).flatMap((p) => p.lines ?? []));

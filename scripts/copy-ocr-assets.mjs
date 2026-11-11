// Copies the OCR runtime (tesseract.js worker, WASM core and Hebrew/English models) into
// public/tesseract so the admin 106 import can OCR screenshots without any CDN — the
// browser only ever talks to our own origin.
import { access, copyFile, mkdir } from 'node:fs/promises';

const TARGET = 'public/tesseract';
const MODEL_VARIANT = '4.0.0_best_int';

const files = [
  ['node_modules/tesseract.js/dist/worker.min.js', `${TARGET}/worker.min.js`],
  // OEM 1 (LSTM only) — tesseract.js picks one of these by browser SIMD support.
  ...['tesseract-core-lstm', 'tesseract-core-simd-lstm', 'tesseract-core-relaxedsimd-lstm'].map((name) => [
    `node_modules/tesseract.js-core/${name}.wasm.js`,
    `${TARGET}/core/${name}.wasm.js`,
  ]),
  ...['heb', 'eng'].map((lang) => [
    `node_modules/@tesseract.js-data/${lang}/${MODEL_VARIANT}/${lang}.traineddata.gz`,
    `${TARGET}/lang/${lang}.traineddata.gz`,
  ]),
];

await mkdir(`${TARGET}/core`, { recursive: true });
await mkdir(`${TARGET}/lang`, { recursive: true });

const missing = [];
for (const [from, to] of files) {
  try {
    await access(from);
    await copyFile(from, to);
  } catch {
    missing.push(from);
  }
}

if (missing.length) {
  console.warn(`OCR assets missing (run npm install): ${missing.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log(`Copied tesseract.js worker, core and models to ${TARGET}`);
}

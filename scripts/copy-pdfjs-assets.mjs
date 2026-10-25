// Copies pdf.js font data and character maps into public/ so they ship with the site.
// pdf.js falls back to them when a PDF's embedded font can't be used by the browser —
// without them Hebrew text renders with a substitute font and looks broken.
import { cp, mkdir } from 'node:fs/promises';

const SOURCE = 'node_modules/pdfjs-dist';
const TARGET = 'public/pdfjs';

await mkdir(TARGET, { recursive: true });
await cp(`${SOURCE}/standard_fonts`, `${TARGET}/standard_fonts`, { recursive: true });
await cp(`${SOURCE}/cmaps`, `${TARGET}/cmaps`, { recursive: true });
console.log('Copied pdf.js standard fonts and cMaps to public/pdfjs');

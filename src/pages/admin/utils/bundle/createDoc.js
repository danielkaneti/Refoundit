import { CONFIDENCE_THRESHOLD, classifyDocument, introTitleFor } from './documentTypes';
import { extract1301 } from './extract1301';
import { MAX_FILE_BYTES, isImageFile, isPdfFile, readImageInfo, readPdfInfo } from './fileInfo';

let sequence = 0;
export const newDocId = () => `doc-${Date.now().toString(36)}-${(sequence += 1)}`;

/** A bundle row built from a file (or raw PDF bytes, for split pages). */
export function baseDoc({ name, kind, mime, bytes }) {
  return {
    id: newDocId(),
    name,
    kind,
    mime,
    bytes,
    status: 'processing',
    error: null,
    pageCount: 0,
    pages: '',
    thumb: null,
    text: '',
    docType: 'other',
    confidence: 0,
    source: 'none',
    needsConfirmation: false,
    introTitle: name.replace(/\.[^.]+$/, ''),
    ownerName: '',
    includeInIntro: true,
    groupId: null,
  };
}

/**
 * Reads, validates and classifies one file.
 * @returns {{ doc: object, extracted: object | null }} extracted = 1301 data for auto-fill
 */
export async function createDocFromFile(file, taxYear) {
  const kind = isPdfFile(file) ? 'pdf' : isImageFile(file) ? 'image' : null;
  const mime = kind === 'pdf' ? 'application/pdf' : /\.png$/i.test(file.name) || file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const doc = baseDoc({ name: file.name, kind: kind ?? 'unknown', mime, bytes: null });

  if (!kind) return { doc: { ...doc, status: 'invalid', error: 'סוג קובץ לא נתמך (PDF, PNG, JPG בלבד)' }, extracted: null };
  if (file.size > MAX_FILE_BYTES) return { doc: { ...doc, status: 'invalid', error: 'הקובץ גדול מ-25MB' }, extracted: null };

  const bytes = new Uint8Array(await file.arrayBuffer());
  return analyzeDoc({ ...doc, bytes }, taxYear);
}

export async function analyzeDoc(doc, taxYear) {
  const info = doc.kind === 'pdf' ? await readPdfInfo(doc.bytes) : await readImageInfo(new Blob([doc.bytes], { type: doc.mime }));
  const classification = classifyDocument(info.text, doc.name);
  const extracted = classification.docType === 'form_1301' ? extract1301(info.text) : null;
  const year = taxYear || extracted?.taxYear;

  return {
    doc: {
      ...doc,
      ...info,
      ...classification,
      needsConfirmation: classification.confidence < CONFIDENCE_THRESHOLD,
      introTitle: classification.docType === 'other' ? doc.introTitle : introTitleFor(classification.docType, year),
    },
    extracted,
  };
}

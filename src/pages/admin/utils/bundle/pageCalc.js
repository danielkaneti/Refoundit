// ============================================================
// Page numbering for the merged bundle.
// Bundle = intro pages, then each included document's selected pages in order.
// ============================================================

/** "1-3, 5" → [0, 1, 2, 4] (0-based, de-duplicated, in the order written). Empty → all pages. */
export function parsePageSelection(selection, totalPages) {
  const all = Array.from({ length: totalPages }, (_, i) => i);
  if (!selection || !selection.trim()) return all;

  const picked = [];
  for (const part of selection.split(',')) {
    const match = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) return null;
    const from = Number(match[1]);
    const to = Number(match[2] ?? match[1]);
    if (from < 1 || to > totalPages || from > to) return null;
    for (let page = from; page <= to; page += 1) if (!picked.includes(page - 1)) picked.push(page - 1);
  }
  return picked;
}

export const selectedPageCount = (doc) => parsePageSelection(doc.pages, doc.pageCount)?.length ?? 0;

export const isUsable = (doc) => doc.status === 'ok' && selectedPageCount(doc) > 0;

/** Assigns startPage / endPage (1-based, in the bundle) to every usable document. */
export function computeDocumentPages(docs, introPageCount) {
  let next = introPageCount + 1;
  return docs.map((doc) => {
    if (!isUsable(doc)) return { ...doc, startPage: null, endPage: null };
    const count = selectedPageCount(doc);
    const placed = { ...doc, startPage: next, endPage: next + count - 1 };
    next += count;
    return placed;
  });
}

/**
 * Rows of the cover-letter table. Consecutive documents sharing a groupId collapse
 * into one row (title of the first, summed pages). Documents excluded from the
 * intro still occupy pages in the bundle.
 */
export function buildIntroEntries(placedDocs) {
  const entries = [];
  for (const doc of placedDocs) {
    if (!doc.startPage || !doc.includeInIntro) continue;
    const last = entries[entries.length - 1];
    if (doc.groupId && last?.groupId === doc.groupId) {
      last.pageCount += doc.endPage - doc.startPage + 1;
      last.endPage = doc.endPage;
      last.docIds.push(doc.id);
      continue;
    }
    entries.push({
      groupId: doc.groupId ?? null,
      title: doc.ownerName ? `${doc.introTitle} – ${doc.ownerName}` : doc.introTitle,
      pageCount: doc.endPage - doc.startPage + 1,
      startPage: doc.startPage,
      endPage: doc.endPage,
      docIds: [doc.id],
    });
  }
  return entries;
}

export const formatPageRange = (start, end) =>
  start === end ? `עמוד ${start} בחבילה` : `עמ' ${start}-${end} בחבילה`;

export const totalBundlePages = (placedDocs, introPageCount) =>
  placedDocs.reduce((sum, doc) => (doc.startPage ? sum + doc.endPage - doc.startPage + 1 : sum), introPageCount);

/** DD-MM-YYYY */
export function formatDateDMY(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return day && month && year ? `${day}-${month}-${year}` : value;
}

export const bundleTitle = ({ clientName, taxYear }) =>
  `חבילת דיווח- ${clientName || ''} ${taxYear || ''}(1301)`.replace(/\s+/g, ' ').trim();

// ============================================================
// Tax document catalog + local keyword classifier.
// Classification runs entirely in the browser — documents are never sent anywhere.
// ============================================================

export const DOCUMENT_TYPES = [
  { id: 'form_1301', label: 'דוח שנתי (1301)', keywords: ['1301', 'דין וחשבון על הכנסות', 'דוח שנתי', 'דו"ח שנתי', 'לשנת המס'] },
  { id: 'form_106', label: 'טופס 106', keywords: ['106', 'ריכוז שנתי', 'משכורת', 'מעביד', 'מעסיק', 'שכר עבודה'] },
  { id: 'form_867', label: 'טופס 867 (אישור הכנסות ומס במקור)', keywords: ['867', 'ניכוי מס במקור', 'הכנסות מריבית', 'רווח הון', 'בנק', 'ני"ע'] },
  { id: 'form_1399', label: 'טופס 1399 (השבת מס / קיזוז הפסדים)', keywords: ['1399', 'קיזוז הפסדים', 'הודעה על מכירת', 'רווח הון במכירת'] },
  { id: 'form_1322', label: 'טופס 1322 (רווח הון מניירות ערך)', keywords: ['1322', 'ניירות ערך', 'רווח מניירות'] },
  { id: 'tax_results', label: 'תוצאות שומה', keywords: ['שומה', 'הודעת שומה', 'תוצאות', 'פקיד שומה'] },
  { id: 'bituach_leumi', label: 'אישור ביטוח לאומי', keywords: ['ביטוח לאומי', 'המוסד לביטוח', 'דמי אבטלה', 'דמי לידה', 'קצבה'] },
  { id: 'life_insurance', label: 'אישור ביטוח חיים / פנסיה', keywords: ['ביטוח חיים', 'פוליסה', 'קופת גמל', 'פנסיה', 'הפקדות', 'סעיף 45א'] },
  { id: 'credit_points', label: 'אישור לנקודות זיכוי', keywords: ['נקודות זיכוי', 'תושב', 'יישוב מזכה', 'תואר אקדמי', 'חייל משוחרר', 'ילד נטול'] },
  { id: 'donations', label: 'קבלות תרומה (סעיף 46)', keywords: ['תרומה', 'סעיף 46', 'מוסד ציבורי'] },
  { id: 'power_of_attorney', label: 'ייפוי כוח (2279א)', keywords: ['ייפוי כוח', 'ייפוי כח', '2279', 'מייצג ראשי'] },
  { id: 'other', label: 'מסמך אחר', keywords: [] },
];

export const DOC_TYPE_BY_ID = Object.fromEntries(DOCUMENT_TYPES.map((type) => [type.id, type]));

const MIN_TEXT_LENGTH = 40;
export const CONFIDENCE_THRESHOLD = 0.6;

/** Scores keyword hits (and the file name) per type. Returns { docType, confidence, source }. */
export function classifyDocument(text, fileName = '') {
  const haystack = `${text || ''} ${fileName}`.replace(/\s+/g, ' ');
  if (haystack.trim().length < 3) return { docType: 'other', confidence: 0, source: 'none' };

  let best = { docType: 'other', score: 0 };
  let total = 0;
  for (const type of DOCUMENT_TYPES) {
    const score = type.keywords.reduce((sum, keyword) => {
      if (!haystack.includes(keyword)) return sum;
      // Form numbers are strong signals; generic words are weak ones.
      return sum + (/^\d{3,4}$/.test(keyword) ? 3 : 1);
    }, 0);
    total += score;
    if (score > best.score) best = { docType: type.id, score };
  }

  if (!best.score) return { docType: 'other', confidence: 0, source: 'keywords' };
  const dominance = best.score / total;
  const strength = Math.min(1, best.score / 4);
  const textFactor = (text || '').length >= MIN_TEXT_LENGTH ? 1 : 0.7;
  return { docType: best.docType, confidence: +(dominance * strength * textFactor).toFixed(2), source: 'keywords' };
}

export function introTitleFor(docType, taxYear) {
  const label = DOC_TYPE_BY_ID[docType]?.label ?? 'מסמך';
  return taxYear ? `${label} לשנת המס ${taxYear}` : label;
}

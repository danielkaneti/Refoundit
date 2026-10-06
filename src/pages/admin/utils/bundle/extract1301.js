// Regex extraction from a 1301 annual report's text layer.

const ID_RE = /(?<!\d)(\d{9})(?!\d)/;
const TAX_YEAR_LABELLED_RE = /שנת\s*ה?מס\s*:?\s*(20\d{2})/;
const YEAR_RE = /(?<!\d)(20[0-4]\d)(?!\d)/g;

/** Israeli ID checksum (Luhn variant) — filters out random 9-digit numbers. */
export function isValidIsraeliId(id) {
  if (!/^\d{9}$/.test(id)) return false;
  const sum = [...id].reduce((acc, digit, i) => {
    const step = Number(digit) * ((i % 2) + 1);
    return acc + (step > 9 ? step - 9 : step);
  }, 0);
  return sum % 10 === 0;
}

export function extract1301(text = '') {
  const ids = [...text.matchAll(new RegExp(ID_RE, 'g'))].map((m) => m[1]).filter(isValidIsraeliId);

  let taxYear = text.match(TAX_YEAR_LABELLED_RE)?.[1] ?? null;
  if (!taxYear) {
    const years = [...text.matchAll(YEAR_RE)].map((m) => Number(m[1]));
    const currentYear = new Date().getFullYear();
    // The report is filed for a past year — pick the most frequent plausible one.
    const counts = years.filter((y) => y < currentYear).reduce((map, y) => map.set(y, (map.get(y) || 0) + 1), new Map());
    taxYear = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]?.toString() ?? null;
  }

  return { id: ids[0] ?? null, taxYear };
}

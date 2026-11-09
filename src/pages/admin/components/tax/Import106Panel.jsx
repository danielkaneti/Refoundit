import { memo, useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { HiOutlineDocumentAdd } from 'react-icons/hi';
import { read106Pdf } from '../../utils/tax/read106Pdf';
import { FIELD_CODES_106 } from '../../utils/tax/parse106';
import { TAX_YEARS } from '../../utils/tax/taxConstants';
import { formatCurrency } from '../../utils/tax/format';
import { Badge, Card, IconButton, Muted, Row, SubHeading } from '../styles';

const HiddenInput = styled.input`
  display: none;
`;

const Results = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
`;

const ResultItem = styled.li`
  padding: 12px 14px;
  border: 1px solid ${({ theme }) => theme.colors.gray200};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 14px;
  line-height: 1.6;
`;

const FileName = styled.span`
  font-weight: 700;
  word-break: break-all;
`;

const STATUS = {
  ok: { tone: 'signed', label: 'נקרא' },
  partial: { tone: 'pending', label: 'נקרא חלקית' },
  error: { tone: 'warning', label: 'שגיאה' },
};

const LABELS = Object.fromEntries(FIELD_CODES_106.map(({ field, label }) => [field, label]));

function summarize(fields) {
  return Object.entries(fields)
    .map(([field, value]) => `${LABELS[field]}: ${formatCurrency(value)}`)
    .join(' · ');
}

function Import106Panel({ fallbackYear, dispatch }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  const handleFiles = useCallback(
    async (event) => {
      const files = [...(event.target.files ?? [])];
      event.target.value = '';
      if (!files.length) return;
      setBusy(true);
      const batch = [];
      for (const file of files) {
        const result = await read106Pdf(file);
        let note = null;
        if (result.status !== 'error') {
          let year = result.taxYear;
          if (!year) {
            year = fallbackYear;
            note = `שנת המס לא זוהתה — שויך לשנת ${year}. יש לוודא.`;
          }
          if (!TAX_YEARS[year]) {
            batch.push({ ...result, status: 'error', error: `שנת המס ${year} אינה נתמכת` });
            continue;
          }
          const { lifeInsurance, donations, ...employerFields } = result.fields;
          dispatch({
            type: 'importEmployer',
            year,
            employer: {
              name: result.employerName || file.name.replace(/\.pdf$/i, ''),
              ...Object.fromEntries(Object.entries(employerFields).map(([k, v]) => [k, String(v)])),
              rawRows: result.rows ?? [],
            },
            lifeInsurance,
            donations,
          });
          result.importedYear = year;
        }
        batch.push({ ...result, note });
      }
      setResults((prev) => [...batch, ...prev]);
      setBusy(false);
    },
    [dispatch, fallbackYear]
  );

  return (
    <Card aria-labelledby="tax-import-title" style={{ marginBottom: 24 }} data-print-hide>
      <Row style={{ justifyContent: 'space-between' }}>
        <div>
          <SubHeading id="tax-import-title" style={{ marginBottom: 4 }}>
            ייבוא טופסי 106 מ-PDF
          </SubHeading>
          <Muted>
            הקבצים נקראים בדפדפן בלבד ואינם נשלחים לשרת. נתמכים קובצי PDF דיגיטליים (לא סריקות). יש לבדוק את
            הערכים שנקלטו מול הטופס.
          </Muted>
        </div>
        <IconButton
          id="tax-import-106"
          type="button"
          onClick={openPicker}
          disabled={busy}
          aria-busy={busy || undefined}
        >
          {busy ? 'קורא קבצים…' : 'בחירת קבצים'}
          <HiOutlineDocumentAdd aria-hidden="true" />
        </IconButton>
        <HiddenInput
          ref={inputRef}
          id="tax-import-106-input"
          type="file"
          accept="application/pdf,.pdf"
          multiple
          onChange={handleFiles}
          aria-label="בחירת קובצי טופס 106"
        />
      </Row>

      {results.length > 0 && (
        <Results aria-live="polite" aria-label="תוצאות ייבוא">
          {results.map((r, index) => (
            <ResultItem key={`${r.fileName}-${index}`}>
              <Row>
                <FileName>{r.fileName}</FileName>
                <Badge $tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge>
                {r.importedYear && <Badge $tone="expired">שנת {r.importedYear}</Badge>}
              </Row>
              {r.error && <Muted>{r.error}</Muted>}
              {r.fields && r.status !== 'error' && <Muted>{summarize(r.fields)}</Muted>}
              {r.missing?.length > 0 && r.status !== 'error' && <Muted>לא נמצאו: {r.missing.join(', ')}</Muted>}
              {r.note && <Muted>{r.note}</Muted>}
            </ResultItem>
          ))}
        </Results>
      )}
    </Card>
  );
}

export default memo(Import106Panel);

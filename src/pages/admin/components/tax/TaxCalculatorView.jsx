import { useCallback, useMemo, useReducer, useState } from 'react';
import styled, { createGlobalStyle, css } from 'styled-components';
import { HiOutlinePlus, HiOutlinePrinter, HiOutlineRefresh, HiOutlineTable, HiOutlineX } from 'react-icons/hi';
import { calculateAllYears } from '../../utils/tax/taxEngine';
import { SUPPORTED_YEARS } from '../../utils/tax/taxConstants';
import { formatCurrency } from '../../utils/tax/format';
import { Card, FieldLabel, Heading, IconButton, Muted, Row, Select } from '../styles';
import { initialState, taxCalculatorReducer } from './taxCalculatorState';
import Import106Panel from './Import106Panel';
import SalarySummaryDialog from './SalarySummaryDialog';
import TaxYearForm from './TaxYearForm';
import TaxYearResult from './TaxYearResult';

const PrintStyles = createGlobalStyle`
  @media print {
    header, [data-print-hide] { display: none !important; }
    /* With the salary summary open, print only the summary. */
    #main-content:has(> dialog[open]) > :not(dialog) { display: none !important; }
    body { background: #fff; }
  }
`;

const Layout = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: minmax(0, 1fr) 420px;
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const Summary = styled(Card)`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
`;

const SummaryValue = styled.strong`
  display: block;
  font-size: 28px;
  font-weight: 900;
  color: ${({ $negative, theme }) => ($negative ? theme.colors.danger : theme.colors.success)};
`;

const YearTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 20px;
`;

const YearTab = styled.div`
  display: inline-flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 2px solid ${({ theme }) => theme.colors.gray200};
  background: ${({ theme }) => theme.colors.white};
  overflow: hidden;

  ${({ $active, theme }) =>
    $active &&
    css`
      border-color: ${theme.colors.teal};
      background: rgba(0, 180, 160, 0.08);
    `}

  button {
    background: transparent;
    border: none;
    cursor: pointer;
    font-family: inherit;
    color: ${({ theme }) => theme.colors.navy};
  }
`;

const YearTabLabel = styled.button`
  padding: 8px 16px;
  font-weight: 700;
  font-size: 15px;
  display: inline-flex;
  gap: 8px;
  align-items: baseline;

  small {
    font-weight: 600;
    font-size: 12px;
    color: ${({ $tone, theme }) => ($tone === 'debt' ? theme.colors.danger : theme.colors.success)};
  }
`;

const YearTabRemove = styled.button`
  padding: 8px 10px 8px 12px;
  display: inline-flex;
  color: ${({ theme }) => theme.colors.gray500} !important;
`;

const AddYear = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  select {
    width: auto;
    padding: 8px 12px;
    font-size: 14px;
  }
`;

export default function TaxCalculatorView() {
  const [state, dispatch] = useReducer(taxCalculatorReducer, undefined, initialState);
  const usedYears = useMemo(() => state.years.map((y) => y.year), [state.years]);
  const availableYears = useMemo(() => SUPPORTED_YEARS.filter((y) => !usedYears.includes(y)), [usedYears]);
  const [yearToAdd, setYearToAdd] = useState('');

  const { years: results, totals } = useMemo(() => calculateAllYears(state.years), [state.years]);
  const resultByYear = useMemo(() => new Map(results.map((r) => [r.year, r])), [results]);

  const activeYear = state.years.find((y) => y.id === state.activeId) ?? state.years[0];
  const activeResult = resultByYear.get(activeYear.year);
  const sortedYears = useMemo(() => [...state.years].sort((a, b) => b.year - a.year), [state.years]);

  const handleAddYear = useCallback(() => {
    const year = Number(yearToAdd) || availableYears[0];
    if (!year) return;
    dispatch({ type: 'addYear', year });
    setYearToAdd('');
  }, [availableYears, yearToAdd]);
  const handleYearToAdd = useCallback((event) => setYearToAdd(event.target.value), []);
  const handleReset = useCallback(() => {
    if (window.confirm('לנקות את כל הנתונים שהוזנו?')) dispatch({ type: 'reset' });
  }, []);
  const handlePrint = useCallback(() => window.print(), []);
  const [showSummary, setShowSummary] = useState(false);
  const openSummary = useCallback(() => setShowSummary(true), []);
  const closeSummary = useCallback(() => setShowSummary(false), []);

  return (
    <>
      <PrintStyles />
      <Heading>מחשבון מס הכנסה</Heading>
      <Muted data-print-hide style={{ marginBottom: 20 }}>
        חישוב החזר מס לשכירים לפי טופסי 106, תשלומי ביטוח לאומי וטופס 867. הנתונים נשמרים בדפדפן זה בלבד עד לרענון
        הדף ואינם נשלחים לשרת. התוצאה היא הערכה — יש לאמת מול רשות המסים לפני הגשה.
      </Muted>

      <Summary aria-label="סיכום כל השנים">
        <div>
          <Muted as="span">סה״כ {totals.refund >= 0 ? 'החזר' : 'חוב'} ב-{results.length} שנים</Muted>
          <SummaryValue $negative={totals.refund < 0} aria-live="polite">
            {formatCurrency(Math.abs(totals.refund))}
          </SummaryValue>
          {totals.withInterest > totals.refund && (
            <Muted as="span">כולל ריבית והצמדה (הערכה): {formatCurrency(totals.withInterest)}</Muted>
          )}
        </div>
        <Row data-print-hide>
          <IconButton
            id="tax-salary-summary"
            type="button"
            onClick={openSummary}
            aria-haspopup="dialog"
            aria-expanded={showSummary}
          >
            ריכוז נתוני שכר
            <HiOutlineTable aria-hidden="true" />
          </IconButton>
          <IconButton id="tax-print" type="button" onClick={handlePrint}>
            הדפסה
            <HiOutlinePrinter aria-hidden="true" />
          </IconButton>
          <IconButton id="tax-reset" type="button" $danger onClick={handleReset}>
            ניקוי
            <HiOutlineRefresh aria-hidden="true" />
          </IconButton>
        </Row>
      </Summary>

      <Import106Panel fallbackYear={activeYear.year} dispatch={dispatch} />

      <YearTabs role="tablist" aria-label="שנות מס" data-print-hide>
        {sortedYears.map((y) => {
          const result = resultByYear.get(y.year);
          const isActive = y.id === activeYear.id;
          const refund = result && !result.error ? result.refund : null;
          return (
            <YearTab key={y.id} $active={isActive}>
              <YearTabLabel
                id={`tax-year-tab-${y.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="tax-year-panel"
                $tone={refund < 0 ? 'debt' : 'refund'}
                onClick={() => dispatch({ type: 'selectYear', yearId: y.id })}
              >
                {y.year}
                {refund !== null && refund !== 0 && <small>{formatCurrency(refund)}</small>}
              </YearTabLabel>
              {state.years.length > 1 && (
                <YearTabRemove
                  id={`tax-year-remove-${y.id}`}
                  type="button"
                  aria-label={`הסרת שנת ${y.year}`}
                  onClick={() => dispatch({ type: 'removeYear', yearId: y.id })}
                >
                  <HiOutlineX aria-hidden="true" />
                </YearTabRemove>
              )}
            </YearTab>
          );
        })}
        {availableYears.length > 0 && (
          <AddYear>
            <FieldLabel htmlFor="tax-add-year" className="sr-only">
              שנה להוספה
            </FieldLabel>
            <Select id="tax-add-year" value={yearToAdd} onChange={handleYearToAdd}>
              <option value="">{availableYears[0]}</option>
              {availableYears.slice(1).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
            <IconButton id="tax-add-year-button" type="button" onClick={handleAddYear}>
              הוספת שנה
              <HiOutlinePlus aria-hidden="true" />
            </IconButton>
          </AddYear>
        )}
      </YearTabs>

      <SalarySummaryDialog open={showSummary} years={state.years} onClose={closeSummary} />

      <Layout id="tax-year-panel" role="tabpanel" aria-labelledby={`tax-year-tab-${activeYear.id}`}>
        <Card data-print-hide>
          <TaxYearForm key={activeYear.id} yearInput={activeYear} usedYears={usedYears} dispatch={dispatch} />
        </Card>
        <TaxYearResult result={activeResult} />
      </Layout>
    </>
  );
}

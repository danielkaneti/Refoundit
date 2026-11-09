import { memo, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { HiOutlinePrinter, HiOutlineX } from 'react-icons/hi';
import { buildSalarySummary } from '../../utils/tax/salarySummary';
import { formatCurrency } from '../../utils/tax/format';
import { IconButton, Muted, Row, SubHeading } from '../styles';

const Dialog = styled.dialog`
  width: min(1100px, calc(100vw - 24px));
  max-height: calc(100vh - 48px);
  border: none;
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 24px;
  margin: auto;

  &::backdrop {
    background: rgba(10, 22, 40, 0.6);
  }

  @media print {
    position: static;
    width: 100%;
    max-height: none;
    padding: 0;
    [data-dialog-actions] {
      display: none;
    }
  }
`;

const DialogHeader = styled(Row)`
  justify-content: space-between;
  margin-bottom: 16px;
`;

const YearSection = styled.section`
  & + & {
    margin-top: 28px;
  }
`;

const Scroll = styled.div`
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.gray200};
  border-radius: ${({ theme }) => theme.radii.md};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th,
  td {
    padding: 10px 12px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray100};
    text-align: start;
    white-space: nowrap;
  }

  thead th {
    background: ${({ theme }) => theme.colors.offWhite};
    font-weight: 700;
    position: sticky;
    top: 0;
  }

  td[data-num],
  th[data-num] {
    text-align: end;
    font-variant-numeric: tabular-nums;
  }

  td[data-label] {
    white-space: normal;
    min-width: 200px;
  }

  [data-total] {
    font-weight: 800;
    background: rgba(0, 180, 160, 0.06);
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
`;

const Code = styled.span`
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.navyMid};
`;

const Empty = styled.span`
  color: ${({ theme }) => theme.colors.gray300};
`;

const cell = (value) => (value === null ? <Empty aria-label="אין ערך">—</Empty> : formatCurrency(value));

const YearTable = memo(function YearTable({ yearInput }) {
  const { columns, rows } = useMemo(() => buildSalarySummary(yearInput), [yearInput]);
  const titleId = `salary-summary-${yearInput.id}`;

  return (
    <YearSection aria-labelledby={titleId}>
      <SubHeading id={titleId}>
        שנת מס {yearInput.year} ({columns.length} {columns.length === 1 ? 'טופס' : 'טפסים'})
      </SubHeading>
      <Scroll>
        <Table>
          <thead>
            <tr>
              <th scope="col">מספר שדה</th>
              <th scope="col">תיאור</th>
              {columns.map((c) => (
                <th key={c.id} scope="col" data-num>
                  {c.name}
                </th>
              ))}
              <th scope="col" data-num data-total>
                סה״כ כל הטפסים
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td>{row.code ? <Code dir="ltr">{row.code}</Code> : <Empty>—</Empty>}</td>
                <td data-label>{row.label}</td>
                {row.values.map((value, i) => (
                  <td key={columns[i].id} data-num>
                    {cell(value)}
                  </td>
                ))}
                <td data-num data-total>
                  {row.hasValue ? formatCurrency(row.total) : <Empty>—</Empty>}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Scroll>
    </YearSection>
  );
});

function SalarySummaryDialog({ open, years, onClose }) {
  const dialogRef = useRef(null);
  const sortedYears = useMemo(() => [...years].sort((a, b) => b.year - a.year), [years]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <Dialog ref={dialogRef} onClose={onClose} aria-labelledby="salary-summary-title">
      <DialogHeader>
        <SubHeading id="salary-summary-title" as="h2" style={{ marginBottom: 0 }}>
          ריכוז נתוני שכר
        </SubHeading>
        <Row data-dialog-actions>
          <IconButton id="salary-summary-print" type="button" onClick={() => window.print()}>
            הדפסה
            <HiOutlinePrinter aria-hidden="true" />
          </IconButton>
          <IconButton id="salary-summary-close" type="button" onClick={onClose} aria-label="סגירת ריכוז נתוני שכר">
            סגירה
            <HiOutlineX aria-hidden="true" />
          </IconButton>
        </Row>
      </DialogHeader>
      <Muted style={{ marginBottom: 16 }}>
        כל השדות מכל טופסי 106 לפי שנה. שדות שנקלטו מקובץ PDF מוצגים כפי שהודפסו בטופס; ערכי 158, 042, 045 ו-244
        מוצגים כפי שהם מעודכנים כעת במחשבון.
      </Muted>
      {open && sortedYears.map((y) => <YearTable key={y.id} yearInput={y} />)}
    </Dialog>
  );
}

export default memo(SalarySummaryDialog);

import { memo } from 'react';
import styled, { css } from 'styled-components';
import { HiOutlineExclamation } from 'react-icons/hi';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/tax/format';
import { Card, ErrorText, Muted, SubHeading } from '../styles';

const toneColor = ({ $tone, theme }) =>
  ({ refund: theme.colors.success, debt: theme.colors.danger })[$tone] ?? theme.colors.gray500;

const Panel = styled(Card)`
  position: sticky;
  top: 88px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    position: static;
  }
`;

const Headline = styled.div`
  padding: 20px;
  border-radius: ${({ theme }) => theme.radii.md};
  text-align: center;
  border: 2px solid ${toneColor};
  background: ${({ theme }) => theme.colors.offWhite};

  strong {
    display: block;
    font-size: clamp(28px, 4vw, 36px);
    font-weight: 900;
    color: ${toneColor};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th,
  td {
    padding: 8px 4px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray100};
    text-align: start;
  }

  td:last-child,
  th:last-child {
    text-align: end;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  caption {
    text-align: start;
    font-weight: 700;
    margin-bottom: 8px;
  }
`;

const Line = styled.tr`
  ${({ $total, theme }) =>
    $total &&
    css`
      font-weight: 800;
      td {
        border-top: 2px solid ${theme.colors.gray200};
      }
    `}
  ${({ $sub, theme }) =>
    $sub &&
    css`
      color: ${theme.colors.gray500};
      td:first-child {
        padding-inline-start: 16px;
      }
    `}
`;

const Warnings = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;

  li {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    padding: 10px 12px;
    border-radius: ${({ theme }) => theme.radii.sm};
    background: rgba(245, 166, 35, 0.12);
    color: #7a4e00;
    font-size: 13px;
    line-height: 1.5;
  }

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const money = (value) => formatCurrency(value);
const minus = (value) => (value ? `−${formatCurrency(value)}` : formatCurrency(0));

function TaxYearResult({ result }) {
  if (!result) return null;
  if (result.error) {
    return (
      <Panel aria-live="polite">
        <ErrorText role="alert">{result.error}</ErrorText>
      </Panel>
    );
  }

  const { refund, credits, capital, withheld, interest } = result;
  const tone = refund > 0 ? 'refund' : refund < 0 ? 'debt' : 'neutral';
  const headlineLabel = refund > 0 ? 'החזר מס צפוי' : refund < 0 ? 'חוב מס צפוי' : 'אין החזר או חוב';
  const titleId = `tax-result-${result.year}-title`;

  return (
    <Panel aria-labelledby={titleId}>
      <SubHeading id={titleId}>תוצאת חישוב — {result.year}</SubHeading>

      <Headline $tone={tone} aria-live="polite" aria-atomic="true">
        <Muted as="span">{headlineLabel}</Muted>
        <strong>{formatCurrency(Math.abs(refund))}</strong>
        {interest.total > refund && (
          <Muted as="span">
            כולל ריבית והצמדה (הערכה): {formatCurrency(interest.total)}
          </Muted>
        )}
      </Headline>

      {result.warnings.length > 0 && (
        <Warnings aria-label="הערות לחישוב">
          {result.warnings.map((warning) => (
            <li key={warning}>
              {warning}
              <HiOutlineExclamation aria-hidden="true" />
            </li>
          ))}
        </Warnings>
      )}

      <Table>
        <caption>פירוט החישוב</caption>
        <tbody>
          <Line>
            <td>הכנסה חייבת (שכר + ביטוח לאומי)</td>
            <td>{money(result.taxableIncome)}</td>
          </Line>
          <Line>
            <td>מס לפי מדרגות (שולי {formatPercent(result.marginalRate)})</td>
            <td>{money(result.incomeTax)}</td>
          </Line>
          {capital.tax > 0 && (
            <Line>
              <td>מס על הכנסות הון</td>
              <td>{money(capital.tax)}</td>
            </Line>
          )}
          <Line>
            <td>
              נקודות זיכוי ({formatNumber(credits.points)} × {formatCurrency(result.creditPointValue)})
            </td>
            <td>{minus(credits.pointsValue)}</td>
          </Line>
          {credits.pension > 0 && (
            <Line>
              <td>זיכוי הפקדות לקצבה (35%)</td>
              <td>{minus(credits.pension)}</td>
            </Line>
          )}
          {credits.lifeInsurance > 0 && (
            <Line>
              <td>זיכוי ביטוח חיים (25%)</td>
              <td>{minus(credits.lifeInsurance)}</td>
            </Line>
          )}
          {credits.donations > 0 && (
            <Line>
              <td>זיכוי תרומות (35%)</td>
              <td>{minus(credits.donations)}</td>
            </Line>
          )}
          {credits.other > 0 && (
            <Line>
              <td>זיכויים אחרים</td>
              <td>{minus(credits.other)}</td>
            </Line>
          )}
          <Line $total>
            <td>מס לתשלום</td>
            <td>{money(result.taxDue)}</td>
          </Line>
          <Line>
            <td>מס שנוכה בפועל</td>
            <td>{money(withheld.total)}</td>
          </Line>
          {withheld.bituachLeumi > 0 && (
            <Line $sub>
              <td>מתוכו ביטוח לאומי</td>
              <td>{money(withheld.bituachLeumi)}</td>
            </Line>
          )}
          {withheld.capital > 0 && (
            <Line $sub>
              <td>מתוכו 867</td>
              <td>{money(withheld.capital)}</td>
            </Line>
          )}
          <Line $total>
            <td>{refund >= 0 ? 'החזר' : 'חוב'}</td>
            <td>{money(Math.abs(refund))}</td>
          </Line>
        </tbody>
      </Table>

      {capital.income > 0 && (
        <Table>
          <caption>הכנסות הון (867)</caption>
          <tbody>
            <Line>
              <td>רווח הון נטו (אחרי קיזוז)</td>
              <td>{money(capital.taxableGains)}</td>
            </Line>
            <Line>
              <td>דיבידנד (25%)</td>
              <td>{money(capital.taxableDividends)}</td>
            </Line>
            <Line>
              <td>ריבית (15%)</td>
              <td>{money(capital.taxableInterest)}</td>
            </Line>
            <Line $total>
              <td>מס על הכנסות הון</td>
              <td>{money(capital.tax)}</td>
            </Line>
          </tbody>
        </Table>
      )}

      {result.brackets.length > 0 && (
        <Table>
          <caption>מדרגות מס</caption>
          <thead>
            <tr>
              <th scope="col">טווח הכנסה</th>
              <th scope="col">שיעור</th>
              <th scope="col">מס</th>
            </tr>
          </thead>
          <tbody>
            {result.brackets.map((b) => (
              <tr key={b.from}>
                <td>
                  <bdi dir="ltr">
                    {formatNumber(b.from)} – {formatNumber(b.to)}
                  </bdi>
                </td>
                <td>{formatPercent(b.rate)}</td>
                <td>{money(b.tax)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {interest.monthsElapsed > 0 && (
        <Table>
          <caption>ריבית והצמדה (הערכה)</caption>
          <tbody>
            <Line>
              <td>הפרשי הצמדה (מקדם {interest.indexationFactor})</td>
              <td>{money(interest.indexation)}</td>
            </Line>
            <Line>
              <td>ריבית 4% ל-{interest.monthsElapsed} חודשים</td>
              <td>{money(interest.interest)}</td>
            </Line>
            <Line $total>
              <td>סה״כ כולל ריבית והצמדה</td>
              <td>{money(interest.total)}</td>
            </Line>
          </tbody>
        </Table>
      )}
    </Panel>
  );
}

export default memo(TaxYearResult);

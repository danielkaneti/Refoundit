import { memo } from 'react';
import styled from 'styled-components';
import { Input } from '@components/ui';
import { Card, Muted, SubHeading } from '../styles';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const TitlePreview = styled.p`
  margin-top: 20px;
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.offWhite};
  font-weight: 700;
  color: #1e3a5f;
`;

function DetailsStep({ packageData, onChange, title }) {
  return (
    <Card style={{ maxWidth: 820 }} aria-labelledby="bundle-details-title">
      <SubHeading id="bundle-details-title">פרטי החבילה</SubHeading>
      <Muted>אם יועלה דוח 1301, מספר התיק ושנת המס ימולאו ממנו אוטומטית (רק אם השדות ריקים).</Muted>
      <Grid>
        <Input
          id="bundle-client-name"
          label="שם הלקוח"
          required
          value={packageData.clientName}
          onChange={(e) => onChange({ clientName: e.target.value })}
        />
        <Input
          id="bundle-case-number"
          label="מספר תיק"
          dir="ltr"
          inputMode="numeric"
          value={packageData.caseNumber}
          onChange={(e) => onChange({ caseNumber: e.target.value.replace(/[^\d]/g, '').slice(0, 12) })}
        />
        <Input
          id="bundle-tax-year"
          label="שנת המס"
          dir="ltr"
          inputMode="numeric"
          value={packageData.taxYear}
          onChange={(e) => onChange({ taxYear: e.target.value.replace(/[^\d]/g, '').slice(0, 4) })}
        />
        <Input
          id="bundle-doc-date"
          label="תאריך המסמך"
          type="date"
          dir="ltr"
          value={packageData.docDate}
          onChange={(e) => onChange({ docDate: e.target.value })}
        />
      </Grid>
      <Input
        id="bundle-notes"
        label="הערות (יופיעו במכתב המקדים, אופציונלי)"
        textarea
        value={packageData.notes}
        onChange={(e) => onChange({ notes: e.target.value.slice(0, 1000) })}
      />
      <TitlePreview aria-live="polite">כותרת החבילה: {title}</TitlePreview>
    </Card>
  );
}

export default memo(DetailsStep);

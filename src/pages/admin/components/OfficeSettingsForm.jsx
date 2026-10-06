import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button, Input } from '@components/ui';
import { useOfficeSettings, useSaveOfficeSettings } from '../api/settings';
import { Card, ErrorText, FieldLabel, Muted, Row, SubHeading } from './styles';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const FIELDS = [
  { key: 'officeName', label: 'שם המשרד', required: true },
  { key: 'tagline', label: 'שורת תיאור (ליד הלוגו)' },
  { key: 'contactName', label: 'שם איש הקשר (בחתימה)' },
  { key: 'contactTitle', label: 'תואר (למשל רו"ח)' },
  { key: 'phone', label: 'טלפון', dir: 'ltr' },
  { key: 'email', label: 'אימייל', dir: 'ltr' },
  { key: 'address', label: 'כתובת' },
  { key: 'closingText', label: 'נוסח סיום (למשל "בכבוד רב,")' },
];

export default function OfficeSettingsForm() {
  const office = useOfficeSettings();
  const save = useSaveOfficeSettings();
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (office.data && !form) setForm(office.data);
  }, [form, office.data]);

  const update = useCallback((key, value) => setForm((prev) => ({ ...prev, [key]: value })), []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (form?.officeName?.trim()) save.mutate(form);
    },
    [form, save]
  );

  return (
    <Card as="form" style={{ maxWidth: 720, marginTop: 24 }} onSubmit={handleSubmit} aria-labelledby="office-settings-title" noValidate>
      <SubHeading id="office-settings-title">פרטי המשרד (לחבילת המסמכים)</SubHeading>
      <Muted>מופיעים במכתב המקדים ובשורת הפרטים בתחתית כל עמוד בחבילה.</Muted>
      {!form ? (
        <Muted role="status">טוען…</Muted>
      ) : (
        <>
          <Grid>
            {FIELDS.map((field) => (
              <Input
                key={field.key}
                id={`office-${field.key}`}
                label={field.label}
                required={field.required}
                dir={field.dir}
                value={form[field.key] ?? ''}
                onChange={(e) => update(field.key, e.target.value)}
              />
            ))}
          </Grid>
          <Input
            id="office-bodyText"
            label="משפט פתיחה במכתב"
            textarea
            value={form.bodyText ?? ''}
            onChange={(e) => update('bodyText', e.target.value)}
          />
          <div style={{ marginTop: 16 }}>
            <FieldLabel htmlFor="office-primaryColor">צבע ראשי</FieldLabel>
            <input
              id="office-primaryColor"
              type="color"
              value={form.primaryColor}
              onChange={(e) => update('primaryColor', e.target.value)}
            />
          </div>
          {save.error && <ErrorText role="alert">{save.error.message}</ErrorText>}
          <Row style={{ marginTop: 20 }}>
            <Button id="office-save" type="submit" size="sm" disabled={save.isPending || !form.officeName?.trim()}>
              {save.isPending ? 'שומר…' : 'שמירת פרטי המשרד'}
            </Button>
            {save.isSuccess && <Muted role="status">נשמר ✓</Muted>}
          </Row>
        </>
      )}
    </Card>
  );
}

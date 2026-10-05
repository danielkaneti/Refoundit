import { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { Button, Input } from '@components/ui';
import { FIELD_TYPES } from '@shared/pdfGeometry';
import { TEMPLATE_PRESETS } from '@shared/presets';
import { useDeleteTemplate, useTemplates, useUploadTemplate } from '../api/templates';
import { Card, ErrorText, FieldLabel, Heading, IconButton, Muted, Row, Select, SubHeading } from './styles';

const Grid = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: minmax(0, 1fr) 360px;
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const List = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Item = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.gray200};
  border-radius: ${({ theme }) => theme.radii.md};
`;

const FileInput = styled.input`
  width: 100%;
  font-size: 14px;
`;

export default function TemplatesView({ onEdit }) {
  const templates = useTemplates();
  const upload = useUploadTemplate();
  const remove = useDeleteTemplate();
  const fileRef = useRef(null);
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [presetId, setPresetId] = useState(TEMPLATE_PRESETS[0]?.id ?? '');

  const handleUpload = useCallback(
    (event) => {
      event.preventDefault();
      if (!name.trim() || !file) return;
      upload.mutate(
        { name: name.trim(), file, presetId },
        {
          onSuccess: (template) => {
            setName('');
            setFile(null);
            if (fileRef.current) fileRef.current.value = '';
            onEdit(template.id);
          },
        }
      );
    },
    [file, name, onEdit, presetId, upload]
  );

  const handleDelete = useCallback(
    (template) => {
      if (window.confirm(`למחוק את התבנית "${template.name}"? מסמכים שכבר נשלחו לא יימחקו.`)) {
        remove.mutate(template.id);
      }
    },
    [remove]
  );

  return (
    <>
      <Heading>תבניות מסמכים</Heading>
      <Grid>
        <Card aria-labelledby="templates-list-title">
          <SubHeading id="templates-list-title">התבניות שלי</SubHeading>
          {templates.isLoading && <Muted role="status">טוען…</Muted>}
          {templates.error && <ErrorText role="alert">{templates.error.message}</ErrorText>}
          {templates.data?.length === 0 && <Muted>עדיין אין תבניות. העלו PDF כדי להתחיל.</Muted>}
          <List>
            {templates.data?.map((template) => {
              const count = (type) => template.fields.filter((f) => f.type === type).length;
              return (
                <Item key={template.id}>
                  <div>
                    <strong>{template.name}</strong>
                    <Muted>
                      {template.pageCount} עמודים · {count(FIELD_TYPES.signature)} מקומות חתימה ללקוח ·{' '}
                      {template.fields.length - count(FIELD_TYPES.signature)} שדות אוטומטיים
                    </Muted>
                  </div>
                  <Row>
                    <IconButton
                      id={`template-edit-${template.id}`}
                      type="button"
                      onClick={() => onEdit(template.id)}
                      aria-label={`עריכת שדות בתבנית ${template.name}`}
                    >
                      עריכת שדות
                      <HiOutlinePencil aria-hidden="true" />
                    </IconButton>
                    <IconButton
                      id={`template-delete-${template.id}`}
                      type="button"
                      $danger
                      onClick={() => handleDelete(template)}
                      disabled={remove.isPending}
                      aria-label={`מחיקת התבנית ${template.name}`}
                    >
                      <HiOutlineTrash aria-hidden="true" />
                    </IconButton>
                  </Row>
                </Item>
              );
            })}
          </List>
        </Card>

        <Card as="form" onSubmit={handleUpload} aria-labelledby="template-upload-title" noValidate>
          <SubHeading id="template-upload-title">העלאת תבנית חדשה</SubHeading>
          <Muted>העלו את קובץ ה-PDF (למשל טופס ייפוי הכוח), ואז סמנו עליו איפה ימולאו פרטי הלקוח ואיפה הלקוח יחתום.</Muted>
          <div style={{ marginTop: 16 }}>
            <FieldLabel htmlFor="template-preset">סימון שדות</FieldLabel>
            <Select
              id="template-preset"
              value={presetId}
              onChange={(event) => {
                setPresetId(event.target.value);
                const preset = TEMPLATE_PRESETS.find((p) => p.id === event.target.value);
                if (preset && !name.trim()) setName(preset.name);
              }}
            >
              {TEMPLATE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  מוכן מראש: {preset.name}
                </option>
              ))}
              <option value="">ללא, אסמן בעצמי</option>
            </Select>
          </div>
          <Input
            id="template-name"
            label="שם התבנית"
            required
            placeholder={TEMPLATE_PRESETS.find((p) => p.id === presetId)?.name ?? 'ייפוי כוח מייצג'}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <div style={{ marginTop: 16 }}>
            <FieldLabel htmlFor="template-file">קובץ PDF</FieldLabel>
            <FileInput
              ref={fileRef}
              id="template-file"
              type="file"
              accept="application/pdf"
              aria-required="true"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </div>
          {upload.error && <ErrorText role="alert">{upload.error.message}</ErrorText>}
          <div style={{ marginTop: 20 }}>
            <Button
              id="template-upload-submit"
              type="submit"
              fullWidth
              disabled={upload.isPending || !name.trim() || !file}
            >
              {upload.isPending ? 'מעלה…' : 'העלאה והמשך לסימון שדות'}
            </Button>
          </div>
        </Card>
      </Grid>
    </>
  );
}

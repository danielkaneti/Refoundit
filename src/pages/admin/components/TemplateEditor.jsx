import { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';
import { LuPenLine } from 'react-icons/lu';
import { Button, Input } from '@components/ui';
import FieldBox from '@components/pdf/FieldBox';
import PdfPages from '@components/pdf/PdfPages';
import { CHECK_MARKS, DATE_WHEN, FIELD_TYPES, clamp } from '@shared/pdfGeometry';
import { useSaveTemplate, useTemplatePdf, useTemplates } from '../api/templates';
import {
  EditorLayout,
  ErrorText,
  FieldLabel,
  Heading,
  IconButton,
  Muted,
  PdfArea,
  Row,
  Select,
  Sidebar,
  SubHeading,
} from './styles';

const DEFAULT_SIZE = {
  [FIELD_TYPES.text]: { w: 0.3, h: 0.025 },
  [FIELD_TYPES.signature]: { w: 0.28, h: 0.07 },
  [FIELD_TYPES.ownerSignature]: { w: 0.2, h: 0.06 },
  [FIELD_TYPES.date]: { w: 0.1, h: 0.02 },
  [FIELD_TYPES.check]: { w: 0.02, h: 0.015 },
};

const TOOLS = [
  { type: FIELD_TYPES.text, label: 'טקסט / פרטי לקוח' },
  { type: FIELD_TYPES.signature, label: 'חתימת לקוח' },
  { type: FIELD_TYPES.ownerSignature, label: 'חתימת המייצג' },
  { type: FIELD_TYPES.date, label: 'תאריך' },
  { type: FIELD_TYPES.check, label: 'סימון V / X' },
];

const TYPE_NAMES = {
  [FIELD_TYPES.text]: 'טקסט',
  [FIELD_TYPES.signature]: 'חתימת לקוח',
  [FIELD_TYPES.ownerSignature]: 'חתימת המייצג',
  [FIELD_TYPES.date]: 'תאריך',
  [FIELD_TYPES.check]: 'סימון',
};

const NEW_FIELD_DEFAULTS = {
  [FIELD_TYPES.text]: { fontSize: 11, defaultValue: '' },
  [FIELD_TYPES.date]: { fontSize: 10, when: DATE_WHEN.sign },
  [FIELD_TYPES.check]: { mark: CHECK_MARKS.v },
};

function boxCaption(field) {
  if (field.type === FIELD_TYPES.check) return field.mark === CHECK_MARKS.x ? 'X' : 'V';
  if (field.type === FIELD_TYPES.date) return field.when === DATE_WHEN.sign ? 'תאריך חתימה' : 'תאריך';
  if (field.type === FIELD_TYPES.text) return field.label || 'שדה';
  return TYPE_NAMES[field.type];
}

const PlacementLayer = styled.div`
  position: absolute;
  inset: 0;
  ${({ $placing }) =>
    $placing &&
    css`
      cursor: crosshair;
      background: rgba(0, 180, 160, 0.06);
    `}
`;

const FieldList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldListButton = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ $selected, theme }) => ($selected ? theme.colors.teal : theme.colors.gray200)};
  background: ${({ $selected }) => ($selected ? 'rgba(0,180,160,0.08)' : 'transparent')};
  font-size: 14px;
  text-align: right;
  cursor: pointer;
`;

const Hint = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.tealDark};
  font-weight: 600;
`;

const Saved = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.success};
`;

const fieldTitle = (field) => field.label || TYPE_NAMES[field.type];

export default function TemplateEditor({ templateId, onBack }) {
  const templates = useTemplates();
  const template = useMemo(
    () => templates.data?.find((item) => item.id === templateId),
    [templateId, templates.data]
  );
  const pdf = useTemplatePdf(templateId);
  const save = useSaveTemplate();

  const [name, setName] = useState('');
  const [fields, setFields] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [tool, setTool] = useState(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!template) return;
    setName(template.name);
    setFields(template.fields);
    setDirty(false);
  }, [template]);

  const selected = useMemo(() => fields.find((f) => f.id === selectedId), [fields, selectedId]);

  const updateField = useCallback((id, patch) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    setDirty(true);
  }, []);

  const deleteField = useCallback((id) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    setSelectedId(null);
    setDirty(true);
  }, []);

  const handleLayerPointerDown = useCallback(
    (event, page) => {
      if (!tool) {
        setSelectedId(null);
        return;
      }
      const rect = event.currentTarget.getBoundingClientRect();
      const { w, h } = DEFAULT_SIZE[tool];
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const field = {
        id: crypto.randomUUID(),
        type: tool,
        label: '',
        page,
        x: clamp(px - w / 2, 0, 1 - w),
        y: clamp(py - h / 2, 0, 1 - h),
        w,
        h,
        ...NEW_FIELD_DEFAULTS[tool],
      };
      setFields((prev) => [...prev, field]);
      setSelectedId(field.id);
      setTool(null);
      setDirty(true);
    },
    [tool]
  );

  const renderOverlay = useCallback(
    (page) => (
      <PlacementLayer $placing={Boolean(tool)} onPointerDown={(event) => handleLayerPointerDown(event, page)}>
        {fields
          .filter((field) => field.page === page)
          .map((field) => (
            <FieldBox
              key={field.id}
              field={field}
              editable
              selected={field.id === selectedId}
              onSelect={setSelectedId}
              onChange={updateField}
              onDelete={deleteField}
              label={`${fieldTitle(field)}, עמוד ${page + 1}. חיצים להזזה, Shift וחיצים לשינוי גודל`}
            >
              {boxCaption(field)}
            </FieldBox>
          ))}
      </PlacementLayer>
    ),
    [deleteField, fields, handleLayerPointerDown, selectedId, tool, updateField]
  );

  const missingLabels = fields.some((f) => f.type === FIELD_TYPES.text && !f.label.trim());
  const signatureCount = fields.filter((f) => f.type === FIELD_TYPES.signature).length;

  const handleSave = useCallback(() => {
    save.mutate(
      { id: templateId, name: name.trim(), fields },
      { onSuccess: () => setDirty(false) }
    );
  }, [fields, name, save, templateId]);

  if (templates.isLoading) return <Muted role="status">טוען…</Muted>;
  if (!template) {
    return (
      <>
        <ErrorText role="alert">התבנית לא נמצאה</ErrorText>
        <Button variant="outline" size="sm" onClick={onBack}>
          חזרה לתבניות
        </Button>
      </>
    );
  }

  return (
    <>
      <Row style={{ justifyContent: 'space-between', marginBottom: 20 }}>
        <Heading style={{ margin: 0 }}>סימון שדות: {template.name}</Heading>
        <Button id="template-editor-back" variant="ghost" size="sm" onClick={onBack}>
          חזרה לתבניות
        </Button>
      </Row>

      <EditorLayout>
        <Sidebar aria-label="כלי סימון">
          <Input
            id="template-editor-name"
            label="שם התבנית"
            noMargin
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setDirty(true);
            }}
          />

          <div>
            <SubHeading>הוספה</SubHeading>
            <Row>
              {TOOLS.map((item) => (
                <IconButton
                  key={item.type}
                  id={`tool-add-${item.type}`}
                  type="button"
                  aria-pressed={tool === item.type}
                  onClick={() => setTool(tool === item.type ? null : item.type)}
                >
                  {item.label}
                  {item.type === FIELD_TYPES.signature ? <LuPenLine aria-hidden="true" /> : <HiOutlinePlus aria-hidden="true" />}
                </IconButton>
              ))}
            </Row>
            {tool && (
              <Hint role="status">לחצו על המסמך במקום שבו ימוקם השדה (ניתן להזיז ולשנות גודל אחר כך)</Hint>
            )}
          </div>

          {selected && (
            <div aria-labelledby="selected-field-title">
              <SubHeading id="selected-field-title">שדה נבחר</SubHeading>
              <Muted>{TYPE_NAMES[selected.type]} · עמוד {selected.page + 1}</Muted>
              {selected.type === FIELD_TYPES.text && (
                <>
                  <Input
                    id="selected-field-label"
                    label="שם השדה (יופיע בטופס המילוי)"
                    required
                    placeholder="שם מלא / ת.ז. / כתובת…"
                    value={selected.label}
                    error={!selected.label.trim() ? 'חובה לתת שם לשדה' : undefined}
                    onChange={(event) => updateField(selected.id, { label: event.target.value })}
                  />
                  <Input
                    id="selected-field-default"
                    label="ערך קבוע (ימולא אוטומטית, אפשר לשנות לכל מסמך)"
                    value={selected.defaultValue ?? ''}
                    onChange={(event) => updateField(selected.id, { defaultValue: event.target.value })}
                  />
                </>
              )}
              {selected.type === FIELD_TYPES.date && (
                <div style={{ marginTop: 16 }}>
                  <FieldLabel htmlFor="selected-field-when">איזה תאריך</FieldLabel>
                  <Select
                    id="selected-field-when"
                    value={selected.when}
                    onChange={(event) => updateField(selected.id, { when: event.target.value })}
                  >
                    <option value={DATE_WHEN.sign}>היום שבו הלקוח חותם</option>
                    <option value={DATE_WHEN.prepare}>היום שבו אני מכין את המסמך</option>
                  </Select>
                </div>
              )}
              {selected.type === FIELD_TYPES.check && (
                <div style={{ marginTop: 16 }}>
                  <FieldLabel htmlFor="selected-field-mark">סוג סימון</FieldLabel>
                  <Select
                    id="selected-field-mark"
                    value={selected.mark}
                    onChange={(event) => updateField(selected.id, { mark: event.target.value })}
                  >
                    <option value={CHECK_MARKS.v}>V</option>
                    <option value={CHECK_MARKS.x}>X</option>
                  </Select>
                </div>
              )}
              {(selected.type === FIELD_TYPES.text || selected.type === FIELD_TYPES.date) && (
                <Input
                  id="selected-field-font-size"
                  label="גודל גופן (נקודות)"
                  type="number"
                  min={6}
                  max={36}
                  step={0.5}
                  dir="ltr"
                  value={selected.fontSize}
                  onChange={(event) =>
                    updateField(selected.id, { fontSize: clamp(Number(event.target.value) || 11, 6, 36) })
                  }
                />
              )}
              {selected.type === FIELD_TYPES.signature && <Muted>כאן הלקוח יחתום. החתימה תותאם לגודל המסגרת.</Muted>}
              {selected.type === FIELD_TYPES.ownerSignature && (
                <Muted>החתימה השמורה בלשונית &quot;הגדרות&quot; תוטבע כאן אוטומטית.</Muted>
              )}
              <Row style={{ marginTop: 12 }}>
                <IconButton
                  id="selected-field-delete"
                  type="button"
                  $danger
                  onClick={() => deleteField(selected.id)}
                >
                  מחיקת השדה
                  <HiOutlineTrash aria-hidden="true" />
                </IconButton>
              </Row>
            </div>
          )}

          <div>
            <SubHeading>כל השדות ({fields.length})</SubHeading>
            {fields.length === 0 && <Muted>עדיין לא סומנו שדות.</Muted>}
            <FieldList>
              {fields.map((field) => {
                return (
                  <li key={field.id}>
                    <FieldListButton
                      id={`field-list-${field.id}`}
                      type="button"
                      $selected={field.id === selectedId}
                      aria-pressed={field.id === selectedId}
                      onClick={() => {
                        setSelectedId(field.id);
                        document.getElementById(`field-${field.id}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
                      }}
                    >
                      <span>{fieldTitle(field)}</span>
                      <Muted as="span">עמ׳ {field.page + 1}</Muted>
                    </FieldListButton>
                  </li>
                );
              })}
            </FieldList>
          </div>

          {signatureCount === 0 && fields.length > 0 && (
            <ErrorText role="status">שימו לב: לא סומן מקום לחתימת הלקוח</ErrorText>
          )}
          {save.error && <ErrorText role="alert">{save.error.message}</ErrorText>}
          <Row>
            <Button
              id="template-editor-save"
              size="sm"
              onClick={handleSave}
              disabled={save.isPending || !dirty || missingLabels || !name.trim()}
            >
              {save.isPending ? 'שומר…' : 'שמירת תבנית'}
            </Button>
            {!dirty && save.isSuccess && <Saved role="status">נשמר ✓</Saved>}
          </Row>
        </Sidebar>

        <PdfArea>
          {pdf.error && <ErrorText role="alert">{pdf.error.message}</ErrorText>}
          <PdfPages data={pdf.data} renderOverlay={renderOverlay} label={`תבנית ${template.name}`} />
        </PdfArea>
      </EditorLayout>
    </>
  );
}

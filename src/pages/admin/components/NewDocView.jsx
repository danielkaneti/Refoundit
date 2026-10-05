import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { HiOutlineCheckCircle } from 'react-icons/hi';
import { Button, Input } from '@components/ui';
import FieldBox from '@components/pdf/FieldBox';
import FieldPreview from '@components/pdf/FieldPreview';
import PdfPages from '@components/pdf/PdfPages';
import { extractTextInRegion, getPageCount } from '@components/pdf/pdfjs';
import useObjectUrl from '@hooks/useObjectUrl';
import { FIELD_TYPES, isSignDateField } from '@shared/pdfGeometry';
import { signUrl, useCreateDoc } from '../api/docs';
import { useOwnerSignature } from '../api/settings';
import { useTemplatePdf, useTemplates } from '../api/templates';
import { buildPreparedPdf, preparedValue } from '../utils/fillPdf';
import ShareLink from './ShareLink';
import {
  Card,
  EditorLayout,
  ErrorText,
  FieldLabel,
  Heading,
  Muted,
  PdfArea,
  Select,
  Sidebar,
  SubHeading,
  Row,
} from './styles';

const MAX_PDF_BYTES = 10 * 1024 * 1024;

const Success = styled(Card)`
  max-width: 720px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  svg.success-icon {
    color: ${({ theme }) => theme.colors.success};
    font-size: 40px;
  }
`;

const UploadBox = styled.div`
  padding: 14px;
  border: 2px dashed ${({ theme }) => theme.colors.teal};
  border-radius: ${({ theme }) => theme.radii.md};
  background: rgba(0, 180, 160, 0.05);

  input {
    width: 100%;
    margin-top: 6px;
    font-size: 14px;
  }
`;

const signatureFieldsOf = (template) =>
  template?.fields.filter((f) => f.type === FIELD_TYPES.signature) ?? [];

const defaultValuesOf = (template) =>
  Object.fromEntries(
    template?.fields.filter((f) => f.type === FIELD_TYPES.text).map((f) => [f.id, f.defaultValue ?? '']) ?? []
  );

export default function NewDocView({ onDone }) {
  const templates = useTemplates();
  const usable = useMemo(
    () => templates.data?.filter((t) => t.fields.some((f) => f.type === FIELD_TYPES.signature)) ?? [],
    [templates.data]
  );
  const [templateId, setTemplateId] = useState('');
  const template = usable.find((t) => t.id === templateId);
  const templatePdf = useTemplatePdf(templateId);
  const ownerSignature = useOwnerSignature();
  const ownerSignatureUrl = useObjectUrl(ownerSignature.data, 'image/png');
  const create = useCreateDoc();
  const fileRef = useRef(null);

  const [clientPdf, setClientPdf] = useState(null);
  const [clientFileName, setClientFileName] = useState('');
  const [clientName, setClientName] = useState('');
  const [values, setValues] = useState({});
  const [signatureFields, setSignatureFields] = useState([]);
  const [building, setBuilding] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  // The document is built from this client's own PDF when uploaded, otherwise from the template's.
  const sourcePdf = clientPdf ?? templatePdf.data;

  useEffect(() => {
    if (!templateId && usable.length) setTemplateId(usable[0].id);
  }, [templateId, usable]);

  const resetForTemplate = useCallback((next) => {
    setValues(defaultValuesOf(next));
    setSignatureFields(signatureFieldsOf(next));
    setClientPdf(null);
    setClientFileName('');
    setLocalError(null);
    if (fileRef.current) fileRef.current.value = '';
  }, []);

  useEffect(() => {
    resetForTemplate(template);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.id]);

  const textFields = useMemo(() => template?.fields.filter((f) => f.type === FIELD_TYPES.text) ?? [], [template]);
  const autoFields = useMemo(
    () =>
      template?.fields.filter((f) => f.type !== FIELD_TYPES.signature && f.type !== FIELD_TYPES.text) ?? [],
    [template]
  );
  const needsOwnerSignature = Boolean(template?.fields.some((f) => f.type === FIELD_TYPES.ownerSignature));
  const ownerSignatureMissing = needsOwnerSignature && !ownerSignature.isLoading && !ownerSignature.data;

  const handleClientFile = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      setLocalError(null);
      if (!file) {
        setClientPdf(null);
        setClientFileName('');
        return;
      }
      if (file.size > MAX_PDF_BYTES) {
        setLocalError('הקובץ גדול מ-10MB');
        return;
      }
      const bytes = new Uint8Array(await file.arrayBuffer());
      try {
        const pages = await getPageCount(bytes);
        if (pages !== template.pageCount) {
          setLocalError(`לקובץ ${pages} עמודים, אבל התבנית בנויה ל-${template.pageCount}`);
          return;
        }
        if (template.clientNameRegion) {
          const name = await extractTextInRegion(bytes, template.clientNameRegion);
          if (name) setClientName(name);
        }
      } catch {
        setLocalError('לא ניתן לקרוא את קובץ ה-PDF');
        return;
      }
      setClientPdf(bytes);
      setClientFileName(file.name);
    },
    [template]
  );

  const updateSignature = useCallback((id, patch) => {
    setSignatureFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, []);

  const renderOverlay = useCallback(
    (page, { pxPerPt }) => (
      <>
        {[...textFields, ...autoFields]
          .filter((f) => f.page === page)
          .map((field) => (
            <FieldPreview
              key={field.id}
              field={field}
              pxPerPt={pxPerPt}
              value={preparedValue(field, values)}
              ownerSignatureUrl={ownerSignatureUrl}
            />
          ))}
        {signatureFields
          .filter((f) => f.page === page)
          .map((field) => (
            <FieldBox
              key={field.id}
              field={field}
              editable
              selected={field.id === selectedId}
              onSelect={setSelectedId}
              onChange={updateSignature}
              label={`מקום חתימת הלקוח בעמוד ${page + 1}. ניתן להזיז במסמך זה בלבד`}
            >
              חתימת הלקוח
            </FieldBox>
          ))}
      </>
    ),
    [autoFields, ownerSignatureUrl, selectedId, signatureFields, textFields, updateSignature, values]
  );

  const canSubmit =
    Boolean(template && clientName.trim() && sourcePdf) && !ownerSignatureMissing && !building && !create.isPending;

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!canSubmit) return;
      setLocalError(null);
      setBuilding(true);
      let pdfBytes;
      try {
        pdfBytes = await buildPreparedPdf(sourcePdf, template.fields, values, {
          ownerSignaturePng: ownerSignature.data,
        });
      } catch (err) {
        setLocalError(
          err.message === 'missing-owner-signature'
            ? 'יש להגדיר את חתימת המייצג בלשונית "הגדרות"'
            : 'לא ניתן היה להכין את המסמך'
        );
        return;
      } finally {
        setBuilding(false);
      }
      create.mutate({
        pdfBytes,
        templateId: template.id,
        clientName: clientName.trim(),
        signatureFields,
        signDateFields: template.fields.filter(isSignDateField),
      });
    },
    [canSubmit, clientName, create, ownerSignature.data, signatureFields, sourcePdf, template, values]
  );

  const handleReset = useCallback(() => {
    create.reset();
    setClientName('');
    resetForTemplate(template);
  }, [create, resetForTemplate, template]);

  if (create.data) {
    return (
      <Success aria-live="polite">
        <HiOutlineCheckCircle className="success-icon" aria-hidden="true" />
        <Heading style={{ margin: 0 }}>המסמך מוכן לחתימה</Heading>
        <Muted>
          שלחו ל{create.data.clientName} את הקישור. הקישור בתוקף עד{' '}
          {new Date(create.data.expiresAt).toLocaleDateString('he-IL')}. ברגע שייחתם, ה-PDF יישלח אליכם למייל.
        </Muted>
        <ShareLink id="new-doc-link" url={signUrl(create.data.token)} clientName={create.data.clientName} />
        <Row>
          <Button id="new-doc-another" size="sm" onClick={handleReset}>
            מסמך נוסף
          </Button>
          <Button id="new-doc-to-list" size="sm" variant="outline" onClick={onDone}>
            לרשימת המסמכים
          </Button>
        </Row>
      </Success>
    );
  }

  if (templates.isLoading) return <Muted role="status">טוען…</Muted>;
  if (!usable.length) {
    return (
      <Card>
        <Heading>מסמך חדש</Heading>
        <Muted>כדי להכין מסמך צריך קודם תבנית עם לפחות מקום חתימה אחד ללקוח. עברו ללשונית &quot;תבניות&quot;.</Muted>
      </Card>
    );
  }

  const error = localError || create.error?.message;

  return (
    <>
      <Heading>מסמך חדש לחתימה</Heading>
      <EditorLayout>
        <Sidebar as="form" onSubmit={handleSubmit} aria-label="פרטי המסמך" noValidate>
          <div>
            <FieldLabel htmlFor="new-doc-template">תבנית</FieldLabel>
            <Select id="new-doc-template" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
              {usable.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>

          <UploadBox>
            <FieldLabel htmlFor="new-doc-client-file">קובץ ה-PDF של הלקוח</FieldLabel>
            <Muted>
              {template?.presetId
                ? 'העלו את הטופס שהופק עבור הלקוח. כל השדות יושלמו אוטומטית.'
                : 'אופציונלי. בלי קובץ ישמש הקובץ של התבנית.'}
            </Muted>
            <input
              ref={fileRef}
              id="new-doc-client-file"
              type="file"
              accept="application/pdf"
              onChange={handleClientFile}
              aria-describedby={clientFileName ? 'new-doc-client-file-name' : undefined}
            />
            {clientFileName && (
              <Muted id="new-doc-client-file-name" role="status">
                נטען: {clientFileName}
              </Muted>
            )}
          </UploadBox>

          <Input
            id="new-doc-client-name"
            label="שם הלקוח (לרשימה ולמייל)"
            noMargin
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />

          {textFields.length > 0 && (
            <div>
              <SubHeading>טקסט במסמך</SubHeading>
              {textFields.map((field) => (
                <Input
                  key={field.id}
                  id={`new-doc-field-${field.id}`}
                  label={field.label}
                  value={values[field.id] ?? ''}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                />
              ))}
            </div>
          )}

          {autoFields.length > 0 && (
            <Muted>
              יוטבעו אוטומטית: {autoFields.map((f) => f.label).filter(Boolean).join(' · ')}
            </Muted>
          )}
          <Muted>המסגרת הצהובה היא המקום היחיד שבו הלקוח יוכל לחתום. אפשר לגרור אותה למסמך הזה בלבד.</Muted>

          {ownerSignatureMissing && (
            <ErrorText role="alert">לתבנית יש שדה &quot;חתימת המייצג&quot;. הגדירו את החתימה בלשונית &quot;הגדרות&quot;.</ErrorText>
          )}
          {error && <ErrorText role="alert">{error}</ErrorText>}
          <Button id="new-doc-submit" type="submit" fullWidth disabled={!canSubmit}>
            {building || create.isPending ? 'מכין מסמך…' : 'יצירת קישור לחתימה'}
          </Button>
        </Sidebar>

        <PdfArea>
          {templatePdf.error && <ErrorText role="alert">{templatePdf.error.message}</ErrorText>}
          <PdfPages data={sourcePdf} renderOverlay={renderOverlay} label="תצוגה מקדימה של המסמך" />
        </PdfArea>
      </EditorLayout>
    </>
  );
}

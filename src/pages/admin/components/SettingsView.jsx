import { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { HiOutlineTrash } from 'react-icons/hi';
import { Button } from '@components/ui';
import SignaturePad from '@components/signature/SignaturePad';
import useObjectUrl from '@hooks/useObjectUrl';
import { useDeleteOwnerSignature, useOwnerSignature, useSaveOwnerSignature } from '../api/settings';
import { imageFileToSignaturePng } from '../utils/signatureImage';
import OfficeSettingsForm from './OfficeSettingsForm';
import { Card, ErrorText, FieldLabel, Heading, IconButton, Muted, Row, SubHeading } from './styles';

const Preview = styled.div`
  display: grid;
  place-items: center;
  min-height: 140px;
  padding: 16px;
  border: 2px dashed ${({ theme }) => theme.colors.gray200};
  border-radius: ${({ theme }) => theme.radii.md};
  background: repeating-linear-gradient(45deg, #fff, #fff 10px, #f7f9fc 10px, #f7f9fc 20px);

  img {
    max-height: 120px;
    max-width: 100%;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
`;

export default function SettingsView() {
  const signature = useOwnerSignature();
  const save = useSaveOwnerSignature();
  const remove = useDeleteOwnerSignature();
  const signatureUrl = useObjectUrl(signature.data, 'image/png');
  const padRef = useRef(null);
  const fileRef = useRef(null);
  const [hasInk, setHasInk] = useState(false);
  const [fileError, setFileError] = useState(null);

  const handleFile = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setFileError(null);
      try {
        save.mutate(await imageFileToSignaturePng(file));
      } catch (err) {
        setFileError(err.message);
      } finally {
        if (fileRef.current) fileRef.current.value = '';
      }
    },
    [save]
  );

  const handleSaveDrawing = useCallback(() => {
    const dataUrl = padRef.current?.toDataUrl();
    if (dataUrl) save.mutate(dataUrl, { onSuccess: () => padRef.current?.clear() });
  }, [save]);

  return (
    <>
      <Heading>הגדרות</Heading>
      <Card style={{ maxWidth: 720 }} aria-labelledby="owner-signature-title">
        <SubHeading id="owner-signature-title">חתימת המייצג</SubHeading>
        <Muted>
          החתימה הזו תוטבע אוטומטית בכל מסמך בשדה &quot;חתימת המייצג&quot; (למשל בטופס 2279א). היא נשמרת בשרת
          בלבד ולא בקוד האתר.
        </Muted>

        <Section>
          <Preview role="img" aria-label={signatureUrl ? 'החתימה השמורה' : 'לא הוגדרה חתימה'}>
            {signature.isLoading && <Muted>טוען…</Muted>}
            {signatureUrl && <img src={signatureUrl} alt="" />}
            {!signature.isLoading && !signatureUrl && <Muted>עדיין לא הוגדרה חתימה</Muted>}
          </Preview>
          {signatureUrl && (
            <Row>
              <IconButton
                id="owner-signature-delete"
                type="button"
                $danger
                disabled={remove.isPending}
                onClick={() => window.confirm('למחוק את החתימה השמורה?') && remove.mutate()}
              >
                מחיקת החתימה
                <HiOutlineTrash aria-hidden="true" />
              </IconButton>
            </Row>
          )}
        </Section>

        <Section>
          <FieldLabel htmlFor="owner-signature-file">העלאת תמונה של החתימה (PNG / JPG)</FieldLabel>
          <Muted>רקע לבן יהפוך לשקוף אוטומטית.</Muted>
          <input
            ref={fileRef}
            id="owner-signature-file"
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleFile}
            disabled={save.isPending}
          />
        </Section>

        <Section>
          <FieldLabel as="p" id="owner-signature-draw-label">
            או ציור החתימה
          </FieldLabel>
          <SignaturePad ref={padRef} id="owner-signature-pad" label="אזור ציור חתימת המייצג" onInkChange={setHasInk} />
          <Row>
            <Button id="owner-signature-save-drawing" size="sm" onClick={handleSaveDrawing} disabled={!hasInk || save.isPending}>
              {save.isPending ? 'שומר…' : 'שמירת החתימה המצוירת'}
            </Button>
            <Button id="owner-signature-clear" size="sm" variant="ghost" onClick={() => padRef.current?.clear()}>
              ניקוי
            </Button>
          </Row>
        </Section>

        {(fileError || save.error) && <ErrorText role="alert">{fileError || save.error.message}</ErrorText>}
        {save.isSuccess && <Muted role="status">החתימה נשמרה ✓</Muted>}
      </Card>
      <OfficeSettingsForm />
    </>
  );
}

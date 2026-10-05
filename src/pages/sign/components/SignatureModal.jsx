import { useCallback, useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { Button, Input } from '@components/ui';
import SignaturePad from '@components/signature/SignaturePad';

const Dialog = styled.dialog`
  width: min(560px, calc(100vw - 24px));
  border: none;
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadows.xl};
  margin: auto;

  &::backdrop {
    background: rgba(10, 22, 40, 0.6);
  }
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 4px;
`;

const Help = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray500};
  margin-bottom: 16px;
`;

const ModeSwitch = styled.div`
  display: flex;
  gap: 4px;
  padding: 4px;
  background: ${({ theme }) => theme.colors.gray100};
  border-radius: ${({ theme }) => theme.radii.full};
  margin-bottom: 16px;
  width: fit-content;
`;

const ModeButton = styled.button`
  border: none;
  background: transparent;
  padding: 6px 16px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray600};

  ${({ $active, theme }) =>
    $active &&
    css`
      background: ${theme.colors.white};
      color: ${theme.colors.navy};
      box-shadow: ${theme.shadows.sm};
    `}
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  margin-top: 20px;
`;

const MODES = { draw: 'draw', type: 'type' };

export default function SignatureModal({ open, onClose, onConfirm, defaultName = '' }) {
  const dialogRef = useRef(null);
  const padRef = useRef(null);
  const [mode, setMode] = useState(MODES.draw);
  const [typedName, setTypedName] = useState(defaultName);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    setHasInk(false);
  }, [open]);

  useEffect(() => {
    if (mode === MODES.type) padRef.current?.drawText(typedName);
  }, [mode, typedName]);

  const handleModeChange = useCallback((next) => {
    setMode(next);
    padRef.current?.clear();
  }, []);

  const handleClear = useCallback(() => {
    padRef.current?.clear();
    if (mode === MODES.type) setTypedName('');
  }, [mode]);

  const handleConfirm = useCallback(() => {
    const dataUrl = padRef.current?.toDataUrl();
    if (dataUrl) onConfirm(dataUrl);
  }, [onConfirm]);

  return (
    <Dialog ref={dialogRef} aria-labelledby="signature-modal-title" aria-describedby="signature-modal-help" onClose={onClose}>
      <Title id="signature-modal-title">החתימה שלך</Title>
      <Help id="signature-modal-help">
        {mode === MODES.draw ? 'חתמו בתוך המסגרת עם האצבע או העכבר.' : 'הקלידו את שמכם המלא — הוא ישמש כחתימה.'}
      </Help>

      <ModeSwitch role="group" aria-label="אופן החתימה">
        <ModeButton
          id="signature-mode-draw"
          type="button"
          $active={mode === MODES.draw}
          aria-pressed={mode === MODES.draw}
          onClick={() => handleModeChange(MODES.draw)}
        >
          ציור
        </ModeButton>
        <ModeButton
          id="signature-mode-type"
          type="button"
          $active={mode === MODES.type}
          aria-pressed={mode === MODES.type}
          onClick={() => handleModeChange(MODES.type)}
        >
          הקלדה
        </ModeButton>
      </ModeSwitch>

      {mode === MODES.type && (
        <div style={{ marginBottom: 12 }}>
          <Input
            id="signature-typed-name"
            label="שם מלא"
            noMargin
            autoComplete="name"
            value={typedName}
            onChange={(event) => setTypedName(event.target.value)}
          />
        </div>
      )}

      {open && <SignaturePad ref={padRef} id="signature-pad" label="אזור חתימה" onInkChange={setHasInk} />}

      <Actions>
        <Button id="signature-clear" variant="ghost" size="sm" onClick={handleClear}>
          ניקוי
        </Button>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button id="signature-cancel" variant="outline" size="sm" onClick={onClose}>
            ביטול
          </Button>
          <Button id="signature-confirm" size="sm" onClick={handleConfirm} disabled={!hasInk}>
            אישור החתימה
          </Button>
        </div>
      </Actions>
    </Dialog>
  );
}

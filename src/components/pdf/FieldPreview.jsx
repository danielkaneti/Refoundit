import { memo } from 'react';
import styled from 'styled-components';
import { CHECK_MARKS, DATE_WHEN, FIELD_TYPES } from '@shared/pdfGeometry';

/* Non-interactive look-alike of what will be stamped into the PDF */
const Slot = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: ${({ $center }) => ($center ? 'center' : 'flex-start')};
  direction: rtl;
  color: #000;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  pointer-events: none;
  outline: 1px dashed rgba(27, 58, 92, 0.25);

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  svg {
    width: 100%;
    height: 100%;
  }
`;

const Placeholder = styled.span`
  color: #7b61ff;
  font-size: 0.85em;
`;

const MARK_SVG = {
  [CHECK_MARKS.v]: 'M1.2 5.5 L4 8.5 L9 1.2',
  [CHECK_MARKS.x]: 'M1.2 1.2 L8.8 8.8 M8.8 1.2 L1.2 8.8',
};

function FieldPreview({ field, pxPerPt, value, ownerSignatureUrl }) {
  const style = {
    left: `${field.x * 100}%`,
    top: `${field.y * 100}%`,
    width: `${field.w * 100}%`,
    height: `${field.h * 100}%`,
    fontSize: `${(field.fontSize || 11) * pxPerPt}px`,
  };

  if (field.type === FIELD_TYPES.check) {
    return (
      <Slot style={style} $center aria-hidden="true">
        <svg viewBox="0 0 10 10" preserveAspectRatio="none">
          <path d={MARK_SVG[field.mark] ?? MARK_SVG.v} stroke="#000" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </svg>
      </Slot>
    );
  }

  if (field.type === FIELD_TYPES.ownerSignature) {
    return (
      <Slot style={style} $center aria-hidden="true">
        {ownerSignatureUrl ? <img src={ownerSignatureUrl} alt="" /> : <Placeholder>חתימת מייצג חסרה</Placeholder>}
      </Slot>
    );
  }

  if (field.type === FIELD_TYPES.date && field.when === DATE_WHEN.sign) {
    return (
      <Slot style={style} $center aria-hidden="true">
        <Placeholder>תאריך החתימה</Placeholder>
      </Slot>
    );
  }

  return (
    <Slot style={style} $center={field.type === FIELD_TYPES.date} aria-hidden="true">
      {value}
    </Slot>
  );
}

export default memo(FieldPreview);

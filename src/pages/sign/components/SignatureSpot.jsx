import { memo } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { LuPenLine } from 'react-icons/lu';

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 166, 35, 0.55); }
  50% { box-shadow: 0 0 0 8px rgba(245, 166, 35, 0); }
`;

const Spot = styled.button`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0;
  border-radius: 4px;
  font-family: inherit;
  font-weight: 700;
  font-size: clamp(10px, 1.6vw, 14px);
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
  direction: rtl;
  overflow: hidden;

  ${({ $signed, theme }) =>
    $signed
      ? css`
          border: 1px dashed ${theme.colors.teal};
          background: transparent;
        `
      : css`
          border: 2px dashed ${theme.colors.gold};
          background: rgba(245, 166, 35, 0.18);
          animation: ${pulse} 1.8s ease-in-out infinite;
        `}

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

function SignatureSpot({ field, signature, onClick, index, total, disabled }) {
  return (
    <Spot
      id={`signature-spot-${field.id}`}
      type="button"
      $signed={Boolean(signature)}
      disabled={disabled}
      onClick={onClick}
      aria-label={
        signature
          ? `מקום חתימה ${index + 1} מתוך ${total} — נחתם. לחצו לשינוי החתימה`
          : `מקום חתימה ${index + 1} מתוך ${total} — לחצו כדי לחתום`
      }
      style={{
        left: `${field.x * 100}%`,
        top: `${field.y * 100}%`,
        width: `${field.w * 100}%`,
        height: `${field.h * 100}%`,
      }}
    >
      {signature ? (
        <img src={signature} alt="" />
      ) : (
        <>
          לחצו לחתימה
          <LuPenLine aria-hidden="true" />
        </>
      )}
    </Spot>
  );
}

export default memo(SignatureSpot);

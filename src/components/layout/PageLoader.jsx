import { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';

/* ─── Animations ─────────────────────────────────────── */

const logoIn = keyframes`
  0%   { opacity: 0; transform: scale(0.72) translateY(12px); }
  60%  { opacity: 1; transform: scale(1.04) translateY(-2px); }
  100% { opacity: 1; transform: scale(1)    translateY(0); }
`;

const dotPulse = keyframes`
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40%           { transform: scale(1);   opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(0); }
  to   { transform: translateY(-100%); }
`;

/* ─── Styled components ───────────────────────────────── */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 36px;
  background: linear-gradient(
    150deg,
    ${({ theme }) => theme.colors.navy} 0%,
    ${({ theme }) => theme.colors.navyLight} 55%,
    ${({ theme }) => theme.colors.navyMid} 100%
  );

  ${({ $leaving }) =>
    $leaving &&
    css`
      animation: ${slideUp} 0.55s cubic-bezier(0.76, 0, 0.24, 1) forwards;
    `}
`;

const LogoWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  animation: ${logoIn} 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
`;

const LogoMark = styled.div`
  width: 56px;
  height: 56px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.teal},
    ${({ theme }) => theme.colors.tealLight}
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 26px;
  color: white;
  box-shadow: 0 0 32px rgba(0, 180, 160, 0.45);
`;

const LogoText = styled.span`
  font-size: 28px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.white};
  letter-spacing: -0.5px;
`;

const Dots = styled.div`
  display: flex;
  gap: 8px;
  animation: ${logoIn} 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.teal};
  animation: ${dotPulse} 1.2s ease-in-out ${({ $i }) => $i * 0.18}s infinite;
`;

/* ─── Component ──────────────────────────────────────── */

export default function PageLoader({ onDone }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // start exit after 1.4 s
    const exitTimer = setTimeout(() => setLeaving(true), 1400);
    // unmount after exit animation (1.4 + 550 ms)
    const doneTimer = setTimeout(() => onDone?.(), 1950);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <Overlay $leaving={leaving} role="status" aria-label="REFOUNDIT טוען...">
      <LogoWrap aria-hidden="true">
        <LogoMark>R</LogoMark>
        <LogoText>REFOUNDIT</LogoText>
      </LogoWrap>
      <Dots aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <Dot key={i} $i={i} />
        ))}
      </Dots>
    </Overlay>
  );
}

import styled, { css } from 'styled-components';

export const Page = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.offWhite};
`;

export const Content = styled.main`
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px clamp(16px, 3vw, 32px) 64px;
`;

export const Card = styled.section`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: clamp(20px, 3vw, 32px);
`;

export const Heading = styled.h1`
  font-size: clamp(22px, 3vw, 28px);
  font-weight: 800;
  margin-bottom: 20px;
`;

export const SubHeading = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
`;

export const Muted = styled.p`
  color: ${({ theme }) => theme.colors.gray500};
  font-size: 14px;
  line-height: 1.6;
`;

export const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 14px;
  margin-top: 12px;
`;

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
`;

/* Sidebar + PDF canvas, stacked on small screens */
export const EditorLayout = styled.div`
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 24px;
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

export const Sidebar = styled(Card)`
  position: sticky;
  top: 88px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: calc(100vh - 112px);
  overflow-y: auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    position: static;
    max-height: none;
  }
`;

export const PdfArea = styled.div`
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
`;

export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.gray200};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.navy};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.gray100};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ $danger, theme }) =>
    $danger &&
    css`
      color: ${theme.colors.danger};
    `}
`;

const badgeColors = {
  pending: () => css`
    background: rgba(245, 166, 35, 0.15);
    color: #a86b00;
  `,
  signed: ({ theme }) => css`
    background: rgba(39, 174, 96, 0.12);
    color: ${theme.colors.success};
  `,
  expired: ({ theme }) => css`
    background: ${theme.colors.gray100};
    color: ${theme.colors.gray500};
  `,
  warning: ({ theme }) => css`
    background: rgba(231, 76, 60, 0.1);
    color: ${theme.colors.danger};
  `,
};

export const Badge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  ${({ $tone }) => badgeColors[$tone]}
`;

export const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 2px solid ${({ theme }) => theme.colors.gray200};
  font-size: 16px;
  font-family: inherit;
  background: ${({ theme }) => theme.colors.white};

  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.teal};
  }
`;

export const FieldLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
`;

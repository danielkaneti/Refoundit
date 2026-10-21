import styled from 'styled-components';

export const PageHeader = styled.header`
  padding: 140px 0 48px;
  background: ${({ theme }) => theme.colors.navy};
  color: ${({ theme }) => theme.colors.white};

  h1 {
    max-width: 850px;
    font-size: 42px;
    line-height: 1.3;
    font-weight: 800;
    margin: 16px 0;
    overflow-wrap: anywhere;
  }

  p {
    max-width: 760px;
    color: ${({ theme }) => theme.colors.gray200};
    font-size: 18px;
    line-height: 1.9;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 116px 0 36px;
    h1 { font-size: 30px; }
    p { font-size: 17px; }
  }
`;

export const Breadcrumbs = styled.nav`
  ol {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    list-style: none;
    font-size: 14px;
    line-height: 1.8;
    color: ${({ theme }) => theme.colors.gray200};
  }

  li + li::before {
    content: '/';
    margin-inline-end: 8px;
    color: ${({ theme }) => theme.colors.gray400};
  }

  a { text-decoration: underline; text-underline-offset: 4px; }
`;

export const Eyebrow = styled.span`
  display: inline-block;
  color: ${({ theme }) => theme.colors.tealLight};
  font-size: 14px;
  font-weight: 700;
  margin-top: 20px;
`;

export const ContentBand = styled.section`
  padding: 48px 0 64px;
  background: ${({ theme, $muted }) => $muted ? theme.colors.offWhite : theme.colors.white};

  h2 { font-size: 26px; line-height: 1.5; margin-bottom: 24px; }
`;

export const ArticleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const ReadingColumn = styled.div`
  max-width: 780px;
  margin: 0 auto;
  padding: 40px 0 56px;
  color: ${({ theme }) => theme.colors.gray600};
  font-size: 18px;
  line-height: 1.95;
  overflow-wrap: anywhere;

  h2, h3 { color: ${({ theme }) => theme.colors.navy}; line-height: 1.5; }
  h2 { font-size: 27px; margin: 40px 0 16px; }
  h3 { font-size: 21px; margin: 24px 0 12px; }
  p + p { margin-top: 16px; }
  ul { padding-inline-start: 24px; margin: 16px 0; }
  li + li { margin-top: 10px; }
  a { color: ${({ theme }) => theme.colors.tealDark}; text-decoration: underline; text-underline-offset: 4px; }
  section, h2, h3 { scroll-margin-top: 110px; }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 17px;
    h2 { font-size: 24px; }
    h3 { font-size: 20px; }
  }
`;

export const TableOfContents = styled.nav`
  padding-bottom: 28px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray200};

  h2 { margin-top: 0; font-size: 20px; }
  ul { columns: 2; font-size: 16px; }
  li { break-inside: avoid; }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    ul { columns: 1; }
  }
`;

export const EditorialNote = styled.aside`
  margin: 36px 0;
  padding-inline-start: 20px;
  border-inline-start: 3px solid ${({ theme }) => theme.colors.teal};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.gray500};
`;

export const CtaBand = styled.section`
  padding: 44px 0;
  background: ${({ theme }) => theme.colors.navyLight};
  color: ${({ theme }) => theme.colors.white};

  h2 { font-size: 27px; margin-bottom: 12px; line-height: 1.5; }
  p { color: ${({ theme }) => theme.colors.gray200}; line-height: 1.8; margin-bottom: 24px; }
`;

export const CtaLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  max-width: 100%;
  padding: 14px 26px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.teal};
  color: ${({ theme }) => theme.colors.navy};
  font-size: 17px;
  font-weight: 800;
  text-align: center;
  line-height: 1.6;

  svg { flex-shrink: 0; }
  &:hover { background: ${({ theme }) => theme.colors.tealLight}; }
`;

export const DesktopContact = styled.div`
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;
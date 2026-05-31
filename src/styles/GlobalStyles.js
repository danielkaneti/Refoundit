import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.body};
    direction: rtl;
    text-align: right;
    color: ${({ theme }) => theme.colors.navy};
    background: ${({ theme }) => theme.colors.white};
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  ::selection {
    background: ${({ theme }) => theme.colors.teal};
    color: white;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  img {
    max-width: 100%;
    display: block;
  }

  button {
    font-family: ${({ theme }) => theme.fonts.body};
  }

  input, textarea {
    font-family: ${({ theme }) => theme.fonts.body};
  }

  /* ── Keyboard focus ring (WCAG 2.4.7) ─────────────────── */
  *:focus {
    outline: none;
  }

  *:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.teal};
    outline-offset: 3px;
    border-radius: 4px;
  }

  /* ── Screen-reader-only utility (used by multiple components) */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* ── Skip navigation link (WCAG 2.4.1) ────────────────── */
  .skip-nav {
    position: absolute;
    top: -200%;
    inset-inline-start: 50%;
    transform: translateX(-50%);
    z-index: 10000;
    padding: 12px 28px;
    background: ${({ theme }) => theme.colors.teal};
    color: white;
    font-weight: 700;
    font-size: 15px;
    border-radius: 0 0 10px 10px;
    text-decoration: none;
    white-space: nowrap;

    &:focus-visible {
      top: 0;
      outline: 3px solid white;
      outline-offset: 3px;
    }
  }
`;

export default GlobalStyles;

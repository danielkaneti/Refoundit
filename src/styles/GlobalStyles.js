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
`;

export default GlobalStyles;

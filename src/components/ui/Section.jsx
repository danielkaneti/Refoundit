import styled from 'styled-components';

const Section = styled.section`
  padding: 80px 0;
  background: ${({ $bg }) => $bg || 'transparent'};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 56px 0;
  }
`;

export default Section;

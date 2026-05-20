import styled from 'styled-components';
import useInView from '@hooks/useInView';

const Wrapper = styled.div`
  text-align: center;
  margin-bottom: 56px;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: translateY(${({ $visible }) => ($visible ? '0' : '30px')});
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
`;

const Title = styled.h2`
  font-size: clamp(28px, 5vw, 44px);
  font-weight: 800;
  color: ${({ $light, theme }) => ($light ? theme.colors.white : theme.colors.navy)};
  line-height: 1.2;
  margin-bottom: ${({ $hasSub }) => ($hasSub ? '16px' : '0')};
`;

const Subtitle = styled.p`
  font-size: clamp(16px, 2.5vw, 20px);
  color: ${({ $light, theme }) => ($light ? 'rgba(255,255,255,0.7)' : theme.colors.gray500)};
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

export default function SectionTitle({ children, light = false, sub }) {
  const [ref, isVisible] = useInView();

  return (
    <Wrapper ref={ref} $visible={isVisible}>
      <Title $light={light} $hasSub={!!sub}>
        {children}
      </Title>
      {sub && <Subtitle $light={light}>{sub}</Subtitle>}
    </Wrapper>
  );
}

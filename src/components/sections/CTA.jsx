import styled from 'styled-components';
import { LuRocket } from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa';
import { Section, Container, Button } from '@components/ui';
import { openWhatsApp } from '@utils/whatsapp';

const CTAWrapper = styled(Section)`
  padding: 60px 0;
`;

const Inner = styled.div`
  text-align: center;
`;

const Title = styled.h2`
  font-size: clamp(24px, 4vw, 38px);
  font-weight: 800;
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: 16px;
`;

const Desc = styled.p`
  font-size: 18px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 32px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
`;

const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

export default function CTA() {
  return (
    <CTAWrapper
      $bg={`linear-gradient(135deg, #00B4A0, #009688)`}
    >
      <Container>
        <Inner>
          <Title>ההחזר שלכם מחכה!</Title>
          <Desc>היכנסו עכשיו וגלו כמה כסף מגיע לכם ממס הכנסה</Desc>
          <ButtonRow>
            <Button variant="secondary" size="lg" onClick={() => scrollTo('quiz')}>
              בדקו זכאות עכשיו
              <LuRocket aria-hidden="true" strokeWidth={1.75} />
            </Button>
            <Button
              size="lg"
              style={{ background: 'white', color: '#0A1628' }}
              onClick={() => openWhatsApp('inquiry')}
            >
              וואטסאפ
              <FaWhatsapp aria-hidden="true" />
            </Button>
          </ButtonRow>
        </Inner>
      </Container>
    </CTAWrapper>
  );
}

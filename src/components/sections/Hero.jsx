import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { gradientShift, float } from '@styles/animations';
import { Container, Button } from '@components/ui';
import { openWhatsApp } from '@utils/whatsapp';

const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.navy} 0%,
    ${({ theme }) => theme.colors.navyLight} 50%,
    ${({ theme }) => theme.colors.navyMid} 100%
  );
  position: relative;
  overflow: hidden;
`;

const BgCircles = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: 0.08;
`;

const Circle = styled.div`
  position: absolute;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.teal};
  animation: ${float} ${({ $dur }) => $dur}s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
`;

const GradientOrb = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
`;

const Content = styled.div`
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 2;
  padding-top: 100px;
  padding-bottom: 60px;
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 180, 160, 0.15);
  border-radius: ${({ theme }) => theme.radii.full};
  padding: 8px 20px;
  margin-bottom: 28px;
  border: 1px solid rgba(0, 180, 160, 0.3);
  font-size: 14px;
  color: ${({ theme }) => theme.colors.tealLight};
  font-weight: 600;
  opacity: ${({ $vis }) => ($vis ? 1 : 0)};
  transform: translateY(${({ $vis }) => ($vis ? '0' : '40px')});
  transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
`;

const Title = styled.h1`
  font-size: clamp(32px, 7vw, 62px);
  font-weight: 900;
  color: ${({ theme }) => theme.colors.white};
  line-height: 1.15;
  margin-bottom: 24px;
  opacity: ${({ $vis }) => ($vis ? 1 : 0)};
  transform: translateY(${({ $vis }) => ($vis ? '0' : '40px')});
  transition: all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;
`;

const GradientText = styled.span`
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.teal},
    ${({ theme }) => theme.colors.tealLight},
    ${({ theme }) => theme.colors.gold}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% auto;
  animation: ${gradientShift} 4s ease infinite;
`;

const Subtitle = styled.p`
  font-size: clamp(16px, 2.5vw, 21px);
  color: rgba(255, 255, 255, 0.7);
  max-width: 540px;
  margin: 0 auto 40px;
  line-height: 1.7;
  opacity: ${({ $vis }) => ($vis ? 1 : 0)};
  transform: translateY(${({ $vis }) => ($vis ? '0' : '40px')});
  transition: all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  opacity: ${({ $vis }) => ($vis ? 1 : 0)};
  transform: translateY(${({ $vis }) => ($vis ? '0' : '40px')});
  transition: all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.45s;
`;

const TrustRow = styled.div`
  display: flex;
  gap: 40px;
  justify-content: center;
  margin-top: 56px;
  flex-wrap: wrap;
  opacity: ${({ $vis }) => ($vis ? 1 : 0)};
  transition: opacity 1s ease 0.7s;
`;

const TrustItem = styled.div`
  text-align: center;
`;

const TrustValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.tealLight};
`;

const TrustLabel = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
`;

const CredRow = styled.div`
  display: flex;
  gap: 8px 20px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.3px;
  opacity: ${({ $vis }) => ($vis ? 1 : 0)};
  transition: opacity 1s ease 0.9s;
`;

const CredDot = styled.span`
  color: ${({ theme }) => theme.colors.teal};
  font-size: 16px;
  line-height: 1;
`;

const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 32px;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  animation: ${float} 2s ease-in-out infinite;
`;

const ScrollPill = styled.div`
  width: 24px;
  height: 40px;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  justify-content: center;
  padding-top: 8px;
`;

const ScrollDot = styled.div`
  width: 4px;
  height: 8px;
  border-radius: 2px;
  background: ${({ theme }) => theme.colors.teal};
  animation: ${float} 1.5s ease-in-out infinite;
`;

const TRUST_STATS = [
  { val: '8,000₪', label: 'החזר ממוצע' },
  { val: '300K+', label: 'לקוחות מרוצים' },
  { val: '6 שנים', label: 'אחורה רטרואקטיבית' },
];

const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

export default function Hero() {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    setTimeout(() => setVis(true), 200);
  }, []);

  return (
    <HeroSection>
      <BgCircles>
        {[...Array(6)].map((_, i) => (
          <Circle
            key={i}
            $dur={4 + i}
            $delay={i * 0.5}
            style={{
              width: 200 + i * 100,
              height: 200 + i * 100,
              top: `${10 + i * 15}%`,
              left: `${5 + i * 12}%`,
            }}
          />
        ))}
      </BgCircles>

      <GradientOrb
        style={{
          top: '-20%',
          right: '-10%',
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(0,180,160,0.15), transparent 70%)',
        }}
      />
      <GradientOrb
        style={{
          bottom: '-20%',
          left: '-10%',
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(245,166,35,0.1), transparent 70%)',
        }}
      />

      <Container>
        <Content>

          <Title $vis={vis}>
            שכירים?
            <br />
            <GradientText>גלו כמה כסף מגיע לכם</GradientText>
            <br />
            ממס הכנסה!
          </Title>

          <Subtitle $vis={vis}>
            ענו על מספר שאלות קצרות וגלו אם מגיע לכם החזר.
            <br />
            <strong style={{ color: 'rgba(255,255,255,0.9)' }}>ללא איסוף מסמכים — אנחנו מטפלים בהכל!</strong>
          </Subtitle>

          <ButtonRow $vis={vis}>
            <Button size="lg" onClick={() => scrollTo('quiz')}>
               בדקו זכאות עכשיו
            </Button>
            <Button variant="secondary" size="lg" onClick={() => openWhatsApp()}>
               שלחו הודעה בוואטסאפ
            </Button>
          </ButtonRow>

       

          <CredRow $vis={vis}>
            <span> רואה חשבון מוסמך 🏅</span>
            <CredDot>·</CredDot>
            <span>בוגר קורס החזרי מס — לשכת רואי חשבון</span>
            <CredDot>·</CredDot>
            {/* <span>לא צריך שום עבודה מצדכם</span> */}
          </CredRow>
        </Content>
      </Container>

      <ScrollIndicator>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
          גללו למטה
        </span>
        <ScrollPill>
          <ScrollDot />
        </ScrollPill>
      </ScrollIndicator>
    </HeroSection>
  );
}

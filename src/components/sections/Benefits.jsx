import { useState } from 'react';
import styled from 'styled-components';
import { Section, Container, SectionTitle } from '@components/ui';
import { BENEFITS } from '@data/benefits';
import useInView from '@hooks/useInView';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
`;

const Card = styled.div`
  padding: 32px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ $hovered, theme }) =>
    $hovered
      ? `linear-gradient(135deg, ${theme.colors.navy}, ${theme.colors.navyLight})`
      : theme.colors.offWhite};
  border: 1px solid ${({ $hovered, theme }) =>
    $hovered ? 'transparent' : theme.colors.gray100};
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  transform: translateY(${({ $hovered }) => ($hovered ? '-8px' : '0')});
  box-shadow: ${({ $hovered, theme }) => ($hovered ? theme.shadows.xl : 'none')};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  cursor: default;
`;

const Icon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: ${({ theme }) => theme.radii.md};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 30px;
  background: ${({ $hovered }) =>
    $hovered ? 'rgba(0, 212, 188, 0.15)' : 'rgba(0, 180, 160, 0.08)'};
  color: ${({ $hovered, theme }) =>
    $hovered ? theme.colors.tealLight : theme.colors.teal};
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
`;

const CardTitle = styled.h4`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 10px;
  color: ${({ $hovered, theme }) =>
    $hovered ? theme.colors.white : theme.colors.navy};
  transition: color 0.3s;
`;

const CardDesc = styled.p`
  font-size: 15px;
  line-height: 1.7;
  color: ${({ $hovered, theme }) =>
    $hovered ? 'rgba(255,255,255,0.7)' : theme.colors.gray500};
  transition: color 0.3s;
`;

function BenefitCard({ benefit, delay }) {
  const [hov, setHov] = useState(false);
  const [ref, vis] = useInView();
  const IconComponent = benefit.icon;

  return (
    <Card
      ref={ref}
      $hovered={hov}
      $visible={vis}
      style={{ transitionDelay: `${delay * 0.1}s` }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <Icon $hovered={hov} aria-hidden="true">
        <IconComponent strokeWidth={1.75} />
      </Icon>
      <CardTitle $hovered={hov}>{benefit.title}</CardTitle>
      <CardDesc $hovered={hov}>{benefit.desc}</CardDesc>
    </Card>
  );
}

export default function Benefits() {
  return (
    <Section id="benefits">
      <Container>
        <SectionTitle sub="ללא איסוף מסמכים, ללא עבודה מצדך — הצוות שלנו מטפל בהכל מהרגע הראשון ועד קבלת הכסף">
          למה לבחור ב-REFOUNDIT?
        </SectionTitle>
        <Grid>
          {BENEFITS.map((b, i) => (
            <BenefitCard key={b.title} benefit={b} delay={i} />
          ))}
        </Grid>
      </Container>
    </Section>
  );
}

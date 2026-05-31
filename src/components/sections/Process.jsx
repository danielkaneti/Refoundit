import styled from 'styled-components';
import { Section, Container, SectionTitle } from '@components/ui';
import { PROCESS_STEPS } from '@data/benefits';
import useInView from '@hooks/useInView';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 28px;
`;

const StepCard = styled.div`
  text-align: center;
  padding: 32px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: translateY(${({ $visible }) => ($visible ? '0' : '30px')});
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: ${({ $delay }) => $delay}s;
`;

const IconBubble = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.teal},
    ${({ theme }) => theme.colors.tealLight}
  );
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: ${({ theme }) => theme.colors.white};
  font-size: 28px;
  box-shadow: 0 8px 24px rgba(0, 180, 160, 0.3);
`;

const StepNum = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.teal};
  letter-spacing: 1px;
  margin-bottom: 8px;
`;

const StepTitle = styled.h4`
  font-size: 19px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: 10px;
`;

const StepDesc = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.7;
`;

function ProcessStep({ step, index }) {
  const [ref, vis] = useInView();
  const IconComponent = step.icon;

  return (
    <StepCard ref={ref} $visible={vis} $delay={index * 0.15}>
      <IconBubble aria-hidden="true">
        <IconComponent strokeWidth={1.75} />
      </IconBubble>
      <StepNum>שלב {step.num}</StepNum>
      <StepTitle>{step.title}</StepTitle>
      <StepDesc>{step.desc}</StepDesc>
    </StepCard>
  );
}

export default function Process() {
  return (
    <Section
      id="process"
      $bg={`linear-gradient(135deg, #0A1628, #122244)`}
    >
      <Container>
        <SectionTitle light sub="הליך קצר ופשוט שמביא תוצאות">
           איך התהליך עובד?
        </SectionTitle>
        <Grid>
          {PROCESS_STEPS.map((step, i) => (
            <ProcessStep key={step.num} step={step} index={i} />
          ))}
        </Grid>
      </Container>
    </Section>
  );
}

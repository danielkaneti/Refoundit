import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { Section, Container, SectionTitle } from '@components/ui';
import { QUIZ_STEP1, QUIZ_STEP2 } from '@data/quiz';
import QuizStepTax from './QuizStepTax';
import QuizStepReasons from './QuizStepReasons';
import QuizResult from './QuizResult';

const TOTAL_STEPS = 3;

const Card = styled.div`
  max-width: 700px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    background: transparent;
    box-shadow: none;
    border-radius: 0;
  }
`;

const CardBody = styled.div`
  padding: clamp(24px, 5vw, 48px);

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0;
  }
`;

const StepHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
`;

const StepPill = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.gray100};
  color: ${({ theme }) => theme.colors.navy};
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
`;

const Dots = styled.div`
  display: flex;
  gap: 6px;
`;

const Dot = styled.div`
  width: ${({ $active }) => ($active ? '24px' : '8px')};
  height: 8px;
  border-radius: 4px;
  background: ${({ $done, $active, theme }) =>
    $done || $active ? theme.colors.teal : theme.colors.gray200};
  transition: all 0.3s ease;
`;

export default function QuizSection() {
  const [step, setStep] = useState(0);
  const [paidTax, setPaidTax] = useState(null);
  const [selected1, setSelected1] = useState([]);
  const [selected2, setSelected2] = useState([]);

  const toggleItem = useCallback((list, setList, id) => {
    setList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleTaxAnswer = (answer) => {
    setPaidTax(answer);
    setStep(answer === 'כן' ? 1 : 3);
  };

  const handleReset = () => {
    setStep(0);
    setPaidTax(null);
    setSelected1([]);
    setSelected2([]);
  };

  const hasSelections = selected1.length > 0 || selected2.length > 0;
  const showStepHeader = step < TOTAL_STEPS;

  return (
    <Section id="quiz" $bg="#F7F9FC">
      <Container>
        <SectionTitle sub="ענו על מספר שאלות קצרות וגלו אם מגיע לכם החזר">
           בדיקת זכאות מהירה
        </SectionTitle>

        <Card>
          <CardBody>
            {showStepHeader && (
              <StepHeader>
                {/* role="status" announces step changes to screen readers politely */}
                <StepPill role="status" aria-live="polite" aria-atomic="true">
                  {`שלב ${step + 1} מתוך ${TOTAL_STEPS}`}
                </StepPill>
                <Dots aria-hidden="true">
                  {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                    <Dot key={i} $active={i === step} $done={i < step} />
                  ))}
                </Dots>
              </StepHeader>
            )}

            {step === 0 && <QuizStepTax onAnswer={handleTaxAnswer} />}

            {step === 1 && (
              <QuizStepReasons
                title='מה מהמקרים הבאים נכון לגביך ב-6 השנים האחרונות?'
                items={QUIZ_STEP1}
                selected={selected1}
                onToggle={(id) => toggleItem(selected1, setSelected1, id)}
                onBack={() => setStep(0)}
                onNext={() => setStep(2)}
              />
            )}

            {step === 2 && (
              <QuizStepReasons
                title="מעולה! האם יש עוד מקרים שיכולים להתאים לך?"
                items={QUIZ_STEP2}
                selected={selected2}
                onToggle={(id) => toggleItem(selected2, setSelected2, id)}
                onBack={() => setStep(1)}
                onNext={() => {
                  setStep(3);
                  document.getElementById('quiz')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                nextLabel="בדוק זכאות"
              />
            )}

            {step === 3 && (
              <QuizResult
                paidTax={paidTax}
                hasSelections={hasSelections}
                onReset={handleReset}
              />
            )}
          </CardBody>
        </Card>
      </Container>
    </Section>
  );
}

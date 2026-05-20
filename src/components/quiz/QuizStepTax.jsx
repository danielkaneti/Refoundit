import styled from 'styled-components';
import { Button } from '@components/ui';
import { fadeInUp } from '@styles/animations';

const Wrapper = styled.div`
  animation: ${fadeInUp} 0.5s ease;
`;

const Title = styled.h3`
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.navy};
`;

const Desc = styled.p`
  color: ${({ theme }) => theme.colors.gray500};
  margin-bottom: 28px;
  font-size: 15px;
`;

const Row = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    gap: 12px;
  }
`;

export default function QuizStepTax({ onAnswer }) {
  return (
    <Wrapper>
      <Title>האם שילמת מס הכנסה ב-6 השנים האחרונות?</Title>
      <Desc>זוהי השאלה הראשונה לבדיקת הזכאות שלך</Desc>
      <Row>
        <Button
          size="lg"
          style={{ flex: 1 }}
          onClick={() => onAnswer('כן')}
        >
          כן
        </Button>
        <Button
          variant="outline"
          size="lg"
          style={{ flex: 1 }}
          onClick={() => onAnswer('לא')}
        >
          לא
        </Button>
      </Row>
    </Wrapper>
  );
}

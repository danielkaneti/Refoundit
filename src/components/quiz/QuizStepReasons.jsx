import styled from 'styled-components';
import { Button } from '@components/ui';
import CheckboxCard from './CheckboxCard';
import { fadeInUp } from '@styles/animations';

const Wrapper = styled.div`
  animation: ${fadeInUp} 0.5s ease;
`;

const Title = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 6px;
  color: ${({ theme }) => theme.colors.navy};
`;

const Desc = styled.p`
  color: ${({ theme }) => theme.colors.gray500};
  margin-bottom: 24px;
  font-size: 14px;
`;

const Grid = styled.div`
  display: grid;
  gap: 10px;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 28px;
  justify-content: space-between;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    position: sticky;
    bottom: 0;
    margin: 28px -24px 0;
    padding: 14px 24px calc(14px + env(safe-area-inset-bottom));
    background: ${({ theme }) => theme.colors.offWhite};
    box-shadow: 0 -6px 18px rgba(10, 22, 40, 0.08);
    z-index: 10;

    & > button {
      flex: 1;
    }
  }
`;

export default function QuizStepReasons({
  title,
  items,
  selected,
  onToggle,
  onBack,
  onNext,
  nextLabel = 'המשך',
}) {
  return (
    <Wrapper>
      <Title>{title}</Title>
      <Desc>ניתן לבחור יותר מאפשרות אחת</Desc>
      <Grid>
        {items.map((item) => (
          <CheckboxCard
            key={item.id}
            item={item}
            checked={selected.includes(item.id)}
            onToggle={() => onToggle(item.id)}
          />
        ))}
      </Grid>
      <Actions>
        <Button variant="outline" onClick={onBack}>
          חזרה
        </Button>
        <Button onClick={onNext}>{nextLabel}</Button>
      </Actions>
    </Wrapper>
  );
}

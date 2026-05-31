import { useState } from 'react';
import styled from 'styled-components';
import { Section, Container, SectionTitle } from '@components/ui';
import { FAQ_DATA } from '@data/faq';

const List = styled.div`
  max-width: 720px;
  margin: 0 auto;
  display: grid;
  gap: 12px;
`;

const Item = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  border: 1px solid
    ${({ $open, theme }) => ($open ? theme.colors.teal : theme.colors.gray100)};
  transition: all 0.3s ease;
  box-shadow: ${({ $open, theme }) => ($open ? theme.shadows.md : 'none')};
`;

/* Changed from styled.div to styled.button for full keyboard accessibility */
const Question = styled.button`
  padding: 20px 24px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background: none;
  border: none;
  font-family: inherit;
  text-align: right;

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.teal};
    outline-offset: -3px;
    border-radius: ${({ theme }) => theme.radii.md};
  }
`;

const QuestionText = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.navy};
`;

const Toggle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ $open, theme }) =>
    $open ? theme.colors.teal : theme.colors.gray100};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
  margin-right: 12px;
`;

const Arrow = styled.span`
  color: ${({ $open, theme }) => ($open ? 'white' : theme.colors.gray500)};
  transform: rotate(${({ $open }) => ($open ? '180deg' : '0deg')});
  transition: transform 0.3s ease;
  font-size: 14px;
`;

const AnswerWrapper = styled.div`
  max-height: ${({ $open }) => ($open ? '400px' : '0')};
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1);
`;

const AnswerText = styled.p`
  padding: 0 24px 20px;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.gray500};
  line-height: 1.8;
`;

function FAQItem({ item, isOpen, onToggle, index }) {
  const questionId = `faq-q-${index}`;
  const answerId = `faq-a-${index}`;

  return (
    <Item $open={isOpen}>
      <Question
        id={questionId}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={answerId}
      >
        <QuestionText>{item.q}</QuestionText>
        <Toggle $open={isOpen} aria-hidden="true">
          <Arrow $open={isOpen}>▼</Arrow>
        </Toggle>
      </Question>
      <AnswerWrapper
        id={answerId}
        role="region"
        aria-labelledby={questionId}
        $open={isOpen}
      >
        <AnswerText>{item.a}</AnswerText>
      </AnswerWrapper>
    </Item>
  );
}

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <Section id="faq" $bg="#F7F9FC" aria-labelledby="faq-heading">
      <Container>
        <SectionTitle id="faq-heading" sub="כל מה שצריך לדעת על החזרי מס">
          שאלות נפוצות
        </SectionTitle>
        <List>
          {FAQ_DATA.map((item, i) => (
            <FAQItem
              key={i}
              item={item}
              isOpen={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
              index={i}
            />
          ))}
        </List>
      </Container>
    </Section>
  );
}

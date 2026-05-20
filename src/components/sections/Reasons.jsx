import { useState } from 'react';
import styled from 'styled-components';
import { fadeInUp } from '@styles/animations';
import { Section, Container, SectionTitle } from '@components/ui';
import { REASONS } from '@data/quiz';

const TagCloud = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  max-width: 800px;
  margin: 0 auto;
`;

const Tag = styled.div`
  padding: 12px 24px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ $hovered, theme }) =>
    $hovered ? theme.colors.teal : theme.colors.offWhite};
  color: ${({ $hovered, theme }) =>
    $hovered ? theme.colors.white : theme.colors.navy};
  font-size: 15px;
  font-weight: 600;
  cursor: default;
  border: 1px solid
    ${({ $hovered, theme }) =>
      $hovered ? theme.colors.teal : theme.colors.gray200};
  transition: all 0.3s ease;
  transform: scale(${({ $hovered }) => ($hovered ? 1.05 : 1)});
  animation: ${fadeInUp} 0.5s ease both;
  animation-delay: ${({ $delay }) => $delay}s;
`;

function ReasonTag({ reason, index }) {
  const [hov, setHov] = useState(false);

  return (
    <Tag
      $hovered={hov}
      $delay={index * 0.04}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {reason}
    </Tag>
  );
}

export default function Reasons() {
  return (
    <Section>
      <Container>
        <SectionTitle sub="כמעט כל שכיר בישראל זכאי להחזר!">
          💰 הסיבות השכיחות להחזר מס
        </SectionTitle>
        <TagCloud>
          {REASONS.map((r, i) => (
            <ReasonTag key={r} reason={r} index={i} />
          ))}
        </TagCloud>
      </Container>
    </Section>
  );
}

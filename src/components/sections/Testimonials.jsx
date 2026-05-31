import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Section, Container, SectionTitle } from '@components/ui';
import { TESTIMONIALS } from '@data/testimonials';

const Carousel = styled.div`
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  min-height: 220px;
`;

const Slide = styled.div`
  position: ${({ $active }) => ($active ? 'relative' : 'absolute')};
  top: 0;
  left: 0;
  right: 0;
  opacity: ${({ $active }) => ($active ? 1 : 0)};
  transform: translateY(${({ $active }) => ($active ? '0' : '20px')})
    scale(${({ $active }) => ($active ? 1 : 0.95)});
  transition: all 0.5s ease;
  pointer-events: ${({ $active }) => ($active ? 'auto' : 'none')};
  text-align: center;
  padding: 32px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Amount = styled.div`
  font-size: 36px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.tealLight};
  margin-bottom: 8px;
`;

const AmountLabel = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  margin-bottom: 20px;
`;

const Quote = styled.p`
  font-size: 18px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.8;
  font-style: italic;
  margin-bottom: 20px;
`;

const Name = styled.div`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.white};
`;

const Dots = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
`;

/* Changed from styled.div to styled.button for keyboard accessibility */
const Dot = styled.button`
  width: ${({ $active }) => ($active ? '32px' : '8px')};
  height: 8px;
  border-radius: 4px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.teal : 'rgba(255,255,255,0.2)'};
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  padding: 0;

  &:focus-visible {
    outline: 3px solid white;
    outline-offset: 3px;
  }
`;

export default function Testimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    /* Respect prefers-reduced-motion — stop auto-advance for vestibular safety */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Section
      $bg="linear-gradient(135deg, #0A1628, #1B3A5C)"
      aria-labelledby="testimonials-heading"
    >
      <Container>
        <SectionTitle id="testimonials-heading" light sub="לקוחות שכבר קיבלו את הכסף שמגיע להם">
          מה אומרים עלינו?
        </SectionTitle>

        {/* aria-live="polite" announces slide changes to screen readers */}
        <Carousel
          aria-roledescription="קרוסל עדויות"
          aria-label="עדויות לקוחות"
        >
          {TESTIMONIALS.map((t, i) => (
            <Slide
              key={i}
              $active={i === active}
              role="group"
              aria-roledescription="עדות"
              aria-label={`עדות ${i + 1} מתוך ${TESTIMONIALS.length}`}
              aria-hidden={i !== active}
            >
              <Amount aria-label={`סכום החזר: ₪${t.amount}`}>₪{t.amount}</Amount>
              <AmountLabel aria-hidden="true">סכום ההחזר</AmountLabel>
              <Quote>&ldquo;{t.text}&rdquo;</Quote>
              <Name>{t.name}</Name>
            </Slide>
          ))}

          <Dots role="tablist" aria-label="בחרו עדות">
            {TESTIMONIALS.map((t, i) => (
              <Dot
                key={i}
                type="button"
                role="tab"
                $active={i === active}
                aria-selected={i === active}
                aria-label={`עדות של ${t.name}`}
                onClick={() => setActive(i)}
              />
            ))}
          </Dots>
        </Carousel>
      </Container>
    </Section>
  );
}

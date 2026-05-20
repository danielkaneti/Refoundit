import { useState } from 'react';
import styled from 'styled-components';
import { FaWhatsapp } from 'react-icons/fa';
import { fadeInUp } from '@styles/animations';
import { Section, Container, SectionTitle, Button } from '@components/ui';
import ContactForm from './ContactForm';
import ContactInfoCards from './ContactInfoCards';
import { openWhatsApp } from '@utils/whatsapp';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  max-width: 900px;
  margin: 0 auto;
`;

const SuccessCard = styled.div`
  max-width: 560px;
  margin: 0 auto;
  text-align: center;
  padding: 48px;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  animation: ${fadeInUp} 0.5s ease;
`;

const SuccessIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const SuccessTitle = styled.h3`
  font-size: 28px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: 12px;
`;

const SuccessDesc = styled.p`
  color: ${({ theme }) => theme.colors.gray500};
  margin-bottom: 28px;
  line-height: 1.7;
`;

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Section id="contact" $bg="#F7F9FC">
        <Container>
          <SuccessCard>
            <SuccessIcon>✅</SuccessIcon>
            <SuccessTitle>תודה! הפרטים נשלחו בהצלחה</SuccessTitle>
            <SuccessDesc>
              נחזור אליך בהקדם האפשרי. בינתיים, ניתן לפנות אלינו גם דרך
              וואטסאפ.
            </SuccessDesc>
            <Button
              variant="whatsapp"
              size="lg"
              onClick={() => openWhatsApp()}
            >
              שלחו הודעה בוואטסאפ
              <FaWhatsapp />
            </Button>
          </SuccessCard>
        </Container>
      </Section>
    );
  }

  return (
    <Section id="contact" $bg="#F7F9FC">
      <Container>
        <SectionTitle sub="השאירו פרטים ונחזור אליכם בהקדם">
          📞 צרו קשר
        </SectionTitle>
        <Grid>
          <ContactForm onSuccess={() => setSubmitted(true)} />
          <ContactInfoCards />
        </Grid>
      </Container>
    </Section>
  );
}

import styled from 'styled-components';
import { LuMail, LuPhone } from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa';
import { Button } from '@components/ui';
import { CONTACT } from '@data/config';
import { openWhatsApp, callPhone } from '@utils/whatsapp';

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: center;
`;

const Card = styled.div`
  padding: 24px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border: 1px solid ${({ theme }) => theme.colors.gray100};
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    text-align: center;
  }
`;

const IconBox = styled.div`
  width: 56px;
  height: 56px;
  border-radius: ${({ theme }) => theme.radii.md};
  flex-shrink: 0;
  background: rgba(0, 180, 160, 0.08);
  color: ${({ theme }) => theme.colors.teal};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
`;

const Info = styled.div`
  flex: 1;
`;

const CardTitle = styled.h4`
  font-size: 17px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: 4px;
`;

const CardDesc = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray500};
`;

const CARDS = [
  {
    icon: FaWhatsapp,
    title: 'וואטסאפ',
    desc: 'שלחו הודעה ונחזור מיד',
    action: () => openWhatsApp('contact'),
    btnText: 'שלחו הודעה',
    btnVariant: 'whatsapp',
  },
  {
    icon: LuMail,
    title: 'אימייל',
    desc: CONTACT.email,
    action: () => window.open(`mailto:${CONTACT.email}`, '_blank'),
    btnText: 'שלחו מייל',
    btnVariant: 'outline',
  },
  {
    icon: LuPhone,
    title: 'טלפון',
    desc: CONTACT.phoneDisplay,
    action: () => callPhone(),
    btnText: 'התקשרו עכשיו',
    btnVariant: 'outline',
  },
];

export default function ContactInfoCards() {
  return (
    <Stack>
      {CARDS.map((card) => {
        const IconComponent = card.icon;
        return (
          <Card key={card.title}>
            <IconBox>
              <IconComponent strokeWidth={1.75} />
            </IconBox>
            <Info>
              <CardTitle>{card.title}</CardTitle>
              <CardDesc>{card.desc}</CardDesc>
            </Info>
            <Button size="sm" variant={card.btnVariant} onClick={card.action}>
              {card.btnText}
            </Button>
          </Card>
        );
      })}
    </Stack>
  );
}

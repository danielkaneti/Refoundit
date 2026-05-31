import { useState } from 'react';
import styled from 'styled-components';
import { LuMail, LuPhone } from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa';
import { Container, Button } from '@components/ui';
import { CONTACT, COMPANY } from '@data/config';
import { openWhatsApp } from '@utils/whatsapp';
import AccessibilityStatement from './AccessibilityStatement';

const FooterWrapper = styled.footer`
  background: ${({ theme }) => theme.colors.navy};
  padding: 48px 0 28px;
  color: rgba(255, 255, 255, 0.6);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const LogoArea = styled.div``;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
`;

const LogoMark = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.teal},
    ${({ theme }) => theme.colors.tealLight}
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 16px;
  color: white;
`;

const LogoText = styled.span`
  font-size: 20px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.white};
`;

const Desc = styled.p`
  font-size: 14px;
  line-height: 1.7;
`;

const ColTitle = styled.h2`
  color: ${({ theme }) => theme.colors.white};
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 16px;
`;

const FooterLink = styled.a`
  display: block;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  padding: 4px 0;
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.teal};
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.teal};
    outline-offset: 4px;
    border-radius: 4px;
  }
`;

const ContactRow = styled.p`
  font-size: 14px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

/* contrast fix: 0.4 → 0.6 (≈7.3:1 vs navy, passes WCAG AA) */
const Bottom = styled.div`
  padding-top: 24px;
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
`;

const A11yLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.teal};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  margin-top: 10px;
  display: inline-block;

  &:hover {
    color: ${({ theme }) => theme.colors.tealLight};
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.teal};
    outline-offset: 3px;
    border-radius: 2px;
  }
`;

const FOOTER_LINKS = [
  { label: 'בדיקת זכאות', href: '#quiz' },
  { label: 'איך זה עובד', href: '#process' },
  { label: 'למה אנחנו', href: '#benefits' },
  { label: 'שאלות נפוצות', href: '#faq' },
  { label: 'צור קשר', href: '#contact' },
];

export default function Footer() {
  const [showA11y, setShowA11y] = useState(false);

  return (
    <FooterWrapper aria-label="פוטר האתר">
      {showA11y && <AccessibilityStatement onClose={() => setShowA11y(false)} />}
      <Container>
        <Grid>
          <LogoArea>
            <LogoRow>
              <LogoMark aria-hidden="true">R</LogoMark>
              <LogoText>{COMPANY.name}</LogoText>
            </LogoRow>
            <Desc>
              {COMPANY.tagline}
              <br />
              {COMPANY.description}
            </Desc>
          </LogoArea>

          <nav aria-label="ניווט מהיר">
            <ColTitle>ניווט מהיר</ColTitle>
            {FOOTER_LINKS.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </nav>

          <div>
            <ColTitle>צרו קשר</ColTitle>
            <ContactRow>
              {CONTACT.email}
              <LuMail aria-hidden="true" strokeWidth={1.75} />
            </ContactRow>
            
            <div style={{ marginTop: 16 }}>
              <Button variant="whatsapp" size="sm" onClick={() => openWhatsApp()}>
                וואטסאפ
                <FaWhatsapp aria-hidden="true" />
              </Button>
            </div>
          </div>
        </Grid>

        <Bottom>
          <p>© {new Date().getFullYear()} {COMPANY.name}. כל הזכויות שמורות.</p>
          <p style={{ marginTop: 8 }}>
            * המידע באתר אינו מהווה תחליף לייעוץ מס מקצועי. בדיקת הזכאות הינה
            ראשונית ובכפוף לבדיקה מעמיקה.
          </p>
          <div>
            <A11yLink type="button" onClick={() => setShowA11y(true)}>
              הצהרת נגישות
            </A11yLink>
          </div>
        </Bottom>
      </Container>
    </FooterWrapper>
  );
}

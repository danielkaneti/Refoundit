import { LuArrowLeft } from 'react-icons/lu';
import { Navbar, Footer, WhatsAppFAB } from '@components/layout';
import { Container } from '@components/ui';
import { ELIGIBILITY_PATH } from '../content/index.js';
import { CtaBand, CtaLink, DesktopContact } from './styles';

export default function BlogLayout({ children }) {
  return (
    <>
      <a href="#main-content" className="skip-nav">דלג לתוכן הראשי</a>
      <Navbar solid />
      <main id="main-content">
        {children}
        <CtaBand aria-labelledby="eligibility-heading">
          <Container>
            <h2 id="eligibility-heading">רוצים לבדוק את המקרה שלכם?</h2>
            <p>ייתכן שמגיע לכם החזר מס. מתחילים בבדיקה ראשונית ללא התחייבות; קביעת זכאות דורשת בדיקת מסמכים וחישוב אישי.</p>
            <CtaLink id="blog-eligibility" href={ELIGIBILITY_PATH} aria-label="בדיקת זכאות להחזר מס באתר REFOUNDIT">
              בדיקת זכאות להחזר מס <LuArrowLeft aria-hidden="true" />
            </CtaLink>
          </Container>
        </CtaBand>
      </main>
      <Footer />
      <DesktopContact><WhatsAppFAB /></DesktopContact>
    </>
  );
}
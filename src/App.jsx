import { Navbar, Footer, WhatsAppFAB } from '@components/layout';
import {
  Hero,
  Benefits,
  Process,
  Reasons,
  Testimonials,
  FAQ,
  CTA,
} from '@components/sections';
import QuizSection from '@components/quiz/QuizSection';
import ContactSection from '@components/contact/ContactSection';

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <QuizSection />
      <Benefits />
      <Process />
      <Reasons />
      <Testimonials />
      <FAQ />
      <ContactSection />
      <CTA />
      <Footer />
      <WhatsAppFAB />
    </>
  );
}

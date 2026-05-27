import { useState, useCallback } from 'react';
import { Navbar, Footer, WhatsAppFAB, PageLoader } from '@components/layout';
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
  const [loaded, setLoaded] = useState(false);
  const handleLoaderDone = useCallback(() => setLoaded(true), []);

  return (
    <>
      {!loaded && <PageLoader onDone={handleLoaderDone} />}
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

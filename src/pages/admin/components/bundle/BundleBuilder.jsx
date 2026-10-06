import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Button } from '@components/ui';
import { useOfficeSettings } from '../../api/settings';
import { layoutIntro, ensureIntroFonts } from '../../utils/bundle/introRenderer';
import {
  bundleTitle,
  buildIntroEntries,
  computeDocumentPages,
  formatDateDMY,
  totalBundlePages,
} from '../../utils/bundle/pageCalc';
import { Heading, Row } from '../styles';
import Stepper from './Stepper';
import DetailsStep from './DetailsStep';
import UploadStep from './UploadStep';
import ArrangeStep from './ArrangeStep';
import PreviewStep from './PreviewStep';
import GenerateStep from './GenerateStep';

const STEPS = ['פרטי החבילה', 'העלאת מסמכים', 'סידור ועריכה', 'תצוגה מקדימה', 'הפקה'];

const Nav = styled(Row)`
  justify-content: space-between;
  margin-top: 24px;
`;

const todayIso = () => new Date().toISOString().slice(0, 10);

/**
 * Document bundle builder — runs entirely in the browser. Client documents are
 * never uploaded; the merged PDF is downloaded directly.
 */
export default function BundleBuilder() {
  const office = useOfficeSettings();
  const [step, setStep] = useState(0);
  const [fontsReady, setFontsReady] = useState(false);
  const [packageData, setPackageData] = useState({
    clientName: '',
    caseNumber: '',
    taxYear: String(new Date().getFullYear() - 1),
    docDate: todayIso(),
    notes: '',
  });
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    ensureIntroFonts().finally(() => setFontsReady(true));
  }, []);

  const updatePackage = useCallback((patch) => setPackageData((prev) => ({ ...prev, ...patch })), []);

  /** Fills only fields that are still empty (e.g. from a detected 1301 report). */
  const handleAutoFill = useCallback((found) => {
    setPackageData((prev) => {
      const next = { ...prev };
      for (const [key, value] of Object.entries(found)) {
        if (value && !prev[key]?.trim?.()) next[key] = value;
      }
      return next;
    });
  }, []);

  const title = useMemo(() => bundleTitle(packageData), [packageData]);
  const introData = useMemo(
    () => ({ ...packageData, docDateText: formatDateDMY(packageData.docDate) }),
    [packageData]
  );

  // Intro length shifts every document's start page: lay out once to count the
  // intro pages, then place documents after it.
  const bundle = useMemo(() => {
    if (!office.data) return null;
    const entries = buildIntroEntries(computeDocumentPages(docs, 1));
    const layoutArgs = { office: office.data, packageData: introData, title, entries, hasSignature: true };
    const introPageCount = fontsReady ? layoutIntro(layoutArgs).length : 1;
    const placedDocs = computeDocumentPages(docs, introPageCount);
    const finalEntries = buildIntroEntries(placedDocs);
    return {
      introPageCount,
      placedDocs,
      entries: finalEntries,
      totalPages: totalBundlePages(placedDocs, introPageCount),
      layoutArgs: { ...layoutArgs, entries: finalEntries },
    };
  }, [docs, fontsReady, introData, office.data, title]);

  const canContinue = step !== 0 || Boolean(packageData.clientName.trim());
  const isLast = step === STEPS.length - 1;

  return (
    <>
      <Heading>חבילת מסמכים</Heading>
      <Stepper steps={STEPS} current={step} onSelect={(index) => (index <= step || canContinue) && setStep(index)} />

      {step === 0 && <DetailsStep packageData={packageData} onChange={updatePackage} title={title} />}
      {step === 1 && (
        <UploadStep docs={docs} setDocs={setDocs} taxYear={packageData.taxYear} onAutoFill={handleAutoFill} />
      )}
      {step === 2 && bundle && <ArrangeStep docs={docs} setDocs={setDocs} bundle={bundle} taxYear={packageData.taxYear} />}
      {step === 3 && bundle && <PreviewStep bundle={bundle} />}
      {step === 4 && bundle && (
        <GenerateStep bundle={bundle} office={office.data} title={title} clientName={packageData.clientName} />
      )}

      <Nav>
        <Button id="bundle-prev" variant="outline" size="sm" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
          הקודם
        </Button>
        {!isLast && (
          <Button id="bundle-next" size="sm" onClick={() => setStep((s) => s + 1)} disabled={!canContinue}>
            הבא
          </Button>
        )}
      </Nav>
    </>
  );
}

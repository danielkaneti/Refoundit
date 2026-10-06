import { memo, useCallback, useState } from 'react';
import { LuDownload } from 'react-icons/lu';
import { Button } from '@components/ui';
import { buildMergedPdf, downloadPdf } from '../../utils/bundle/buildBundle';
import { renderFooterCanvas } from '../../utils/bundle/introRenderer';
import { Card, ErrorText, Muted, SubHeading } from '../styles';
import useIntroCanvases from './useIntroCanvases';

function GenerateStep({ bundle, office, title, clientName }) {
  const canvases = useIntroCanvases(bundle.layoutArgs);
  const [state, setState] = useState({ status: 'idle', error: null });
  const usableCount = bundle.placedDocs.filter((doc) => doc.startPage).length;

  const handleGenerate = useCallback(async () => {
    setState({ status: 'working', error: null });
    try {
      const bytes = await buildMergedPdf({
        introCanvases: canvases,
        footerCanvas: renderFooterCanvas(office),
        docs: bundle.placedDocs,
        title,
      });
      downloadPdf(bytes, `${clientName} - ${title}.pdf`);
      setState({ status: 'done', error: null });
    } catch (err) {
      console.error('Bundle generation failed:', err?.message);
      setState({ status: 'idle', error: 'הפקת החבילה נכשלה. בדקו שכל הקבצים תקינים ונסו שוב.' });
    }
  }, [bundle.placedDocs, canvases, clientName, office, title]);

  return (
    <Card style={{ maxWidth: 640 }} aria-labelledby="bundle-generate-title">
      <SubHeading id="bundle-generate-title">הפקת החבילה</SubHeading>
      <Muted>
        {bundle.introPageCount} עמודי מכתב מקדים + {usableCount} מסמכים · סה&quot;כ {bundle.totalPages} עמודים. בתחתית
        כל עמוד יופיעו פרטי המשרד. הקובץ יורד ישירות למחשב ולא נשמר בשרת.
      </Muted>
      {usableCount === 0 && <ErrorText role="alert">אין מסמכים תקינים לצירוף.</ErrorText>}
      {state.error && <ErrorText role="alert">{state.error}</ErrorText>}
      <div style={{ marginTop: 20 }}>
        <Button
          id="bundle-generate"
          onClick={handleGenerate}
          disabled={!canvases || state.status === 'working' || usableCount === 0}
        >
          {state.status === 'working' ? 'מפיק PDF…' : 'הפקה והורדה'}
          <LuDownload aria-hidden="true" />
        </Button>
      </div>
      {state.status === 'done' && (
        <Muted role="status" style={{ marginTop: 12 }}>
          הקובץ &quot;{clientName} - {title}.pdf&quot; הורד ✓
        </Muted>
      )}
    </Card>
  );
}

export default memo(GenerateStep);

import { useEffect, useState } from 'react';
import useObjectUrl from '@hooks/useObjectUrl';
import { useOwnerSignature } from '../../api/settings';
import { layoutIntro, loadImage, paintPages } from '../../utils/bundle/introRenderer';

/** Paints the cover letter pages (with the stored signature) for the current bundle. */
export default function useIntroCanvases(layoutArgs) {
  const signature = useOwnerSignature();
  const signatureUrl = useObjectUrl(signature.data, 'image/png');
  const [canvases, setCanvases] = useState(null);

  useEffect(() => {
    if (signature.isLoading) return undefined;
    let cancelled = false;
    (async () => {
      const signatureImage = signatureUrl ? await loadImage(signatureUrl).catch(() => null) : null;
      const pages = layoutIntro({ ...layoutArgs, hasSignature: Boolean(signatureImage) });
      if (!cancelled) setCanvases(paintPages(pages, { signatureImage }));
    })();
    return () => {
      cancelled = true;
    };
  }, [layoutArgs, signature.isLoading, signatureUrl]);

  return canvases;
}

import { useEffect, useState } from 'react';
import useObjectUrl from '@hooks/useObjectUrl';
import { useOwnerSignature } from '../../api/settings';
import logoUrl from '../../assets/logo.jpg';
import { layoutIntro, loadImage, paintPages, trimWhitespace } from '../../utils/bundle/introRenderer';

let logoPromise;
const loadLogo = () => {
  logoPromise ??= loadImage(logoUrl).then(trimWhitespace).catch(() => null);
  return logoPromise;
};

/** Paints the cover letter pages (with the stored signature) for the current bundle. */
export default function useIntroCanvases(layoutArgs) {
  const signature = useOwnerSignature();
  const signatureUrl = useObjectUrl(signature.data, 'image/png');
  const [canvases, setCanvases] = useState(null);

  useEffect(() => {
    if (signature.isLoading) return undefined;
    let cancelled = false;
    (async () => {
      const [signatureImage, logoImage] = await Promise.all([
        signatureUrl ? loadImage(signatureUrl).catch(() => null) : null,
        loadLogo(),
      ]);
      const pages = layoutIntro({ ...layoutArgs, hasSignature: Boolean(signatureImage), hasLogo: Boolean(logoImage) });
      if (!cancelled) setCanvases(paintPages(pages, { signatureImage, logoImage }));
    })();
    return () => {
      cancelled = true;
    };
  }, [layoutArgs, signature.isLoading, signatureUrl]);

  return canvases;
}

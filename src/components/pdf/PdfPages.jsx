import { memo, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { loadPdfDocument } from './pdfjs';

const Pages = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
`;

const PageWrap = styled.div`
  position: relative;
  width: 100%;
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border-radius: 4px;
  overflow: hidden;

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
`;

const PageNumber = styled.span`
  position: absolute;
  bottom: 6px;
  left: 8px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray400};
  pointer-events: none;
`;

/* Fields are positioned with physical left/top percentages — same frame as pdf.js. */
const Overlay = styled.div`
  position: absolute;
  inset: 0;
  direction: ltr;
`;

const Message = styled.p`
  padding: 48px 16px;
  text-align: center;
  color: ${({ $error, theme }) => ($error ? theme.colors.danger : theme.colors.gray500)};
`;

/**
 * Renders every page of a PDF to a canvas sized to the container.
 * `renderOverlay(pageIndex, { pxPerPt })` draws interactive content on top.
 */
export default function PdfPages({ data, renderOverlay, label = 'תצוגת המסמך' }) {
  const [doc, setDoc] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!data) return undefined;
    let cancelled = false;
    let loaded = null;
    setFailed(false);

    loadPdfDocument(data)
      .then((pdf) => {
        if (cancelled) {
          pdf.destroy();
          return;
        }
        loaded = pdf;
        setDoc(pdf);
      })
      .catch(() => !cancelled && setFailed(true));

    return () => {
      cancelled = true;
      loaded?.destroy();
      setDoc(null);
    };
  }, [data]);

  if (failed) {
    return (
      <Message $error role="alert">
        לא ניתן להציג את המסמך
      </Message>
    );
  }
  if (!doc) return <Message role="status">טוען מסמך…</Message>;

  return (
    <Pages role="region" aria-label={label}>
      {Array.from({ length: doc.numPages }, (_, index) => (
        <PdfPage key={index} doc={doc} index={index} renderOverlay={renderOverlay} />
      ))}
    </Pages>
  );
}

const PdfPage = memo(function PdfPage({ doc, index, renderOverlay }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [page, setPage] = useState(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    let cancelled = false;
    doc.getPage(index + 1).then((loaded) => !cancelled && setPage(loaded));
    return () => {
      cancelled = true;
    };
  }, [doc, index]);

  useEffect(() => {
    // Measure right away — ResizeObserver's first callback waits for a rendered frame.
    setWidth(Math.floor(wrapRef.current.getBoundingClientRect().width));
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!page || !width) return undefined;
    const base = page.getViewport({ scale: 1 });
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const viewport = page.getViewport({ scale: (width / base.width) * pixelRatio });
    const canvas = canvasRef.current;
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const task = page.render({ canvasContext: canvas.getContext('2d'), viewport });
    task.promise.catch(() => {
      /* cancelled by a newer render */
    });
    return () => task.cancel();
  }, [page, width]);

  const base = page?.getViewport({ scale: 1 });
  const aspectRatio = base ? `${base.width} / ${base.height}` : '1 / 1.414';
  const pxPerPt = base && width ? width / base.width : 0;

  return (
    <PageWrap
      ref={wrapRef}
      style={{ aspectRatio }}
      role="group"
      aria-label={`עמוד ${index + 1} מתוך ${doc.numPages}`}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <PageNumber aria-hidden="true">
        {index + 1} / {doc.numPages}
      </PageNumber>
      {pxPerPt > 0 && renderOverlay && (
        <Overlay data-pdf-overlay>{renderOverlay(index, { pxPerPt })}</Overlay>
      )}
    </PageWrap>
  );
});

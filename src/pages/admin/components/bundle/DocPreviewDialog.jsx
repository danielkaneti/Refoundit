import { memo, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Button } from '@components/ui';
import useObjectUrl from '@hooks/useObjectUrl';
import { renderPdfPage } from '../../utils/bundle/fileInfo';
import { Muted, Row } from '../styles';

const Dialog = styled.dialog`
  width: min(760px, calc(100vw - 24px));
  max-height: calc(100vh - 48px);
  border: none;
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 20px;
  margin: auto;

  &::backdrop {
    background: rgba(10, 22, 40, 0.6);
  }

  img {
    width: 100%;
    border: 1px solid ${({ theme }) => theme.colors.gray200};
  }
`;

function DocPreviewDialog({ doc, onClose }) {
  const dialogRef = useRef(null);
  const [page, setPage] = useState(1);
  const [src, setSrc] = useState(null);
  const imageUrl = useObjectUrl(doc?.kind === 'image' ? doc.bytes : null, doc?.mime);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (doc && !dialog.open) dialog.showModal();
    if (!doc && dialog.open) dialog.close();
    setPage(1);
  }, [doc]);

  useEffect(() => {
    if (doc?.kind !== 'pdf') return undefined;
    let cancelled = false;
    setSrc(null);
    renderPdfPage(doc.bytes, page, 700).then((url) => !cancelled && setSrc(url));
    return () => {
      cancelled = true;
    };
  }, [doc, page]);

  const shown = doc?.kind === 'image' ? imageUrl : src;

  return (
    <Dialog ref={dialogRef} onClose={onClose} aria-labelledby="bundle-preview-title">
      <Row style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <strong id="bundle-preview-title">{doc?.introTitle}</strong>
        <Button id="bundle-preview-close" size="sm" variant="ghost" onClick={onClose}>
          סגירה
        </Button>
      </Row>
      {shown ? <img src={shown} alt={`עמוד ${page} של ${doc?.introTitle ?? ''}`} /> : <Muted role="status">טוען…</Muted>}
      {doc?.kind === 'pdf' && doc.pageCount > 1 && (
        <Row style={{ justifyContent: 'center', marginTop: 12 }}>
          <Button id="bundle-preview-prev" size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            הקודם
          </Button>
          <Muted as="span" aria-live="polite">
            עמוד {page} מתוך {doc.pageCount}
          </Muted>
          <Button id="bundle-preview-next" size="sm" variant="outline" disabled={page >= doc.pageCount} onClick={() => setPage((p) => p + 1)}>
            הבא
          </Button>
        </Row>
      )}
    </Dialog>
  );
}

export default memo(DocPreviewDialog);

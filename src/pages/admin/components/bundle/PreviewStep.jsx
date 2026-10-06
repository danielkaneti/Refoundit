import { memo, useMemo } from 'react';
import styled from 'styled-components';
import { formatPageRange } from '../../utils/bundle/pageCalc';
import { Card, Muted, SubHeading } from '../styles';
import useIntroCanvases from './useIntroCanvases';

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 24px;
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const Pages = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 794px;

  img {
    width: 100%;
    box-shadow: ${({ theme }) => theme.shadows.md};
    background: #fff;
  }
`;

const MapList = styled.ol`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;

  li {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    border-radius: ${({ theme }) => theme.radii.sm};
    background: ${({ theme }) => theme.colors.offWhite};
    font-size: 14px;
  }

  span:last-child {
    white-space: nowrap;
    color: ${({ theme }) => theme.colors.gray500};
    font-size: 13px;
  }
`;

function PreviewStep({ bundle }) {
  const canvases = useIntroCanvases(bundle.layoutArgs);
  const images = useMemo(() => canvases?.map((canvas) => canvas.toDataURL('image/png')) ?? null, [canvases]);

  return (
    <Layout>
      <Pages aria-label="תצוגה מקדימה של המכתב המקדים">
        {!images && <Muted role="status">מכין תצוגה…</Muted>}
        {images?.map((src, i) => (
          <img key={i} src={src} alt={`מכתב מקדים, עמוד ${i + 1} מתוך ${images.length}`} />
        ))}
      </Pages>
      <Card aria-labelledby="bundle-map-title">
        <SubHeading id="bundle-map-title">מפת החבילה</SubHeading>
        <MapList>
          <li>
            <span>מכתב מקדים</span>
            <span>{formatPageRange(1, bundle.introPageCount)}</span>
          </li>
          {bundle.entries.map((entry, i) => (
            <li key={entry.docIds[0]}>
              <span>
                {i + 1}. {entry.title}
                {entry.docIds.length > 1 && ` (${entry.docIds.length} מסמכים)`}
              </span>
              <span>{formatPageRange(entry.startPage, entry.endPage)}</span>
            </li>
          ))}
        </MapList>
        <Muted style={{ marginTop: 12 }}>
          סה&quot;כ <strong>{bundle.totalPages}</strong> עמודים
        </Muted>
      </Card>
    </Layout>
  );
}

export default memo(PreviewStep);

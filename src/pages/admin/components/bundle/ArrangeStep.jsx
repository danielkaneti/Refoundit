import { memo, useCallback, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { HiOutlineChevronDown, HiOutlineChevronUp, HiOutlineEye, HiOutlineRefresh, HiOutlineTrash } from 'react-icons/hi';
import { LuScissors, LuGripVertical, LuLink, LuUnlink } from 'react-icons/lu';
import { DOCUMENT_TYPES, introTitleFor } from '../../utils/bundle/documentTypes';
import { analyzeDoc, baseDoc, createDocFromFile } from '../../utils/bundle/createDoc';
import { splitPdfIntoPages } from '../../utils/bundle/fileInfo';
import { formatPageRange, parsePageSelection } from '../../utils/bundle/pageCalc';
import { Badge, Card, ErrorText, IconButton, Muted, Row } from '../styles';
import DocPreviewDialog from './DocPreviewDialog';

const Toolbar = styled(Row)`
  justify-content: space-between;
  margin-bottom: 16px;
`;

const Totals = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray600};

  strong {
    color: #1e3a5f;
  }
`;

const List = styled.ol`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Item = styled.li`
  display: grid;
  grid-template-columns: auto 52px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
  padding: 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.gray200};
  background: ${({ theme }) => theme.colors.white};

  ${({ $grouped }) =>
    $grouped &&
    css`
      border-inline-start: 4px solid #1e3a5f;
    `}
  ${({ $bad }) =>
    $bad &&
    css`
      opacity: 0.65;
      border-color: #e74c3c;
    `}
  ${({ $dragOver, theme }) =>
    $dragOver &&
    css`
      box-shadow: 0 -3px 0 ${theme.colors.teal};
    `}

  img {
    width: 52px;
    height: 68px;
    object-fit: cover;
    border: 1px solid ${({ theme }) => theme.colors.gray200};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: auto minmax(0, 1fr);
    img {
      display: none;
    }
  }
`;

const Handle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: ${({ theme }) => theme.colors.gray400};

  .grip {
    cursor: grab;
  }
`;

const Fields = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px 12px;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray500};
  grid-column: ${({ $wide }) => ($wide ? 'span 2' : 'auto')};

  input,
  select {
    font: inherit;
    font-size: 14px;
    font-weight: 400;
    color: ${({ theme }) => theme.colors.navy};
    padding: 8px 10px;
    border-radius: ${({ theme }) => theme.radii.sm};
    border: 1px solid ${({ $invalid, theme }) => ($invalid ? theme.colors.danger : theme.colors.gray200)};
    background: #fff;
  }
`;

const Meta = styled(Row)`
  margin-top: 8px;
  gap: 8px;
  font-size: 13px;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
  max-width: 180px;
`;

const HiddenInput = styled.input`
  display: none;
`;

const move = (list, from, to) => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

function ArrangeStep({ docs, setDocs, bundle, taxYear }) {
  const [selected, setSelected] = useState(() => new Set());
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const replaceRef = useRef({});

  const placedById = useMemo(
    () => Object.fromEntries(bundle.placedDocs.map((doc) => [doc.id, doc])),
    [bundle.placedDocs]
  );

  const update = useCallback(
    (id, patch) => setDocs((prev) => prev.map((doc) => (doc.id === id ? { ...doc, ...patch } : doc))),
    [setDocs]
  );

  const toggleSelected = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const moveBy = useCallback(
    (index, delta) => setDocs((prev) => (index + delta < 0 || index + delta >= prev.length ? prev : move(prev, index, index + delta))),
    [setDocs]
  );

  const handleDrop = useCallback(
    (targetId) => {
      setDocs((prev) => {
        const from = prev.findIndex((doc) => doc.id === dragId);
        const to = prev.findIndex((doc) => doc.id === targetId);
        return from < 0 || to < 0 || from === to ? prev : move(prev, from, to);
      });
      setDragId(null);
      setOverId(null);
    },
    [dragId, setDocs]
  );

  /** Selected rows become one cover-letter row, kept contiguous at the first one's position. */
  const groupSelected = useCallback(() => {
    const groupId = `group-${Date.now().toString(36)}`;
    setDocs((prev) => {
      const members = prev.filter((doc) => selected.has(doc.id));
      if (members.length < 2) return prev;
      const firstIndex = prev.findIndex((doc) => selected.has(doc.id));
      const rest = prev.filter((doc) => !selected.has(doc.id));
      const position = rest.filter((doc) => prev.indexOf(doc) < firstIndex).length;
      const grouped = members.map((doc) => ({ ...doc, groupId, introTitle: members[0].introTitle }));
      return [...rest.slice(0, position), ...grouped, ...rest.slice(position)];
    });
    setSelected(new Set());
  }, [selected, setDocs]);

  const ungroupSelected = useCallback(() => {
    setDocs((prev) => prev.map((doc) => (selected.has(doc.id) ? { ...doc, groupId: null } : doc)));
    setSelected(new Set());
  }, [selected, setDocs]);

  const splitDoc = useCallback(
    async (doc) => {
      setBusyId(doc.id);
      setError(null);
      try {
        const parts = await splitPdfIntoPages(doc.bytes);
        const analyzed = await Promise.all(
          parts.map(async (bytes, i) => {
            const part = baseDoc({ name: `${doc.name} (עמ' ${i + 1})`, kind: 'pdf', mime: 'application/pdf', bytes });
            const { doc: result } = await analyzeDoc(part);
            return { ...result, docType: doc.docType, introTitle: `${doc.introTitle} (עמ' ${i + 1})`, ownerName: doc.ownerName, needsConfirmation: false };
          })
        );
        setDocs((prev) => {
          const index = prev.findIndex((item) => item.id === doc.id);
          return [...prev.slice(0, index), ...analyzed, ...prev.slice(index + 1)];
        });
      } catch {
        setError('לא ניתן היה לפצל את הקובץ');
      } finally {
        setBusyId(null);
      }
    },
    [setDocs]
  );

  const replaceDoc = useCallback(
    async (doc, file) => {
      if (!file) return;
      setBusyId(doc.id);
      const { doc: fresh } = await createDocFromFile(file);
      setDocs((prev) =>
        prev.map((item) =>
          item.id === doc.id ? { ...fresh, id: doc.id, groupId: doc.groupId, ownerName: doc.ownerName, includeInIntro: doc.includeInIntro } : item
        )
      );
      setBusyId(null);
    },
    [setDocs]
  );

  const removeDoc = useCallback(
    (id) => setDocs((prev) => prev.filter((doc) => doc.id !== id)),
    [setDocs]
  );

  const selectedDocs = docs.filter((doc) => selected.has(doc.id));
  const canGroup = selectedDocs.length >= 2;
  const canUngroup = selectedDocs.some((doc) => doc.groupId);

  if (!docs.length) {
    return (
      <Card>
        <Muted>עדיין לא הועלו מסמכים. חזרו לשלב הקודם.</Muted>
      </Card>
    );
  }

  return (
    <Card aria-labelledby="bundle-arrange-title">
      <Toolbar>
        <Totals id="bundle-arrange-title" aria-live="polite">
          <strong>{docs.filter((doc) => placedById[doc.id]?.startPage).length}</strong> מסמכים ·{' '}
          <strong>{bundle.introPageCount}</strong> עמ' מכתב מקדים · סה&quot;כ <strong>{bundle.totalPages}</strong> עמודים בחבילה
        </Totals>
        <Row>
          <IconButton id="bundle-group" type="button" onClick={groupSelected} disabled={!canGroup}>
            איחוד לשורה אחת
            <LuLink aria-hidden="true" />
          </IconButton>
          <IconButton id="bundle-ungroup" type="button" onClick={ungroupSelected} disabled={!canUngroup}>
            ביטול איחוד
            <LuUnlink aria-hidden="true" />
          </IconButton>
        </Row>
      </Toolbar>
      <Muted style={{ marginBottom: 12 }}>גררו שורות לשינוי הסדר, או השתמשו בחצים. סמנו כמה מסמכים כדי לאחד אותם לשורה אחת במכתב המקדים.</Muted>
      {error && <ErrorText role="alert">{error}</ErrorText>}

      <List aria-label="מסמכי החבילה לפי הסדר">
        {docs.map((doc, index) => {
          const placed = placedById[doc.id];
          const selection = parsePageSelection(doc.pages, doc.pageCount);
          const ok = doc.status === 'ok';
          return (
            <Item
              key={doc.id}
              $grouped={Boolean(doc.groupId)}
              $bad={!ok}
              $dragOver={overId === doc.id && dragId !== doc.id}
              draggable
              onDragStart={() => setDragId(doc.id)}
              onDragOver={(e) => {
                e.preventDefault();
                setOverId(doc.id);
              }}
              onDragEnd={() => {
                setDragId(null);
                setOverId(null);
              }}
              onDrop={() => handleDrop(doc.id)}
              aria-label={`${index + 1}. ${doc.introTitle}`}
            >
              <Handle>
                <input
                  id={`bundle-select-${doc.id}`}
                  type="checkbox"
                  checked={selected.has(doc.id)}
                  onChange={() => toggleSelected(doc.id)}
                  aria-label={`בחירת ${doc.introTitle}`}
                />
                <IconButton id={`bundle-up-${doc.id}`} type="button" onClick={() => moveBy(index, -1)} disabled={index === 0} aria-label="הזזה למעלה">
                  <HiOutlineChevronUp aria-hidden="true" />
                </IconButton>
                <LuGripVertical className="grip" aria-hidden="true" />
                <IconButton id={`bundle-down-${doc.id}`} type="button" onClick={() => moveBy(index, 1)} disabled={index === docs.length - 1} aria-label="הזזה למטה">
                  <HiOutlineChevronDown aria-hidden="true" />
                </IconButton>
              </Handle>

              {doc.thumb ? <img src={doc.thumb} alt="" /> : <div aria-hidden="true" />}

              <div>
                <Fields>
                  <Field htmlFor={`bundle-title-${doc.id}`} $wide>
                    כותרת במכתב המקדים
                    <input
                      id={`bundle-title-${doc.id}`}
                      value={doc.introTitle}
                      onChange={(e) =>
                        doc.groupId
                          ? setDocs((prev) => prev.map((item) => (item.groupId === doc.groupId ? { ...item, introTitle: e.target.value } : item)))
                          : update(doc.id, { introTitle: e.target.value })
                      }
                    />
                  </Field>
                  <Field htmlFor={`bundle-type-${doc.id}`}>
                    סוג מסמך
                    <select
                      id={`bundle-type-${doc.id}`}
                      value={doc.docType}
                      onChange={(e) =>
                        update(doc.id, {
                          docType: e.target.value,
                          needsConfirmation: false,
                          introTitle: e.target.value === 'other' ? doc.introTitle : introTitleFor(e.target.value, taxYear),
                        })
                      }
                    >
                      {DOCUMENT_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field htmlFor={`bundle-owner-${doc.id}`}>
                    שייך ל (אופציונלי)
                    <input
                      id={`bundle-owner-${doc.id}`}
                      placeholder="למשל בן/בת הזוג"
                      value={doc.ownerName}
                      onChange={(e) => update(doc.id, { ownerName: e.target.value })}
                    />
                  </Field>
                  <Field htmlFor={`bundle-pages-${doc.id}`} $invalid={ok && !selection}>
                    עמודים לצירוף (מתוך {doc.pageCount})
                    <input
                      id={`bundle-pages-${doc.id}`}
                      dir="ltr"
                      placeholder="הכל, או למשל 1-3,5"
                      value={doc.pages}
                      disabled={!ok || doc.pageCount < 2}
                      aria-invalid={ok && !selection ? true : undefined}
                      onChange={(e) => update(doc.id, { pages: e.target.value })}
                    />
                  </Field>
                  <Field htmlFor={`bundle-intro-${doc.id}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <input
                      id={`bundle-intro-${doc.id}`}
                      type="checkbox"
                      checked={doc.includeInIntro}
                      onChange={(e) => update(doc.id, { includeInIntro: e.target.checked })}
                    />
                    להציג במכתב המקדים
                  </Field>
                </Fields>
                <Meta>
                  {!ok && <Badge $tone="warning">{doc.error}</Badge>}
                  {ok && placed?.startPage && <Badge $tone="expired">{formatPageRange(placed.startPage, placed.endPage)}</Badge>}
                  {doc.groupId && <Badge $tone="pending">מאוחד</Badge>}
                  {doc.needsConfirmation && ok && <Badge $tone="pending">סיווג לא ודאי, נא לבדוק</Badge>}
                  <Muted as="span" title={doc.name}>{doc.name}</Muted>
                </Meta>
              </div>

              <Actions>
                <IconButton id={`bundle-preview-${doc.id}`} type="button" onClick={() => setPreviewDoc(doc)} disabled={!ok} aria-label={`תצוגה של ${doc.introTitle}`}>
                  <HiOutlineEye aria-hidden="true" />
                </IconButton>
                {doc.kind === 'pdf' && doc.pageCount > 1 && ok && (
                  <IconButton id={`bundle-split-${doc.id}`} type="button" onClick={() => splitDoc(doc)} disabled={busyId === doc.id} aria-label={`פיצול ${doc.introTitle} לעמודים`}>
                    <LuScissors aria-hidden="true" />
                  </IconButton>
                )}
                <IconButton id={`bundle-replace-${doc.id}`} type="button" onClick={() => replaceRef.current[doc.id]?.click()} disabled={busyId === doc.id} aria-label={`החלפת הקובץ של ${doc.introTitle}`}>
                  <HiOutlineRefresh aria-hidden="true" />
                </IconButton>
                <HiddenInput
                  ref={(el) => {
                    replaceRef.current[doc.id] = el;
                  }}
                  id={`bundle-replace-file-${doc.id}`}
                  type="file"
                  accept="application/pdf,image/png,image/jpeg"
                  onChange={(e) => replaceDoc(doc, e.target.files?.[0])}
                />
                <IconButton id={`bundle-delete-${doc.id}`} type="button" $danger onClick={() => removeDoc(doc.id)} aria-label={`מחיקת ${doc.introTitle}`}>
                  <HiOutlineTrash aria-hidden="true" />
                </IconButton>
              </Actions>
            </Item>
          );
        })}
      </List>

      <DocPreviewDialog doc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </Card>
  );
}

export default memo(ArrangeStep);

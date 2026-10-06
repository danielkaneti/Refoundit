import { memo, useCallback, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { HiOutlineTrash } from 'react-icons/hi';
import { DOC_TYPE_BY_ID } from '../../utils/bundle/documentTypes';
import { createDocFromFile } from '../../utils/bundle/createDoc';
import { Badge, Card, ErrorText, IconButton, Muted, SubHeading } from '../styles';

const Drop = styled.label`
  display: grid;
  place-items: center;
  gap: 8px;
  padding: 40px 16px;
  border: 2px dashed ${({ theme }) => theme.colors.gray300};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.offWhite};
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;

  ${({ $active, theme }) =>
    $active &&
    css`
      border-color: ${theme.colors.teal};
      background: rgba(0, 180, 160, 0.06);
    `}

  strong {
    font-size: 17px;
  }

  input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
  }

  &:focus-within {
    outline: 3px solid ${({ theme }) => theme.colors.teal};
    outline-offset: 2px;
  }
`;

const List = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
`;

const Item = styled.li`
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ $bad, theme }) => ($bad ? theme.colors.danger : theme.colors.gray200)};
  background: ${({ $bad }) => ($bad ? 'rgba(231, 76, 60, 0.05)' : 'transparent')};

  img {
    width: 56px;
    height: 72px;
    object-fit: cover;
    border: 1px solid ${({ theme }) => theme.colors.gray200};
    background: #fff;
  }
`;

const Thumb = styled.div`
  width: 56px;
  height: 72px;
  background: ${({ theme }) => theme.colors.gray100};
`;

const Name = styled.p`
  font-weight: 600;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

function statusBadge(doc) {
  if (doc.status === 'processing') return <Badge $tone="expired">מעבד…</Badge>;
  if (doc.status !== 'ok') return <Badge $tone="warning">{doc.error}</Badge>;
  if (doc.needsConfirmation) return <Badge $tone="pending">לבדוק סיווג</Badge>;
  return <Badge $tone="signed">זוהה</Badge>;
}

function UploadStep({ docs, setDocs, taxYear, onAutoFill }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState(null);

  const addFiles = useCallback(
    async (fileList) => {
      const files = [...fileList];
      if (!files.length) return;
      setNotice(null);
      for (const file of files) {
        const { doc, extracted } = await createDocFromFile(file, taxYear);
        setDocs((prev) => [...prev, doc]);
        if (extracted && (extracted.id || extracted.taxYear)) {
          onAutoFill({ caseNumber: extracted.id, taxYear: extracted.taxYear });
          setNotice('זוהה דוח 1301. מספר התיק / שנת המס הושלמו בפרטי החבילה (אם היו ריקים).');
        }
      }
      if (inputRef.current) inputRef.current.value = '';
    },
    [onAutoFill, setDocs, taxYear]
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setDragging(false);
      addFiles(event.dataTransfer.files);
    },
    [addFiles]
  );

  const removeDoc = useCallback((id) => setDocs((prev) => prev.filter((doc) => doc.id !== id)), [setDocs]);
  const badCount = docs.filter((doc) => doc.status !== 'ok' && doc.status !== 'processing').length;

  return (
    <Card aria-labelledby="bundle-upload-title">
      <SubHeading id="bundle-upload-title">העלאת מסמכים</SubHeading>
      <Muted>הקבצים מעובדים במחשב שלך בלבד ואינם נשמרים בשרת.</Muted>

      <Drop
        htmlFor="bundle-files"
        $active={dragging}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{ marginTop: 16, position: 'relative' }}
      >
        <strong>גררו לכאן קבצים או לחצו לבחירה</strong>
        <Muted as="span">PDF, PNG, JPG · אפשר כמה קבצים יחד</Muted>
        <input
          ref={inputRef}
          id="bundle-files"
          type="file"
          multiple
          accept="application/pdf,image/png,image/jpeg"
          onChange={(e) => addFiles(e.target.files)}
        />
      </Drop>

      {notice && <Muted role="status" style={{ marginTop: 12, color: '#009688', fontWeight: 600 }}>{notice}</Muted>}
      {badCount > 0 && (
        <ErrorText role="status">{badCount} קבצים לא תקינים יישארו ברשימה אך לא ייכללו בחבילה.</ErrorText>
      )}

      {docs.length > 0 && (
        <List aria-label="קבצים שהועלו">
          {docs.map((doc) => (
            <Item key={doc.id} $bad={doc.status !== 'ok' && doc.status !== 'processing'}>
              {doc.thumb ? <img src={doc.thumb} alt="" /> : <Thumb aria-hidden="true" />}
              <div>
                <Name title={doc.name}>{doc.name}</Name>
                <Muted>
                  {doc.status === 'ok' && `${doc.pageCount} עמ' · ${DOC_TYPE_BY_ID[doc.docType]?.label ?? ''}`}
                  {doc.status === 'ok' && doc.confidence > 0 && ` · ביטחון ${Math.round(doc.confidence * 100)}%`}
                </Muted>
                <div style={{ marginTop: 4 }}>{statusBadge(doc)}</div>
              </div>
              <IconButton
                id={`bundle-upload-remove-${doc.id}`}
                type="button"
                $danger
                onClick={() => removeDoc(doc.id)}
                aria-label={`הסרת ${doc.name}`}
              >
                <HiOutlineTrash aria-hidden="true" />
              </IconButton>
            </Item>
          ))}
        </List>
      )}
    </Card>
  );
}

export default memo(UploadStep);

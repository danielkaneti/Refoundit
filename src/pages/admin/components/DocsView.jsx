import { useCallback } from 'react';
import styled from 'styled-components';
import { HiOutlineEye, HiOutlineMail, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';
import { Button } from '@components/ui';
import { openPdfInNewTab } from '@utils/api';
import { fetchDocPdf, signUrl, useDeleteDoc, useDocs, useResendDocEmail } from '../api/docs';
import ShareLink from './ShareLink';
import { Badge, Card, ErrorText, Heading, IconButton, Muted, Row } from './styles';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th,
  td {
    padding: 14px 12px;
    text-align: right;
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray100};
    vertical-align: middle;
  }

  th {
    font-size: 13px;
    color: ${({ theme }) => theme.colors.gray500};
    font-weight: 600;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    thead {
      display: none;
    }
    tr {
      display: block;
      padding: 12px 0;
      border-bottom: 1px solid ${({ theme }) => theme.colors.gray200};
    }
    td {
      display: block;
      border: none;
      padding: 4px 0;
    }
  }
`;

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' }) : '—';

function statusOf(doc) {
  if (doc.status === 'signed') return { tone: 'signed', label: 'נחתם' };
  if (Date.now() > Date.parse(doc.expiresAt)) return { tone: 'expired', label: 'פג תוקף' };
  return { tone: 'pending', label: 'ממתין לחתימה' };
}

export default function DocsView({ onNew }) {
  const docs = useDocs();
  const remove = useDeleteDoc();
  const resend = useResendDocEmail();

  const handleView = useCallback(async (token) => {
    try {
      openPdfInNewTab(await fetchDocPdf(token));
    } catch (err) {
      window.alert(err.message);
    }
  }, []);

  const handleDelete = useCallback(
    (doc) => {
      if (window.confirm(`למחוק את המסמך של ${doc.clientName}? הקישור יפסיק לעבוד.`)) {
        remove.mutate(doc.token);
      }
    },
    [remove]
  );

  return (
    <>
      <Row style={{ justifyContent: 'space-between', marginBottom: 20 }}>
        <Heading style={{ margin: 0 }}>מסמכים לחתימה</Heading>
        <Button id="docs-new" size="sm" onClick={onNew}>
          מסמך חדש
          <HiOutlinePlus aria-hidden="true" />
        </Button>
      </Row>

      <Card aria-label="רשימת מסמכים">
        {docs.isLoading && <Muted role="status">טוען…</Muted>}
        {docs.error && <ErrorText role="alert">{docs.error.message}</ErrorText>}
        {resend.error && <ErrorText role="alert">{resend.error.message}</ErrorText>}
        {docs.data?.length === 0 && <Muted>עדיין לא נשלחו מסמכים.</Muted>}

        {docs.data?.length > 0 && (
          <Table>
            <caption className="sr-only">מסמכים שנשלחו ללקוחות וסטטוס החתימה שלהם</caption>
            <thead>
              <tr>
                <th scope="col">לקוח</th>
                <th scope="col">מסמך</th>
                <th scope="col">נוצר</th>
                <th scope="col">סטטוס</th>
                <th scope="col">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {docs.data.map((doc) => {
                const status = statusOf(doc);
                return (
                  <tr key={doc.token}>
                    <td>
                      <strong>{doc.clientName}</strong>
                    </td>
                    <td>{doc.templateName}</td>
                    <td>{formatDate(doc.createdAt)}</td>
                    <td>
                      <Row>
                        <Badge $tone={status.tone}>{status.label}</Badge>
                        {doc.status === 'signed' && <Muted as="span">{formatDate(doc.signedAt)}</Muted>}
                        {doc.emailFailed && <Badge $tone="warning">המייל לא נשלח</Badge>}
                      </Row>
                    </td>
                    <td>
                      <Row>
                        {status.tone === 'pending' && (
                          <ShareLink id={`doc-${doc.token.slice(0, 8)}`} url={signUrl(doc.token)} clientName={doc.clientName} compact />
                        )}
                        <IconButton
                          id={`doc-view-${doc.token.slice(0, 8)}`}
                          type="button"
                          onClick={() => handleView(doc.token)}
                          aria-label={`צפייה במסמך של ${doc.clientName}`}
                        >
                          <HiOutlineEye aria-hidden="true" />
                        </IconButton>
                        {doc.status === 'signed' && (
                          <IconButton
                            id={`doc-resend-${doc.token.slice(0, 8)}`}
                            type="button"
                            onClick={() => resend.mutate(doc.token)}
                            disabled={resend.isPending}
                            aria-label={`שליחה חוזרת למייל של המסמך החתום של ${doc.clientName}`}
                          >
                            שליחה למייל
                            <HiOutlineMail aria-hidden="true" />
                          </IconButton>
                        )}
                        <IconButton
                          id={`doc-delete-${doc.token.slice(0, 8)}`}
                          type="button"
                          $danger
                          onClick={() => handleDelete(doc)}
                          disabled={remove.isPending}
                          aria-label={`מחיקת המסמך של ${doc.clientName}`}
                        >
                          <HiOutlineTrash aria-hidden="true" />
                        </IconButton>
                      </Row>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}

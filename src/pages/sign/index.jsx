import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { HiOutlineCheckCircle, HiOutlineDownload } from 'react-icons/hi';
import { Button } from '@components/ui';
import PdfPages from '@components/pdf/PdfPages';
import { openPdfInNewTab } from '@utils/api';
import { useSignDocument, useSignPdf, useSubmitSignature } from './api/sign';
import SignatureModal from './components/SignatureModal';
import SignatureSpot from './components/SignatureSpot';
import useSignToken from './hooks/useSignToken';

const Page = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.offWhite};
  padding-bottom: 160px;
`;

const Header = styled.header`
  background: ${({ theme }) => theme.colors.navy};
  color: ${({ theme }) => theme.colors.white};
  padding: 16px;
  text-align: center;
  font-weight: 900;
  font-size: 20px;

  span {
    color: ${({ theme }) => theme.colors.teal};
  }
`;

const Main = styled.main`
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 12px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Intro = styled.section`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: 20px;

  h1 {
    font-size: clamp(20px, 4vw, 26px);
    font-weight: 800;
    margin-bottom: 8px;
  }

  p {
    color: ${({ theme }) => theme.colors.gray600};
    line-height: 1.7;
  }
`;

const StatusCard = styled(Intro)`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 48px;

  svg.status-icon {
    font-size: 56px;
    color: ${({ theme }) => theme.colors.success};
  }
`;

const ActionBar = styled.div`
  position: fixed;
  bottom: 0;
  inset-inline: 0;
  z-index: 20;
  background: ${({ theme }) => theme.colors.white};
  box-shadow: 0 -4px 24px rgba(10, 22, 40, 0.12);
  padding: 16px;
`;

const ActionInner = styled.div`
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Consent = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  line-height: 1.5;
  flex: 1;
  min-width: 240px;
  cursor: pointer;

  input {
    width: 20px;
    height: 20px;
    margin-top: 1px;
    accent-color: ${({ theme }) => theme.colors.teal};
    flex-shrink: 0;
  }
`;

const ErrorText = styled.p`
  width: 100%;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 14px;
`;

const Progress = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray500};
  width: 100%;
`;

function StatusMessage({ title, children, icon }) {
  return (
    <Main>
      <StatusCard role="status">
        {icon}
        <h1>{title}</h1>
        {children}
      </StatusCard>
    </Main>
  );
}

export default function SignApp() {
  const token = useSignToken();
  const doc = useSignDocument(token);
  const pdf = useSignPdf(token, doc.data?.status);
  const submit = useSubmitSignature(token);

  const [signature, setSignature] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    document.title = 'חתימה על מסמך | REFOUNDIT';
  }, []);

  const fields = useMemo(() => doc.data?.signatureFields ?? [], [doc.data]);
  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);
  const handleConfirm = useCallback((dataUrl) => {
    setSignature(dataUrl);
    setModalOpen(false);
  }, []);

  const renderOverlay = useCallback(
    (page) =>
      fields.map((field, index) =>
        field.page === page ? (
          <SignatureSpot
            key={field.id}
            field={field}
            index={index}
            total={fields.length}
            signature={signature}
            onClick={openModal}
            disabled={submit.isPending}
          />
        ) : null
      ),
    [fields, openModal, signature, submit.isPending]
  );

  const scrollToFirstSpot = useCallback(() => {
    if (!fields[0]) return;
    const spot = document.getElementById(`signature-spot-${fields[0].id}`);
    spot?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    spot?.focus({ preventScroll: true });
  }, [fields]);

  const handleSubmit = useCallback(() => {
    if (signature && consent) submit.mutate({ signature });
  }, [consent, signature, submit]);

  const header = (
    <Header>
      REFOUND<span>IT</span>
    </Header>
  );

  if (!token || doc.error) {
    return (
      <Page>
        {header}
        <StatusMessage title="לא ניתן לפתוח את המסמך">
          <p>{doc.error?.message || 'הקישור אינו תקין'}</p>
        </StatusMessage>
      </Page>
    );
  }

  if (doc.isLoading) {
    return (
      <Page>
        {header}
        <StatusMessage title="טוען מסמך…" />
      </Page>
    );
  }

  if (doc.data.status === 'signed') {
    return (
      <Page>
        {header}
        <StatusMessage title="המסמך נחתם בהצלחה" icon={<HiOutlineCheckCircle className="status-icon" aria-hidden="true" />}>
          <p>תודה {doc.data.clientName}! המסמך החתום התקבל במשרד ואין צורך בפעולה נוספת.</p>
          <Button
            id="sign-download"
            size="sm"
            variant="outline"
            disabled={!pdf.data}
            onClick={() => openPdfInNewTab(pdf.data)}
          >
            הורדת עותק חתום
            <HiOutlineDownload aria-hidden="true" />
          </Button>
        </StatusMessage>
      </Page>
    );
  }

  return (
    <Page>
      {header}
      <Main id="main-content">
        <Intro aria-labelledby="sign-title">
          <h1 id="sign-title">שלום {doc.data.clientName},</h1>
          <p>
            לפניך המסמך &quot;{doc.data.templateName}&quot;. אנא קרא/י אותו, ולחץ/י על המסגרת הצהובה כדי לחתום.
            {fields.length > 1 && ` החתימה תוצב בכל ${fields.length} המקומות המסומנים.`}
          </p>
          <div style={{ marginTop: 16 }}>
            <Button id="sign-jump" size="sm" variant="outline" onClick={scrollToFirstSpot}>
              מעבר למקום החתימה
            </Button>
          </div>
        </Intro>

        {pdf.error ? (
          <ErrorText role="alert">{pdf.error.message}</ErrorText>
        ) : (
          <PdfPages data={pdf.data} renderOverlay={renderOverlay} label={doc.data.templateName} />
        )}
      </Main>

      <ActionBar role="region" aria-label="אישור וחתימה">
        <ActionInner>
          <Progress aria-live="polite">{signature ? 'החתימה הוספה ✓' : 'טרם נחתם — לחצו על המסגרת הצהובה במסמך'}</Progress>
          <Consent htmlFor="sign-consent">
            <input
              id="sign-consent"
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            קראתי את המסמך ואני מאשר/ת את תוכנו ואת חתימתי האלקטרונית עליו
          </Consent>
          <Button
            id="sign-submit"
            onClick={handleSubmit}
            disabled={!signature || !consent || submit.isPending}
            aria-describedby={submit.error ? 'sign-submit-error' : undefined}
          >
            {submit.isPending ? 'שולח…' : 'חתימה ושליחה'}
          </Button>
          {submit.error && (
            <ErrorText id="sign-submit-error" role="alert">
              {submit.error.message}
            </ErrorText>
          )}
        </ActionInner>
      </ActionBar>

      <SignatureModal open={modalOpen} onClose={closeModal} onConfirm={handleConfirm} defaultName={doc.data.clientName} />
    </Page>
  );
}

import { useCallback, useState } from 'react';
import styled from 'styled-components';
import { FaWhatsapp } from 'react-icons/fa';
import { HiOutlineClipboardCopy } from 'react-icons/hi';
import { IconButton, Row } from './styles';

const LinkBox = styled.input`
  flex: 1;
  min-width: 220px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.gray200};
  background: ${({ theme }) => theme.colors.offWhite};
  font-size: 13px;
  direction: ltr;
`;

const whatsappShareUrl = (clientName, url) =>
  `https://wa.me/?text=${encodeURIComponent(
    `שלום ${clientName}, מצורף קישור לחתימה על מסמך ייצוג מול רשות המסים:\n${url}`
  )}`;

export default function ShareLink({ id, url, clientName, compact = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('העתיקו את הקישור:', url);
    }
  }, [url]);

  return (
    <Row>
      {!compact && <LinkBox id={`${id}-url`} readOnly value={url} aria-label="קישור לחתימה" onFocus={(e) => e.target.select()} />}
      <IconButton id={`${id}-copy`} type="button" onClick={handleCopy} aria-label={`העתקת קישור החתימה של ${clientName}`}>
        {copied ? 'הועתק ✓' : 'העתקה'}
        <HiOutlineClipboardCopy aria-hidden="true" />
      </IconButton>
      <IconButton
        as="a"
        id={`${id}-whatsapp`}
        href={whatsappShareUrl(clientName, url)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`שליחת קישור החתימה ל${clientName} בוואטסאפ`}
      >
        וואטסאפ
        <FaWhatsapp aria-hidden="true" />
      </IconButton>
    </Row>
  );
}

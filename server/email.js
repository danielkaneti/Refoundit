// ============================================================
// Signed-document notification via Resend (https://resend.com).
//   RESEND_API_KEY — secret
//   MAIL_FROM      — var, on a domain verified in Resend
//   NOTIFY_EMAIL   — var, where signed PDFs are delivered
// ============================================================
import { bytesToBase64 } from './crypto';

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

const safeFilename = (value) => value.replace(/[\\/:*?"<>|]+/g, '').trim() || 'document';

export function signedFilename(meta) {
  return `${safeFilename(`${meta.templateName} - ${meta.clientName}`)}.pdf`;
}

export async function sendSignedPdfEmail(env, meta, pdfBytes) {
  if (!env.RESEND_API_KEY || !env.MAIL_FROM || !env.NOTIFY_EMAIL) {
    throw new Error('Email is not configured');
  }

  const signedAt = new Date(meta.signedAt).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' });
  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px;color:#0A1628">
      <h2 style="margin:0 0 12px">מסמך נחתם ✔</h2>
      <p><strong>לקוח:</strong> ${escapeHtml(meta.clientName)}</p>
      <p><strong>מסמך:</strong> ${escapeHtml(meta.templateName)}</p>
      <p><strong>נחתם בתאריך:</strong> ${escapeHtml(signedAt)}</p>
      <p>המסמך החתום מצורף כקובץ PDF.</p>
    </div>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to: [env.NOTIFY_EMAIL],
      subject: `מסמך נחתם: ${meta.clientName} – ${meta.templateName}`,
      html,
      attachments: [{ filename: signedFilename(meta), content: bytesToBase64(pdfBytes) }],
    }),
  });

  if (!response.ok) throw new Error(`Resend responded ${response.status}`);
}

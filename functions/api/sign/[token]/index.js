import { DOC_STATUS, isExpired, loadDocument } from '../../../../server/documents';
import { sendSignedPdfEmail } from '../../../../server/email';
import { sha256Hex } from '../../../../server/crypto';
import { error, json, readJson } from '../../../../server/http';
import { signPdf } from '../../../../server/signing';
import { getBytes, keys, putJson, putPdf } from '../../../../server/storage';
import { decodeSignaturePng, sanitizeText } from '../../../../server/validation';

const NOT_FOUND = 'הקישור אינו תקין או שהמסמך הוסר';
const EXPIRED = 'תוקף הקישור פג. יש לפנות למשרד לקבלת קישור חדש';

// Only what the signing page needs, never the full stored record.
const publicView = (meta) => ({
  status: meta.status,
  clientName: meta.clientName,
  templateName: meta.templateName,
  signatureFields: meta.signatureFields.map(({ id, page, x, y, w, h }) => ({ id, page, x, y, w, h })),
  signedAt: meta.signedAt ?? null,
});

export async function onRequestGet({ env, params }) {
  const doc = await loadDocument(env, params.token);
  if (!doc) return error(NOT_FOUND, 404);
  if (isExpired(doc.data)) return error(EXPIRED, 410);
  return json(publicView(doc.data));
}

export async function onRequestPost({ request, env, params }) {
  const { token } = params;
  const doc = await loadDocument(env, token);
  if (!doc) return error(NOT_FOUND, 404);
  if (doc.data.status === DOC_STATUS.signed) return error('המסמך כבר נחתם', 409);
  if (isExpired(doc.data)) return error(EXPIRED, 410);

  const body = await readJson(request);
  if (body?.consent !== true) return error('יש לאשר שקראת את המסמך');
  const signaturePng = decodeSignaturePng(body.signature);
  if (!signaturePng) return error('החתימה אינה תקינה');

  const prepared = await getBytes(env.DOCS_BUCKET, keys.docPrepared(token));
  if (!prepared) return error(NOT_FOUND, 404);

  const signedAt = new Date().toISOString();
  const originalSha256 = await sha256Hex(prepared);
  const signedBytes = await signPdf(prepared, signaturePng, doc.data.signatureFields, {
    token,
    signedAt,
    ip: request.headers.get('CF-Connecting-IP') || 'unknown',
    userAgent: sanitizeText(request.headers.get('User-Agent'), 300),
    originalSha256,
    signatureCount: doc.data.signatureFields.length,
  }, doc.data.signDateFields ?? []);

  await putPdf(env.DOCS_BUCKET, keys.docSigned(token), signedBytes);

  // Conditional write: if two submissions race, only the first one wins.
  let meta = { ...doc.data, status: DOC_STATUS.signed, signedAt, originalSha256 };
  const claimed = await putJson(env.DOCS_BUCKET, keys.docMeta(token), meta, {
    onlyIf: { etagMatches: doc.etag },
  });
  if (!claimed) return error('המסמך כבר נחתם', 409);

  try {
    await sendSignedPdfEmail(env, meta, signedBytes);
    meta = { ...meta, emailSentAt: new Date().toISOString(), emailFailed: false };
  } catch (err) {
    // The document is signed and stored either way; it can be re-sent from the admin portal.
    console.error('Signed PDF email failed:', err.message);
    meta = { ...meta, emailFailed: true };
  }
  await putJson(env.DOCS_BUCKET, keys.docMeta(token), meta);

  return json(publicView(meta));
}

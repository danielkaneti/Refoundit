import { DOC_STATUS, loadDocument } from '../../../../../server/documents';
import { sendSignedPdfEmail } from '../../../../../server/email';
import { error, json } from '../../../../../server/http';
import { getBytes, keys, putJson } from '../../../../../server/storage';

export async function onRequestPost({ env, params }) {
  const doc = await loadDocument(env, params.token);
  if (!doc) return error('המסמך לא נמצא', 404);
  if (doc.data.status !== DOC_STATUS.signed) return error('המסמך עדיין לא נחתם', 409);

  const bytes = await getBytes(env.DOCS_BUCKET, keys.docSigned(params.token));
  if (!bytes) return error('הקובץ החתום לא נמצא', 404);

  try {
    await sendSignedPdfEmail(env, doc.data, bytes);
  } catch (err) {
    console.error('Signed PDF email failed:', err.message);
    return error('שליחת המייל נכשלה', 502);
  }

  const meta = { ...doc.data, emailSentAt: new Date().toISOString(), emailFailed: false };
  await putJson(env.DOCS_BUCKET, keys.docMeta(params.token), meta);
  return json(meta);
}

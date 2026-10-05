import { DOC_STATUS } from './documents';
import { error, pdf } from './http';
import { getBytes, keys } from './storage';

/** Serves the signed PDF once signed, otherwise the prepared (unsigned) one. */
export async function documentPdfResponse(env, meta) {
  const signed = meta.status === DOC_STATUS.signed;
  const key = signed ? keys.docSigned(meta.token) : keys.docPrepared(meta.token);
  const bytes = await getBytes(env.DOCS_BUCKET, key);
  return bytes ? pdf(bytes, signed ? 'signed.pdf' : 'document.pdf') : error('הקובץ לא נמצא', 404);
}

import { documentPdfResponse } from '../../../../server/documentPdf';
import { isExpired, loadDocument } from '../../../../server/documents';
import { error } from '../../../../server/http';

export async function onRequestGet({ env, params }) {
  const doc = await loadDocument(env, params.token);
  if (!doc) return error('המסמך לא נמצא', 404);
  if (isExpired(doc.data)) return error('תוקף הקישור פג', 410);
  return documentPdfResponse(env, doc.data);
}

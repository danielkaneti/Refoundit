import { documentPdfResponse } from '../../../../../server/documentPdf';
import { loadDocument } from '../../../../../server/documents';
import { error } from '../../../../../server/http';

export async function onRequestGet({ env, params }) {
  const doc = await loadDocument(env, params.token);
  return doc ? documentPdfResponse(env, doc.data) : error('המסמך לא נמצא', 404);
}

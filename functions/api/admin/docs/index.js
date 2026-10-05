import { DOC_STATUS, linkExpiry } from '../../../../server/documents';
import { randomToken } from '../../../../server/crypto';
import { error, json } from '../../../../server/http';
import { inspectPdf } from '../../../../server/signing';
import { isSignDateField } from '../../../../shared/pdfGeometry';
import { getJson, keys, listMeta, putJson, putPdf } from '../../../../server/storage';
import { UUID_RE, parseFields, readPdfUpload, sanitizeText } from '../../../../server/validation';

export async function onRequestGet({ env }) {
  return json(await listMeta(env.DOCS_BUCKET, 'docs/'));
}

/**
 * multipart/form-data:
 *   file — the template PDF already filled with the client's details (built in the admin UI)
 *   meta — JSON { templateId, clientName, signatureFields, signDateFields }
 * Only the client's display name is persisted; the other details live inside the PDF.
 */
export async function onRequestPost({ request, env }) {
  let form;
  let input;
  try {
    form = await request.formData();
    input = JSON.parse(form.get('meta'));
  } catch {
    return error('בקשה לא תקינה');
  }

  const clientName = sanitizeText(input?.clientName, 80);
  if (!clientName) return error('יש להזין את שם הלקוח');
  if (!UUID_RE.test(input?.templateId || '')) return error('תבנית לא תקינה');

  const template = await getJson(env.DOCS_BUCKET, keys.templateMeta(input.templateId));
  if (!template) return error('התבנית לא נמצאה', 404);

  const upload = await readPdfUpload(form.get('file'));
  if (upload.error) return error(upload.error);

  const inspection = await inspectPdf(upload.bytes);
  if (inspection.error) return error(inspection.error);
  if (inspection.pageCount !== template.data.pageCount) {
    return error('מספר העמודים אינו תואם לתבנית');
  }

  const signatureFields = parseFields(input.signatureFields, inspection.pageCount, {
    allowedTypes: ['signature'],
  });
  if (!signatureFields?.length) return error('יש לסמן לפחות מקום חתימה אחד');

  // Date boxes stamped with the day the client signs
  const signDateFields = parseFields(input.signDateFields ?? [], inspection.pageCount, {
    allowedTypes: ['date'],
  })?.filter(isSignDateField);
  if (!signDateFields) return error('שדות התאריך אינם תקינים');

  const now = new Date();
  const token = randomToken();
  const meta = {
    token,
    templateId: template.data.id,
    templateName: template.data.name,
    clientName,
    pageCount: inspection.pageCount,
    signatureFields,
    signDateFields,
    status: DOC_STATUS.pending,
    createdAt: now.toISOString(),
    expiresAt: linkExpiry(env, now),
  };

  await putPdf(env.DOCS_BUCKET, keys.docPrepared(token), upload.bytes);
  await putJson(env.DOCS_BUCKET, keys.docMeta(token), meta);
  return json(meta, 201);
}

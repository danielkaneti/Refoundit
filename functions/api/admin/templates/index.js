import { error, json } from '../../../../server/http';
import { inspectPdf } from '../../../../server/signing';
import { keys, listMeta, putJson, putPdf } from '../../../../server/storage';
import { parseFields, parseRegion, readPdfUpload, sanitizeText } from '../../../../server/validation';
import { findPreset } from '../../../../shared/presets';

export async function onRequestGet({ env }) {
  return json(await listMeta(env.DOCS_BUCKET, 'templates/'));
}

export async function onRequestPost({ request, env }) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return error('בקשה לא תקינה');
  }

  const name = sanitizeText(form.get('name'), 80);
  if (!name) return error('יש להזין שם לתבנית');

  const upload = await readPdfUpload(form.get('file'));
  if (upload.error) return error(upload.error);

  const inspection = await inspectPdf(upload.bytes);
  if (inspection.error) return error(inspection.error);

  // Optional ready-made layout for a known form
  const preset = findPreset(form.get('preset'));
  if (preset && preset.pageCount !== inspection.pageCount) {
    return error(`התבנית המוכנה מתאימה לקובץ של ${preset.pageCount} עמודים`);
  }

  const meta = {
    id: crypto.randomUUID(),
    name,
    pageCount: inspection.pageCount,
    fields: preset ? parseFields(preset.fields, inspection.pageCount) : [],
    clientNameRegion: preset ? parseRegion(preset.clientNameRegion, inspection.pageCount) : null,
    presetId: preset?.id ?? null,
    createdAt: new Date().toISOString(),
  };

  await putPdf(env.DOCS_BUCKET, keys.templatePdf(meta.id), upload.bytes);
  await putJson(env.DOCS_BUCKET, keys.templateMeta(meta.id), meta);
  return json(meta, 201);
}

import { error, json, readJson } from '../../../../../server/http';
import { deletePrefix, getJson, keys, putJson } from '../../../../../server/storage';
import { UUID_RE, parseFields, sanitizeText } from '../../../../../server/validation';

async function loadTemplate(env, id) {
  if (!UUID_RE.test(id)) return null;
  return getJson(env.DOCS_BUCKET, keys.templateMeta(id));
}

export async function onRequestGet({ env, params }) {
  const template = await loadTemplate(env, params.id);
  return template ? json(template.data) : error('התבנית לא נמצאה', 404);
}

export async function onRequestPut({ request, env, params }) {
  const template = await loadTemplate(env, params.id);
  if (!template) return error('התבנית לא נמצאה', 404);

  const body = await readJson(request);
  const fields = parseFields(body?.fields, template.data.pageCount);
  if (!fields) return error('מבנה השדות אינו תקין');

  const name = sanitizeText(body?.name, 80) || template.data.name;
  const meta = { ...template.data, name, fields, updatedAt: new Date().toISOString() };
  await putJson(env.DOCS_BUCKET, keys.templateMeta(meta.id), meta);
  return json(meta);
}

export async function onRequestDelete({ env, params }) {
  if (!UUID_RE.test(params.id)) return error('התבנית לא נמצאה', 404);
  await deletePrefix(env.DOCS_BUCKET, keys.templatePrefix(params.id));
  return json({ deleted: true });
}

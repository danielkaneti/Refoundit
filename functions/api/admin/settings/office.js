import { json, error, readJson } from '../../../../server/http';
import { getJson, keys, putJson } from '../../../../server/storage';
import { sanitizeText } from '../../../../server/validation';

// Office branding used by the document bundle builder (cover letter + footer).

const COLOR_RE = /^#[0-9a-fA-F]{6}$/;

const TEXT_FIELDS = {
  officeName: 80,
  contactName: 80,
  contactTitle: 40,
  tagline: 80,
  phone: 30,
  email: 120,
  address: 160,
  bodyText: 400,
  closingText: 60,
};

export async function onRequestGet({ env }) {
  const stored = await getJson(env.DOCS_BUCKET, keys.officeSettings);
  return json(stored?.data ?? {});
}

export async function onRequestPut({ request, env }) {
  const body = await readJson(request, 20_000);
  if (!body || typeof body !== 'object') return error('בקשה לא תקינה');

  const settings = Object.fromEntries(
    Object.entries(TEXT_FIELDS).map(([key, max]) => [key, sanitizeText(body[key], max)])
  );
  if (!settings.officeName) return error('יש להזין שם משרד');
  settings.primaryColor = COLOR_RE.test(body.primaryColor || '') ? body.primaryColor : '#1e3a5f';
  settings.updatedAt = new Date().toISOString();

  await putJson(env.DOCS_BUCKET, keys.officeSettings, settings);
  return json(settings);
}

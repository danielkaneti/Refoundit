import { error, json, readJson } from '../../../../server/http';
import { getBytes, keys } from '../../../../server/storage';
import { decodeSignaturePng } from '../../../../server/validation';

// The representative's own signature, stamped on every prepared document.

export async function onRequestGet({ env }) {
  const bytes = await getBytes(env.DOCS_BUCKET, keys.ownerSignature);
  if (!bytes) return error('לא הוגדרה חתימת מייצג', 404);
  return new Response(bytes, {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' },
  });
}

export async function onRequestPut({ request, env }) {
  const body = await readJson(request);
  const png = decodeSignaturePng(body?.signature);
  if (!png) return error('החתימה אינה תקינה (PNG עד ~500KB)');
  await env.DOCS_BUCKET.put(keys.ownerSignature, png, { httpMetadata: { contentType: 'image/png' } });
  return json({ saved: true });
}

export async function onRequestDelete({ env }) {
  await env.DOCS_BUCKET.delete(keys.ownerSignature);
  return json({ deleted: true });
}

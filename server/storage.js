// ============================================================
// R2 layout (binding: DOCS_BUCKET)
//   templates/<id>/meta.json     template name + field layout
//   templates/<id>/source.pdf    original uploaded PDF
//   docs/<token>/meta.json       document status + signature boxes
//   docs/<token>/prepared.pdf    template filled with client details
//   docs/<token>/signed.pdf      final signed PDF
//   settings/owner-signature.png the representative's signature
// R2 encrypts all objects at rest (AES-256).
// ============================================================

export const keys = {
  templateMeta: (id) => `templates/${id}/meta.json`,
  templatePdf: (id) => `templates/${id}/source.pdf`,
  templatePrefix: (id) => `templates/${id}/`,
  docMeta: (token) => `docs/${token}/meta.json`,
  docPrepared: (token) => `docs/${token}/prepared.pdf`,
  docSigned: (token) => `docs/${token}/signed.pdf`,
  docPrefix: (token) => `docs/${token}/`,
  ownerSignature: 'settings/owner-signature.png',
};

const PDF_META = { httpMetadata: { contentType: 'application/pdf' } };

export async function getJson(bucket, key) {
  const object = await bucket.get(key);
  if (!object) return null;
  return { data: await object.json(), etag: object.etag };
}

export const putJson = (bucket, key, data, options = {}) =>
  bucket.put(key, JSON.stringify(data), {
    httpMetadata: { contentType: 'application/json' },
    ...options,
  });

export const putPdf = (bucket, key, bytes) => bucket.put(key, bytes, PDF_META);

export async function getBytes(bucket, key) {
  const object = await bucket.get(key);
  return object ? new Uint8Array(await object.arrayBuffer()) : null;
}

/** Read every `<prefix>*\/meta.json`, newest first. Fine for a single-user volume. */
export async function listMeta(bucket, prefix) {
  const metaKeys = [];
  let cursor;
  do {
    const page = await bucket.list({ prefix, cursor });
    for (const object of page.objects) {
      if (object.key.endsWith('/meta.json')) metaKeys.push(object.key);
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);

  const items = await Promise.all(metaKeys.map((key) => getJson(bucket, key)));
  return items
    .filter(Boolean)
    .map((item) => item.data)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deletePrefix(bucket, prefix) {
  const page = await bucket.list({ prefix });
  if (page.objects.length) await bucket.delete(page.objects.map((object) => object.key));
}

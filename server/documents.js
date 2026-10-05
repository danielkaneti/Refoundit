import { getJson, keys } from './storage';
import { TOKEN_RE } from './validation';

export const DOC_STATUS = {
  pending: 'pending',
  signed: 'signed',
};

const DEFAULT_LINK_TTL_DAYS = 30;

export function linkExpiry(env, from = new Date()) {
  const days = Number(env.SIGN_LINK_TTL_DAYS) || DEFAULT_LINK_TTL_DAYS;
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

export const isExpired = (meta) =>
  meta.status === DOC_STATUS.pending && Date.now() > Date.parse(meta.expiresAt);

/** Returns `{ data, etag }` or null for an unknown / malformed token. */
export async function loadDocument(env, token) {
  if (!TOKEN_RE.test(token || '')) return null;
  return getJson(env.DOCS_BUCKET, keys.docMeta(token));
}

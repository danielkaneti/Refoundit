import { error } from '../../../server/http';

export async function onRequest({ env, next }) {
  if (!env.DOCS_BUCKET) return error('השירות אינו זמין כרגע', 503);
  return next();
}

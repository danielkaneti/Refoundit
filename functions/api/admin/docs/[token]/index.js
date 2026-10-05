import { loadDocument } from '../../../../../server/documents';
import { error, json } from '../../../../../server/http';
import { deletePrefix, keys } from '../../../../../server/storage';

export async function onRequestDelete({ env, params }) {
  const doc = await loadDocument(env, params.token);
  if (!doc) return error('המסמך לא נמצא', 404);
  await deletePrefix(env.DOCS_BUCKET, keys.docPrefix(params.token));
  return json({ deleted: true });
}

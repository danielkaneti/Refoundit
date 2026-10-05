import { error, pdf } from '../../../../../server/http';
import { getBytes, keys } from '../../../../../server/storage';
import { UUID_RE } from '../../../../../server/validation';

export async function onRequestGet({ env, params }) {
  if (!UUID_RE.test(params.id)) return error('התבנית לא נמצאה', 404);
  const bytes = await getBytes(env.DOCS_BUCKET, keys.templatePdf(params.id));
  return bytes ? pdf(bytes, 'template.pdf') : error('התבנית לא נמצאה', 404);
}

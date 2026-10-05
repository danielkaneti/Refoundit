import { verifySession } from '../../../server/auth';
import { error } from '../../../server/http';

// Guards every /api/admin/* route.
export async function onRequest({ request, env, next }) {
  if (!(await verifySession(request, env))) return error('נדרשת התחברות', 401);

  // CSRF: a custom header cannot be sent cross-origin without a CORS preflight,
  // which this API never approves. Complements SameSite=Strict on the cookie.
  if (request.method !== 'GET' && request.headers.get('X-RF-Admin') !== '1') {
    return error('בקשה נדחתה', 403);
  }

  if (!env.DOCS_BUCKET) return error('R2 bucket DOCS_BUCKET אינו מחובר', 500);
  return next();
}

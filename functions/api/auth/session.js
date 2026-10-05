import { verifySession } from '../../../server/auth';
import { json } from '../../../server/http';

export async function onRequestGet({ request, env }) {
  return json({ authenticated: await verifySession(request, env) });
}

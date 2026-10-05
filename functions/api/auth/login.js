import { createSessionCookie, isAuthConfigured, verifyPassword } from '../../../server/auth';
import { error, json, readJson } from '../../../server/http';

const FAILED_LOGIN_DELAY_MS = 1000;

export async function onRequestPost({ request, env }) {
  if (!isAuthConfigured(env)) return error('השרת אינו מוגדר (ADMIN_PASSWORD / SESSION_SECRET)', 500);

  const body = await readJson(request, 10_000);
  if (!(await verifyPassword(env, body?.password))) {
    await new Promise((resolve) => setTimeout(resolve, FAILED_LOGIN_DELAY_MS));
    return error('סיסמה שגויה', 401);
  }

  return json({ authenticated: true }, 200, { 'Set-Cookie': await createSessionCookie(env) });
}

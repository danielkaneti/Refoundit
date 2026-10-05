import { clearSessionCookie } from '../../../server/auth';
import { json } from '../../../server/http';

export const onRequestPost = () =>
  json({ authenticated: false }, 200, { 'Set-Cookie': clearSessionCookie() });

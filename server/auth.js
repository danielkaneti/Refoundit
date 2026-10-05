// ============================================================
// Single-user admin auth.
// Secrets (Cloudflare Pages → Settings → Variables and Secrets,
// or .dev.vars locally — never committed):
//   ADMIN_PASSWORD  — the admin login password
//   SESSION_SECRET  — random string, >= 32 chars, signs the session cookie
// ============================================================
import { hmacSha256, safeEqual } from './crypto';

const COOKIE_NAME = 'rf_admin';
const SESSION_TTL_SEC = 12 * 60 * 60;
const MIN_SECRET_LENGTH = 32;

export const isAuthConfigured = (env) =>
  Boolean(env.ADMIN_PASSWORD) && (env.SESSION_SECRET?.length ?? 0) >= MIN_SECRET_LENGTH;

export async function verifyPassword(env, password) {
  if (!isAuthConfigured(env) || typeof password !== 'string' || !password) return false;
  return safeEqual(password, env.ADMIN_PASSWORD);
}

const cookie = (value, maxAge) =>
  `${COOKIE_NAME}=${value}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;

export async function createSessionCookie(env) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SEC;
  const signature = await hmacSha256(env.SESSION_SECRET, `admin.${expiresAt}`);
  return cookie(`${expiresAt}.${signature}`, SESSION_TTL_SEC);
}

export const clearSessionCookie = () => cookie('', 0);

function readCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
}

export async function verifySession(request, env) {
  if (!isAuthConfigured(env)) return false;
  const value = readCookie(request, COOKIE_NAME);
  if (!value) return false;

  const [expiresAt, signature] = value.split('.');
  if (!/^\d+$/.test(expiresAt || '') || !signature) return false;
  if (Number(expiresAt) < Math.floor(Date.now() / 1000)) return false;

  const expected = await hmacSha256(env.SESSION_SECRET, `admin.${expiresAt}`);
  return safeEqual(signature, expected);
}

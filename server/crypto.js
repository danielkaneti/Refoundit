const encoder = new TextEncoder();

export function toBase64Url(bytes) {
  return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function bytesToBase64(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/** 256-bit random, URL-safe token (43 chars). */
export function randomToken() {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
}

export const sha256 = (data) =>
  crypto.subtle.digest('SHA-256', typeof data === 'string' ? encoder.encode(data) : data);

export async function sha256Hex(data) {
  const digest = new Uint8Array(await sha256(data));
  return Array.from(digest, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hmacSha256(secret, data) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return toBase64Url(new Uint8Array(signature));
}

/** Constant-time comparison of two strings (hashed first so lengths match). */
export async function safeEqual(a, b) {
  const [ha, hb] = await Promise.all([sha256(a), sha256(b)]);
  return crypto.subtle.timingSafeEqual(ha, hb);
}

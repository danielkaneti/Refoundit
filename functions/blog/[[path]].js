import { resolveBlogPath } from '../../src/pages/blog/content/index.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
  }

  const url = new URL(request.url);
  const route = resolveBlogPath(url.pathname);
  if (route.status === 301) {
    url.pathname = route.location;
    return Response.redirect(url.href, 301);
  }
  if (route.status === 200) return env.ASSETS.fetch(request);

  url.pathname = '/blog/404/';
  url.search = '';
  const page = await env.ASSETS.fetch(new Request(url, { method: request.method }));
  const headers = new Headers(page.headers);
  headers.set('X-Robots-Tag', 'noindex, follow');
  headers.set('Cache-Control', 'no-store');
  headers.delete('ETag');
  headers.delete('Location');
  return new Response(request.method === 'HEAD' ? null : page.body, { status: 404, headers });
}
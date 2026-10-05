const baseHeaders = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...baseHeaders, 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });

export const error = (message, status = 400) => json({ error: message }, status);

export const pdf = (body, filename = 'document.pdf') =>
  new Response(body, {
    headers: {
      ...baseHeaders,
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
    },
  });

export async function readJson(request, maxBytes = 1_000_000) {
  const length = Number(request.headers.get('Content-Length') || 0);
  if (length > maxBytes) return null;
  try {
    return await request.json();
  } catch {
    return null;
  }
}

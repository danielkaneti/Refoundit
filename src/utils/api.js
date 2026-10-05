export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/**
 * Thin fetch wrapper for the Cloudflare Functions under /api.
 * `responseType: 'bytes'` returns a Uint8Array (for PDFs).
 */
export async function apiRequest(
  path,
  { method = 'GET', json, formData, headers = {}, responseType = 'json' } = {}
) {
  const init = { method, headers: { ...headers }, credentials: 'same-origin' };
  if (json !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(json);
  } else if (formData) {
    init.body = formData;
  }

  const response = await fetch(`/api/${path}`, init);
  if (!response.ok) {
    let message = 'אירעה שגיאה, נסו שוב';
    try {
      message = (await response.json()).error || message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(message, response.status);
  }

  if (responseType === 'bytes') return new Uint8Array(await response.arrayBuffer());
  return response.json();
}

export function openPdfInNewTab(bytes) {
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

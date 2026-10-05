import { apiRequest } from '@utils/api';

export const UNAUTHORIZED_EVENT = 'rf-admin-unauthorized';

/** Admin calls carry the CSRF header and surface 401s so the portal can show the login. */
export async function adminRequest(path, options = {}) {
  try {
    return await apiRequest(path, {
      ...options,
      headers: { 'X-RF-Admin': '1', ...options.headers },
    });
  } catch (err) {
    if (err.status === 401) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    throw err;
  }
}

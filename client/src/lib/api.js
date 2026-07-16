/** Single source of truth for backend URL and HTTP helpers. */
export const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000')
  .trim()
  .replace(/\/$/, '');

export function readStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function persistUser(user) {
  if (!user) return;
  localStorage.setItem('user', JSON.stringify(user));
  window.dispatchEvent(new Event('br-auth-change'));
}

export function clearStoredUser() {
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('br-auth-change'));
}

export async function apiFetch(path, options = {}) {
  const { method = 'GET', body, headers = {}, ...rest } = options;
  const isForm = body instanceof FormData;

  return fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: {
      ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    ...(body ? { body: isForm ? body : JSON.stringify(body) } : {}),
    ...rest,
  });
}

export async function parseJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

/** Sync session from httpOnly cookies via /api/auth/me */
export async function fetchMe() {
  const res = await apiFetch('/api/auth/me');
  if (!res.ok) return null;
  const json = await parseJson(res);
  return json.user || json.data || null;
}

export async function bootstrapSession() {
  const stored = readStoredUser();
  if (!stored) return null;

  try {
    const user = await fetchMe();
    if (user) {
      persistUser(user);
      return user;
    }
    clearStoredUser();
    return null;
  } catch {
    clearStoredUser();
    return null;
  }
}

export async function logoutSession() {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
  } catch {
    /* server may be offline */
  }
  clearStoredUser();
}

export function toISODateString(date) {
  if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** MongoDB ObjectId (24 hex) — static demo ids cannot be booked via API */
export function isMongoId(id) {
  return typeof id === 'string' && /^[a-f\d]{24}$/i.test(id);
}

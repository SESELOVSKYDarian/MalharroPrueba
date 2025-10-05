// src/app/lib/api.js
const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '';

export function toAbsoluteURL(path) {
  if (!path) return null;
  if (/^https?:/i.test(path)) return path;
  const base = API_BASE.replace(/\/api$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function apiFetch(path, options = {}) {
  const jwt = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (jwt) headers.Authorization = `Bearer ${jwt}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    let payload;
    try {
      payload = await res.json();
      message = payload.error || message;
    } catch {
      // ignore JSON parsing issues
    }
    const error = new Error(message);
    error.status = res.status;
    if (payload) error.payload = payload;
    throw error;
  }

  if (res.status === 204) return null;
  return res.json();
}

export async function apiUpload(formData) {
  const jwt = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
  const headers = jwt ? { Authorization: `Bearer ${jwt}` } : {};

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    let payload;
    try {
      payload = await res.json();
      message = payload.error || message;
    } catch {}
    const error = new Error(message);
    error.status = res.status;
    if (payload) error.payload = payload;
    throw error;
  }

  return res.json();
}

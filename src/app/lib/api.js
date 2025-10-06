// src/app/lib/api.js
const API_CANDIDATES = Array.from(
  new Set(
    [
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, ''),
      'http://localhost:4000/api',
      'http://localhost:1337/api',
    ].filter(Boolean),
  ),
);

let resolvedBase = null;

function getBaseList() {
  if (resolvedBase) {
    const unique = new Set([resolvedBase, ...API_CANDIDATES]);
    return Array.from(unique);
  }
  return API_CANDIDATES;
}

function ensureLeadingSlash(path) {
  return path.startsWith('/') ? path : `/${path}`;
}

async function attemptFetch(base, path, options) {
  return fetch(`${base}${ensureLeadingSlash(path)}`, options);
}

function isNetworkError(error) {
  return error instanceof TypeError;
}

export function toAbsoluteURL(path) {
  if (!path) return null;
  if (/^https?:/i.test(path)) return path;
  const baseList = getBaseList();
  const candidate = baseList.length ? baseList[0] : '';
  const base = candidate.replace(/\/api$/, '');
  return `${base}${ensureLeadingSlash(path)}`;
}

export async function apiFetch(path, options = {}) {
  const jwt = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (jwt) headers.Authorization = `Bearer ${jwt}`;

  const bases = getBaseList();
  let lastError;

  for (const base of bases) {
    try {
      const res = await attemptFetch(base, path, {
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

      if (!resolvedBase) {
        resolvedBase = base;
      }

      if (res.status === 204) return null;
      return res.json();
    } catch (err) {
      if (isNetworkError(err)) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }

  if (lastError) throw lastError;
  throw new Error('No hay servidores API configurados.');
}

export async function apiUpload(formData) {
  const jwt = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
  const headers = jwt ? { Authorization: `Bearer ${jwt}` } : {};

  const bases = getBaseList();
  let lastError;

  for (const base of bases) {
    try {
      const res = await attemptFetch(base, '/upload', {
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

      if (!resolvedBase) {
        resolvedBase = base;
      }

      return res.json();
    } catch (err) {
      if (isNetworkError(err)) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }

  if (lastError) throw lastError;
  throw new Error('No hay servidores API configurados.');
}

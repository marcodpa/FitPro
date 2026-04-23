import AsyncStorage from '@react-native-async-storage/async-storage';

export const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';

const BASE = `${BACKEND_URL}/api/v1`;

// ─── Token helpers ─────────────────────────────────────────────────────────────
export const TokenStorage = {
  async getAccess():  Promise<string | null> { return AsyncStorage.getItem('access_token'); },
  async getRefresh(): Promise<string | null> { return AsyncStorage.getItem('refresh_token'); },
  async set(access: string, refresh: string) {
    await Promise.all([
      AsyncStorage.setItem('access_token',  access),
      AsyncStorage.setItem('refresh_token', refresh),
    ]);
  },
  async clear() {
    await Promise.all([
      AsyncStorage.removeItem('access_token'),
      AsyncStorage.removeItem('refresh_token'),
    ]);
  },
};

// ─── Token refresh ─────────────────────────────────────────────────────────────
let _refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (_refreshPromise) return _refreshPromise;
  _refreshPromise = (async () => {
    const refresh = await TokenStorage.getRefresh();
    if (!refresh) throw new Error('No refresh token');
    const res = await fetch(`${BASE}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) { await TokenStorage.clear(); throw new Error('Session expired'); }
    const data = await res.json();
    await AsyncStorage.setItem('access_token', data.access);
    return data.access as string;
  })().finally(() => { _refreshPromise = null; });
  return _refreshPromise;
}

// ─── Core fetch wrapper ────────────────────────────────────────────────────────
export async function api<T = any>(
  endpoint: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth, ...fetchOpts } = options;
  const url = endpoint.startsWith('http') ? endpoint : `${BASE}${endpoint}`;

  const makeHeaders = async (): Promise<Record<string, string>> => {
    const base: Record<string, string> = { 'Content-Type': 'application/json' };
    if (!skipAuth) {
      const token = await TokenStorage.getAccess();
      if (token) base['Authorization'] = `Bearer ${token}`;
    }
    return base;
  };

  let res = await fetch(url, { ...fetchOpts, headers: { ...(await makeHeaders()), ...(fetchOpts.headers as any) } });

  // Auto-refresh on 401
  if (res.status === 401 && !skipAuth) {
    try {
      const newToken = await refreshAccessToken();
      res = await fetch(url, {
        ...fetchOpts,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${newToken}`, ...(fetchOpts.headers as any) },
      });
    } catch {
      throw new Error('SESSION_EXPIRED');
    }
  }

  if (!res.ok) {
    let detail = res.statusText;
    try { const j = await res.json(); detail = j.detail ?? JSON.stringify(j); } catch {}
    throw new Error(detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Shorthand helpers
export const apiGet    = <T>(url: string)                       => api<T>(url);
export const apiPost   = <T>(url: string, body?: unknown)       => api<T>(url, { method: 'POST',  body: JSON.stringify(body) });
export const apiPatch  = <T>(url: string, body?: unknown)       => api<T>(url, { method: 'PATCH', body: JSON.stringify(body) });
export const apiDelete = <T>(url: string)                       => api<T>(url, { method: 'DELETE' });

import { supabase } from './supabase';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw { status: res.status, detail: err.detail ?? 'Request failed' };
  }
  return res.json();
}

export const api = {
  createProfile: (body: any) =>
    apiFetch('/api/v1/profiles', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => apiFetch('/api/v1/profiles/me'),
  getPredictions: () => apiFetch('/api/v1/predictions'),
  chat: (message: string, sessionId?: string) =>
    apiFetch('/api/v1/chat', {
      method: 'POST',
      body: JSON.stringify({ message, session_id: sessionId }),
    }),
  getChatHistory: () => apiFetch('/api/v1/chat/history'),
  logEvent: (body: any) =>
    apiFetch('/api/v1/events', { method: 'POST', body: JSON.stringify(body) }),
  getEvents: () => apiFetch('/api/v1/events'),
  interpretKundli: (body: any) =>
    apiFetch('/api/v1/kundli/interpret', { method: 'POST', body: JSON.stringify(body) }),
};

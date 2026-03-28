/**
 * API client for JyotishHardev backend.
 *
 * - Attaches Supabase JWT to every request.
 * - Handles 402 (rate limit) and 401 (auth expired) globally.
 * - Base URL from app.json extra config.
 */
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const BASE_URL: string =
  (Constants.expoConfig?.extra?.apiBaseUrl as string) || 'http://localhost:8000';

const SUPABASE_URL: string =
  (Constants.expoConfig?.extra?.supabaseUrl as string) || '';

const SUPABASE_ANON_KEY: string =
  (Constants.expoConfig?.extra?.supabaseAnonKey as string) || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Rate limit error ───────────────────────────────────────────────────────────

export class RateLimitError extends Error {
  upgradeUrl: string;
  constructor(upgradeUrl: string) {
    super('Daily message limit reached');
    this.name = 'RateLimitError';
    this.upgradeUrl = upgradeUrl;
  }
}

export class AuthExpiredError extends Error {
  constructor() {
    super('Authentication expired — please sign in again');
    this.name = 'AuthExpiredError';
  }
}

// ─── Core fetch wrapper ─────────────────────────────────────────────────────────

async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  tokenOverride?: string,
): Promise<T> {
  const token = tokenOverride ?? await getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    throw new AuthExpiredError();
  }

  if (response.status === 402) {
    const body = await response.json().catch(() => ({}));
    throw new RateLimitError(body.detail?.upgrade_url ?? '/subscription');
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(
      typeof errorBody.detail === 'string'
        ? errorBody.detail
        : JSON.stringify(errorBody.detail),
    );
  }

  return response.json() as Promise<T>;
}

// ─── Auth ───────────────────────────────────────────────────────────────────────

export const auth = {
  signUp: (email: string, password: string) =>
    supabase.auth.signUp({ email, password }),

  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  signOut: () => supabase.auth.signOut(),

  getSession: () => supabase.auth.getSession(),

  onAuthStateChange: (callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) =>
    supabase.auth.onAuthStateChange(callback),
};

// ─── Onboarding ─────────────────────────────────────────────────────────────────

export interface OnboardingPayload {
  name: string;
  dob: string;            // ISO date: YYYY-MM-DD
  tob?: string;           // ISO time: HH:MM:SS, optional
  tob_unknown: boolean;
  pob: string;
  pob_lat: number;
  pob_lon: number;
  pob_timezone: string;
  pob_timezone_offset: number;
  tradition: 'parashara' | 'jaimini';
  dpdpa_consent: boolean;
}

export interface Profile {
  id: string;
  name: string;
  dob: string;
  tob?: string;
  tob_unknown: boolean;
  pob: string;
  pob_lat: string;
  pob_lon: string;
  pob_timezone: string;
  tradition: string;
  lagna?: string;
  moon_sign?: string;
  trial_expires_at: string;
  subscription_active: boolean;
  share_token?: string;
  schema_version: number;
  created_at?: string;
}

export interface Kundali {
  id: string;
  profile_id: string;
  chart_json?: Record<string, unknown>;
  dasha_timeline_json?: unknown[];
  generation_status: string;
  schema_version: number;
  created_at?: string;
}

export const onboarding = {
  createProfile: (payload: OnboardingPayload, token?: string) =>
    apiFetch<{ profile: Profile; kundali: Kundali }>('/api/v1/profiles', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, token),

  getMe: () =>
    apiFetch<{ profile: Profile; kundali: Kundali | null }>('/api/v1/profiles/me'),
};

// ─── Predictions ────────────────────────────────────────────────────────────────

export interface Prediction {
  id: string;
  profile_id: string;
  dasha_period: string;
  domain: string;
  predicted_year_start: number;
  predicted_year_end: number;
  text: string;
  confidence_score: number;
  created_at?: string;
}

export interface ShareData {
  first_name: string;
  predictions: Prediction[];
  disclaimer: string;
}

export const predictions = {
  list: () => apiFetch<Prediction[]>('/api/v1/predictions'),

  getShare: (shareId: string) =>
    apiFetch<ShareData>(`/api/v1/share/${shareId}`),

  triggerGeneration: () =>
    apiFetch<{ status: string }>('/api/v1/predictions/generate', { method: 'POST' }),
};

// ─── Chat ───────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  memory_context?: string[];
}

export interface ChatResponse {
  message: ChatMessage;
  messages_used_today: number;
  daily_limit: number;
  session_id: string;
}

export const chat = {
  send: (message: string, sessionId?: string) =>
    apiFetch<ChatResponse>('/api/v1/chat', {
      method: 'POST',
      body: JSON.stringify({ message, session_id: sessionId }),
    }),

  history: () => apiFetch<ChatMessage[]>('/api/v1/chat/history'),
};

// ─── Events ─────────────────────────────────────────────────────────────────────

export interface EventPayload {
  type: string;
  event_date: string;   // ISO date: YYYY-MM-DD
  description: string;
  confirms_prediction_id?: string;
}

export interface EventRecord {
  id: string;
  profile_id: string;
  type: string;
  event_date: string;
  description: string;
  confirms_prediction_id?: string;
  created_at?: string;
}

export const events = {
  log: (payload: EventPayload) =>
    apiFetch<EventRecord>('/api/v1/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  list: () => apiFetch<EventRecord[]>('/api/v1/events'),
};

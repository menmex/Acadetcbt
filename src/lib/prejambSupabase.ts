import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Dedicated credentials configuration for the Pre-JAMB Academy Supabase Database
let dynamicPreJambSupabaseUrl = '';
let dynamicPreJambSupabaseAnonKey = '';
let dynamicPreJambSupabaseServiceKey = '';

// Load from localStorage if present in browser
if (typeof window !== 'undefined') {
  try {
    const savedUrl = localStorage.getItem('prejamb_supabase_url');
    const savedKey = localStorage.getItem('prejamb_supabase_anon_key');
    const savedService = localStorage.getItem('prejamb_supabase_service_key');
    if (savedUrl && savedKey) {
      dynamicPreJambSupabaseUrl = savedUrl.trim();
      dynamicPreJambSupabaseAnonKey = savedKey.trim();
      if (savedService) dynamicPreJambSupabaseServiceKey = savedService.trim();
    }
  } catch {}
}

export function setPreJambSupabaseConfig(url: string, anonKey: string, serviceKey?: string): void {
  if (url && anonKey) {
    dynamicPreJambSupabaseUrl = url.trim();
    dynamicPreJambSupabaseAnonKey = anonKey.trim();
    if (serviceKey) {
      dynamicPreJambSupabaseServiceKey = serviceKey.trim();
    }
    cachedClient = null;
    cachedAdminClient = null;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('prejamb_supabase_url', dynamicPreJambSupabaseUrl);
        localStorage.setItem('prejamb_supabase_anon_key', dynamicPreJambSupabaseAnonKey);
        if (serviceKey) {
          localStorage.setItem('prejamb_supabase_service_key', dynamicPreJambSupabaseServiceKey);
        }
      } catch {}
    }
  }
}

export function clearPreJambSupabaseConfig(): void {
  dynamicPreJambSupabaseUrl = '';
  dynamicPreJambSupabaseAnonKey = '';
  dynamicPreJambSupabaseServiceKey = '';
  cachedClient = null;
  cachedAdminClient = null;
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('prejamb_supabase_url');
      localStorage.removeItem('prejamb_supabase_anon_key');
      localStorage.removeItem('prejamb_supabase_service_key');
    } catch {}
  }
}

export async function fetchAndInitPreJambConfig(): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false;
    const res = await fetch('/api/prejamb/config');
    if (res.ok) {
      const data = await res.json();
      if (data.supabaseUrl && data.supabaseAnonKey) {
        setPreJambSupabaseConfig(data.supabaseUrl, data.supabaseAnonKey, data.supabaseServiceKey);
        return true;
      }
    }
  } catch {}
  return false;
}

// Automatically trigger config fetch on client load
if (typeof window !== 'undefined') {
  fetchAndInitPreJambConfig().catch(() => {});
}

export function getPreJambSupabaseUrl(): string {
  if (dynamicPreJambSupabaseUrl) return dynamicPreJambSupabaseUrl;
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.PREJAMB_SUPABASE_URL) return process.env.PREJAMB_SUPABASE_URL;
    if (process.env.VITE_PREJAMB_SUPABASE_URL) return process.env.VITE_PREJAMB_SUPABASE_URL;
  }
  try {
    const metaEnv = (import.meta as any)?.env;
    if (metaEnv?.VITE_PREJAMB_SUPABASE_URL) return metaEnv.VITE_PREJAMB_SUPABASE_URL;
    if (metaEnv?.PREJAMB_SUPABASE_URL) return metaEnv.PREJAMB_SUPABASE_URL;
  } catch {}
  return '';
}

export function getPreJambSupabaseAnonKey(): string {
  if (dynamicPreJambSupabaseAnonKey) return dynamicPreJambSupabaseAnonKey;
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.PREJAMB_SUPABASE_ANON_KEY) return process.env.PREJAMB_SUPABASE_ANON_KEY;
    if (process.env.VITE_PREJAMB_SUPABASE_ANON_KEY) return process.env.VITE_PREJAMB_SUPABASE_ANON_KEY;
  }
  try {
    const metaEnv = (import.meta as any)?.env;
    if (metaEnv?.VITE_PREJAMB_SUPABASE_ANON_KEY) return metaEnv.VITE_PREJAMB_SUPABASE_ANON_KEY;
    if (metaEnv?.PREJAMB_SUPABASE_ANON_KEY) return metaEnv.PREJAMB_SUPABASE_ANON_KEY;
  } catch {}
  return '';
}

export function getPreJambSupabaseServiceKey(): string {
  if (dynamicPreJambSupabaseServiceKey) return dynamicPreJambSupabaseServiceKey;
  if (typeof process !== 'undefined' && process.env?.PREJAMB_SUPABASE_SERVICE_ROLE_KEY) {
    return process.env.PREJAMB_SUPABASE_SERVICE_ROLE_KEY;
  }
  return '';
}

let cachedClient: SupabaseClient | null = null;
let cachedAdminClient: SupabaseClient | null = null;

class NoopWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  readonly CONNECTING = NoopWebSocket.CONNECTING;
  readonly OPEN = NoopWebSocket.OPEN;
  readonly CLOSING = NoopWebSocket.CLOSING;
  readonly CLOSED = NoopWebSocket.CLOSED;
  readonly readyState = this.CLOSED;
  readonly url: string;
  readonly protocol = '';
  onopen: ((this: NoopWebSocket, event: Event) => void) | null = null;
  onmessage: ((this: NoopWebSocket, event: MessageEvent) => void) | null = null;
  onerror: ((this: NoopWebSocket, event: Event) => void) | null = null;
  onclose: ((this: NoopWebSocket, event: CloseEvent) => void) | null = null;
  binaryType = 'blob';
  bufferedAmount = 0;
  extensions = '';

  constructor(url: string | URL, _subprotocols?: string | string[]) {
    this.url = String(url);
  }

  addEventListener(_type: string, _listener: EventListener): void {}
  removeEventListener(_type: string, _listener: EventListener): void {}
  send(_data: string | ArrayBufferLike | Blob | ArrayBufferView): void {}
  close(_code?: number, _reason?: string): void {}
}

type RealtimeOptions = NonNullable<NonNullable<Parameters<typeof createClient>[2]>['realtime']>;

function getRealtimeOptions(): RealtimeOptions | undefined {
  const isNode = typeof window === 'undefined' && typeof process !== 'undefined' && Boolean(process.versions?.node);
  const hasWebSocket = typeof (globalThis as { WebSocket?: unknown }).WebSocket !== 'undefined';
  return isNode && !hasWebSocket ? { transport: NoopWebSocket } : undefined;
}

/**
 * Returns true if Pre-JAMB Supabase URL and Anon Key are configured
 */
export function isPreJambSupabaseConfigured(): boolean {
  const url = getPreJambSupabaseUrl();
  const key = getPreJambSupabaseAnonKey();
  return Boolean(url && key && url.trim().length > 0 && key.trim().length > 0 && !url.includes('placeholder'));
}

/**
 * Returns the distinct client for Pre-JAMB Supabase queries
 */
export function getPreJambSupabaseClient(): SupabaseClient | null {
  const url = getPreJambSupabaseUrl();
  const key = getPreJambSupabaseAnonKey();

  if (!url || !key) {
    return null;
  }

  if (!cachedClient) {
    try {
      cachedClient = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storageKey: 'prejamb_supabase_auth_token',
        },
        realtime: getRealtimeOptions(),
      });
    } catch (err) {
      console.error('[PreJambSupabase] Client initialization error:', err);
      return null;
    }
  }

  return cachedClient;
}

/**
 * Returns the privileged admin client for Pre-JAMB Supabase queries
 */
export function getPreJambSupabaseAdminClient(): SupabaseClient | null {
  const url = getPreJambSupabaseUrl();
  const serviceKey = getPreJambSupabaseServiceKey() || getPreJambSupabaseAnonKey();

  if (!url || !serviceKey) {
    return null;
  }

  if (!cachedAdminClient) {
    try {
      cachedAdminClient = createClient(url, serviceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        realtime: getRealtimeOptions(),
      });
    } catch (err) {
      console.error('[PreJambSupabase] Admin client initialization error:', err);
      return null;
    }
  }

  return cachedAdminClient;
}

/**
 * Tests connection to the Pre-JAMB Supabase instance
 */
export async function testPreJambSupabaseConnection(): Promise<{
  connected: boolean;
  url: string;
  message: string;
  needsSchemaInit?: boolean;
  tablesFound?: string[];
  latencyMs?: number;
}> {
  const url = getPreJambSupabaseUrl();
  const client = getPreJambSupabaseClient();

  if (!url || !client) {
    return {
      connected: false,
      url: url || 'Not Configured',
      message: 'Pre-JAMB Supabase URL or Anon Key is missing. Operating in offline local storage mode.',
    };
  }

  const startTime = Date.now();
  try {
    // Attempt a light query on subjects table
    const { data, error } = await client.from('prejamb_subjects').select('id').limit(1);
    const latency = Date.now() - startTime;

    if (error) {
      const msg = error.message || '';
      const code = error.code || '';
      // If table doesn't exist yet, we still successfully reached Supabase!
      if (
        code === '42P01' ||
        code === 'PGRST205' ||
        msg.includes('relation "prejamb_subjects" does not exist') ||
        msg.includes('Could not find the table') ||
        msg.includes('schema cache')
      ) {
        return {
          connected: true,
          url,
          latencyMs: latency,
          needsSchemaInit: true,
          message: 'Connected to Supabase Project! The database tables need to be created using the Pre-JAMB SQL Schema script.',
        };
      }
      return {
        connected: false,
        url,
        latencyMs: latency,
        message: `Supabase returned error: ${msg} (code ${code})`,
      };
    }

    return {
      connected: true,
      url,
      latencyMs: latency,
      needsSchemaInit: false,
      message: `Successfully connected to Pre-JAMB Supabase database in ${latency}ms!`,
    };
  } catch (err: any) {
    return {
      connected: false,
      url,
      message: `Connection failed: ${err?.message || 'Network error'}`,
    };
  }
}

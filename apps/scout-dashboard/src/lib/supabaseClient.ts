import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Use validated env when available; fall back to process.env (CI) and then to placeholders.
const url = env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key';

// Singleton client - one global instance, no duplicates
let _client: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!_client) {
    _client = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}

// Helper to check if using real Supabase or placeholder
export function isSupabaseConfigured(): boolean {
  return (
    url !== 'https://placeholder.supabase.co' && anon !== 'placeholder-anon-key'
  );
}
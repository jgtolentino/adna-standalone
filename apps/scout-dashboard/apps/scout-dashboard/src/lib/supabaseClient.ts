import { createClient } from '@supabase/supabase-js';

// Allow placeholder values during CI build / local dev
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Singleton client
let _client: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!_client) {
    _client = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}

export function isSupabaseConfigured(): boolean {
  return url !== 'https://placeholder.supabase.co' && anon !== 'placeholder-anon-key';
}

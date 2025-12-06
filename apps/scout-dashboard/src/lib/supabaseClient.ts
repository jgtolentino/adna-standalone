import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Get validated environment variables
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
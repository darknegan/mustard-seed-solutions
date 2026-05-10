import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { env } from './env.js';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = env.supabaseUrl;
  const key = env.supabaseServiceRoleKey;

  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
        'Copy server/.env.example to server/.env and fill in your Supabase credentials.',
    );
  }

  client = createClient(url, key);
  return client;
}

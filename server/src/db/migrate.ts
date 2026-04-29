/**
 * Run with: npm run migrate
 *
 * Creates the `users` table in your Supabase project if it doesn't exist.
 * Uses the service-role key so it bypasses RLS.
 */
import '../config/env.js';
import { getSupabase } from '../config/supabase.js';

const CREATE_USERS_TABLE = `
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,

  -- profile
  first_name    TEXT NOT NULL DEFAULT '',
  last_name     TEXT NOT NULL DEFAULT '',
  company_name  TEXT NOT NULL DEFAULT '',
  phone         TEXT NOT NULL DEFAULT '',
  avatar_url    TEXT NOT NULL DEFAULT '',

  -- account state
  role          TEXT NOT NULL DEFAULT 'client'
                CHECK (role IN ('client', 'admin')),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,

  -- timestamps
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update "updated_at" on every row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at'
  ) THEN
    CREATE TRIGGER trg_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END;
$$;
`;

async function migrate(): Promise<void> {
  const supabase = getSupabase();

  console.log('Running migration: create users table…');

  const { error } = await supabase.rpc('exec_sql', { query: CREATE_USERS_TABLE });

  if (error) {
    // If the RPC doesn't exist, log the SQL so the user can run it manually
    console.error(
      'Could not execute migration via RPC. ' +
        'Run the following SQL in the Supabase SQL Editor:\n',
    );
    console.log(CREATE_USERS_TABLE);
    console.error('\nSupabase error:', error.message);
    process.exit(1);
  }

  console.log('Migration complete.');
}

migrate();

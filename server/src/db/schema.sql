-- ============================================================
-- Users table — run this in the Supabase SQL Editor
-- ============================================================

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

-- Row-level security (optional but recommended)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Design planning (client portal submissions)
CREATE TABLE IF NOT EXISTS mock_planning_briefs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_name     TEXT NOT NULL,
  primary_goal     TEXT NOT NULL,
  audience         TEXT NOT NULL,
  must_have_pages  TEXT NOT NULL,
  brand_notes      TEXT NOT NULL DEFAULT '',
  reference_notes  TEXT NOT NULL DEFAULT '',
  deadline         TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mock_planning_briefs_user_id ON mock_planning_briefs(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_planning_briefs_created_at ON mock_planning_briefs(created_at DESC);

CREATE TABLE IF NOT EXISTS client_todos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  description    TEXT NOT NULL DEFAULT '',
  category       TEXT NOT NULL DEFAULT 'general'
                 CHECK (category IN ('general', 'planning', 'content', 'access')),
  status         TEXT NOT NULL DEFAULT 'open'
                 CHECK (status IN ('open', 'done', 'cancelled')),
  due_at         TIMESTAMPTZ NULL,
  sort_order     INT NOT NULL DEFAULT 0,
  source         TEXT NOT NULL DEFAULT 'staff'
                 CHECK (source IN ('staff', 'system')),
  source_key     TEXT NULL,
  action_route   TEXT NULL,
  completed_at   TIMESTAMPTZ NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_todos_user_status_sort
  ON client_todos (user_id, status, sort_order);

CREATE UNIQUE INDEX IF NOT EXISTS idx_client_todos_user_source_key
  ON client_todos (user_id, source_key)
  WHERE source_key IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_client_todos_updated_at'
  ) THEN
    CREATE TRIGGER trg_client_todos_updated_at
      BEFORE UPDATE ON client_todos
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END;
$$;

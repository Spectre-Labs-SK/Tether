-- Tether | Spectre Labs
-- Migration 06: TetherState profile columns + hub_sessions table
-- Adds fields required by SPEC-002 (useTetherState) and HubSession.tsx

-- ─── profiles additions ────────────────────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_nightmare_active BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS theme_state TEXT NOT NULL DEFAULT 'MILITARY'
    CONSTRAINT profiles_theme_state_check CHECK (theme_state IN ('MILITARY', 'ETHER'));

-- ─── hub_sessions ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hub_sessions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id       UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  up_time_seconds  INTEGER     NOT NULL DEFAULT 0,
  postural_resets  INTEGER     NOT NULL DEFAULT 0,
  completed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast lookup by user, most-recent-first
CREATE INDEX IF NOT EXISTS hub_sessions_profile_time
  ON hub_sessions (profile_id, completed_at DESC);

-- ─── RLS ───────────────────────────────────────────────────────────────────

ALTER TABLE hub_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hub_sessions: owner access"
  ON hub_sessions
  FOR ALL
  USING  (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

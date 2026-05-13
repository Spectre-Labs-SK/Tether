-- Tether | Spectre Labs
-- Migration 08: Phase 0 behavior events and question sessions
-- Note: 07_avatar_loadout.sql already exists, so Phase 0 data-spine work starts at 08.

CREATE TABLE IF NOT EXISTS behavior_events (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_family  TEXT        NOT NULL CHECK (event_family IN (
    'task_action',
    'user_correction',
    'chaos_response',
    'question_answer',
    'plan_action',
    'trust_action'
  )),
  event_type    TEXT        NOT NULL CHECK (event_type IN (
    'complete',
    'skip',
    'substitute',
    'shuffle',
    'defer',
    'correction',
    'chaos_response',
    'partner_response',
    'asked',
    'answered',
    'question_skipped',
    'accepted',
    'changed',
    'rejected',
    'wipe_requested',
    'wipe_completed',
    'kill_switch_checked'
  )),
  source        TEXT        NOT NULL DEFAULT 'level_0_bunker',
  context       JSONB       NOT NULL DEFAULT '{}',
  metadata      JSONB       NOT NULL DEFAULT '{}',
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS behavior_events_profile_time
  ON behavior_events (profile_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS behavior_events_type_time
  ON behavior_events (event_type, occurred_at DESC);

CREATE TABLE IF NOT EXISTS question_sessions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id        UUID        DEFAULT NULL,
  purpose        TEXT        NOT NULL,
  questions      JSONB       NOT NULL DEFAULT '[]',
  answers        JSONB       NOT NULL DEFAULT '[]',
  question_count INTEGER     NOT NULL DEFAULT 0 CHECK (question_count >= 0 AND question_count <= 3),
  status         TEXT        NOT NULL DEFAULT 'drafting' CHECK (status IN (
    'drafting',
    'answered',
    'skipped',
    'abandoned'
  )),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS question_sessions_profile_time
  ON question_sessions (profile_id, created_at DESC);

ALTER TABLE behavior_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "behavior_events: owner access"
  ON behavior_events
  FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "question_sessions: owner access"
  ON question_sessions
  FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

COMMENT ON TABLE behavior_events IS 'Append-only Phase 0 stream for honest user behavior, including complete, skip, substitute, shuffle, defer, correction, and chaos response.';
COMMENT ON TABLE question_sessions IS 'High-yield planning question sessions capped at three questions per attempt.';

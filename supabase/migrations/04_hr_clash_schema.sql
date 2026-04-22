-- Tether | Spectre Labs
-- Migration 04: HR Readings + Joint Ops extensions
-- Adds: hr_readings, op_hr_sync tables; clash_state column on joint_ops

-- hr_readings: heart rate snapshots per profile (manual entry or wearable push)
CREATE TABLE hr_readings (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bpm         INTEGER     NOT NULL CHECK (bpm BETWEEN 20 AND 250),
  context     TEXT        NOT NULL DEFAULT 'cardio'
                          CHECK (context IN ('cardio', 'rest', 'lifting', 'recovery')),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- clash_state: contested | locked means operatives have conflicting priorities
-- none = nominal; contested = conflict flagged; locked = op blocked pending resolution
ALTER TABLE joint_ops
  ADD COLUMN clash_state TEXT NOT NULL DEFAULT 'none'
             CHECK (clash_state IN ('none', 'contested', 'locked'));

-- op_hr_sync: shared HR snapshots per operative within a joint op
-- Allows commander to see real-time readiness across the squad
CREATE TABLE op_hr_sync (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  op_id       UUID        NOT NULL REFERENCES joint_ops(id) ON DELETE CASCADE,
  profile_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bpm         INTEGER     NOT NULL CHECK (bpm BETWEEN 20 AND 250),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast recent-window lookups (trickycardio, op HR feeds)
CREATE INDEX hr_readings_profile_time ON hr_readings (profile_id, recorded_at DESC);
CREATE INDEX op_hr_sync_op_time       ON op_hr_sync  (op_id, recorded_at DESC);

-- RLS
ALTER TABLE hr_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE op_hr_sync  ENABLE ROW LEVEL SECURITY;

-- HR readings are private to the owning profile
CREATE POLICY "hr_readings: own rows" ON hr_readings
  FOR ALL USING (profile_id = auth.uid());

-- op_hr_sync: readable by all op members; only the owning profile can write/delete
CREATE POLICY "op_hr_sync: member read" ON op_hr_sync
  FOR SELECT USING (
    op_id IN (
      SELECT op_id FROM op_members WHERE profile_id = auth.uid()
      UNION
      SELECT id    FROM joint_ops  WHERE owner_id   = auth.uid()
    )
  );

CREATE POLICY "op_hr_sync: own insert" ON op_hr_sync
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "op_hr_sync: own delete" ON op_hr_sync
  FOR DELETE USING (profile_id = auth.uid());

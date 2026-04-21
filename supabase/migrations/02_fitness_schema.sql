-- Tether | Spectre Labs
-- Migration 02: Fitness Module Schema
-- Tables: workouts, exercises, workout_sets, one_rm_history
-- Note: SQL identifiers cannot start with a digit; "1rm_history" is implemented
--       as one_rm_history to avoid mandatory quoting at every call site.

-- workouts: a discrete training session belonging to a profile
CREATE TABLE workouts (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   UUID         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name         TEXT         NOT NULL,
  shimmer_mode TEXT         NOT NULL DEFAULT 'MILITARY'
                            CHECK (shimmer_mode IN ('MILITARY', 'ETHER')),
  started_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  finished_at  TIMESTAMPTZ,
  notes        TEXT,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- exercises: movement catalog; global entries (profile_id IS NULL) are system-wide
CREATE TABLE exercises (
  id            UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID   REFERENCES profiles(id) ON DELETE CASCADE,
  name          TEXT   NOT NULL,
  muscle_group  TEXT   NOT NULL,
  movement_type TEXT   NOT NULL
                       CHECK (movement_type IN ('push', 'pull', 'hinge', 'squat', 'carry', 'accessory')),
  is_global     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- workout_sets: individual sets logged within a workout
CREATE TABLE workout_sets (
  id           UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id   UUID       NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id  UUID       NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  set_number   INTEGER    NOT NULL CHECK (set_number > 0),
  reps         INTEGER    CHECK (reps > 0),
  weight_kg    NUMERIC(6,2) CHECK (weight_kg >= 0),
  rpe          NUMERIC(3,1) CHECK (rpe BETWEEN 1 AND 10),
  completed    BOOLEAN    NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- one_rm_history: time-series record of one-rep-max estimates per exercise per user
-- (fulfills the "1rm_history" table requirement)
CREATE TABLE one_rm_history (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   UUID         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_id  UUID         NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  one_rm_kg    NUMERIC(6,2) NOT NULL CHECK (one_rm_kg > 0),
  method       TEXT         NOT NULL DEFAULT 'calculated'
                            CHECK (method IN ('calculated', 'tested')),
  recorded_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Seed global Push Day exercises so onboarding has data to reference
INSERT INTO exercises (name, muscle_group, movement_type, is_global) VALUES
  ('Barbell Bench Press',    'chest',     'push', TRUE),
  ('Incline Dumbbell Press', 'chest',     'push', TRUE),
  ('Overhead Press',         'shoulders', 'push', TRUE),
  ('Lateral Raise',          'shoulders', 'push', TRUE),
  ('Tricep Rope Pushdown',   'triceps',   'push', TRUE),
  ('Skull Crusher',          'triceps',   'push', TRUE);

-- updated_at triggers (reuse function from migration 01)
CREATE TRIGGER workouts_updated_at
  BEFORE UPDATE ON workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER exercises_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE workouts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises      ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets   ENABLE ROW LEVEL SECURITY;
ALTER TABLE one_rm_history ENABLE ROW LEVEL SECURITY;

-- Users can read global exercises and their own custom ones
CREATE POLICY "exercises: read global or own" ON exercises
  FOR SELECT USING (
    is_global = TRUE
    OR profile_id = auth.uid()
  );

CREATE POLICY "exercises: insert own" ON exercises
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "exercises: update own" ON exercises
  FOR UPDATE USING (profile_id = auth.uid() AND is_global = FALSE);

CREATE POLICY "exercises: delete own" ON exercises
  FOR DELETE USING (profile_id = auth.uid() AND is_global = FALSE);

CREATE POLICY "workouts: own rows" ON workouts
  FOR ALL USING (profile_id = auth.uid());

CREATE POLICY "workout_sets: own via workout" ON workout_sets
  FOR ALL USING (
    workout_id IN (SELECT id FROM workouts WHERE profile_id = auth.uid())
  );

CREATE POLICY "one_rm_history: own rows" ON one_rm_history
  FOR ALL USING (profile_id = auth.uid());

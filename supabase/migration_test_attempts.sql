-- Run this in Supabase SQL Editor
-- Autosaves a student's in-progress answers so closing the tab (or the
-- lesson just ending) doesn't lose them. Separate from test_answers,
-- which only gets written once, at final submission, with the graded
-- is_correct/auto_score fields — test_attempts is the raw draft.

CREATE TABLE IF NOT EXISTS test_attempts (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id     UUID        NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  student_id  UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  answers     JSONB       NOT NULL DEFAULT '{}',
  status      TEXT        NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted')),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (test_id)
);

CREATE INDEX IF NOT EXISTS idx_test_attempts_student ON test_attempts(student_id);

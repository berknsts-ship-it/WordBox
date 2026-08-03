-- Run this in Supabase SQL Editor
-- Grammar exercises trainer (этап 2 из плана): библиотека переиспользуемых
-- наборов упражнений у репетитора. grammar_assignments создаётся сейчас же
-- (проще один раз согласовать схему), но код её начнёт использовать только
-- на этапе 4 (назначение ученикам + прохождение).

CREATE TABLE IF NOT EXISTS grammar_sets (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- "order" зарезервировано в SQL — назвал order_index, как везде в проекте
-- (test_tasks.order_index, test_questions.order_index).
CREATE TABLE IF NOT EXISTS grammar_exercises (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id         UUID        NOT NULL REFERENCES grammar_sets(id) ON DELETE CASCADE,
  order_index    INT         NOT NULL DEFAULT 0,
  type           TEXT        NOT NULL CHECK (type IN ('bracket', 'mcq', 'true_false', 'fix_error', 'gap_fill')),
  question       TEXT        NOT NULL,
  correct_answer TEXT        NOT NULL,
  options        JSONB,
  points         INT         NOT NULL DEFAULT 1,
  explanation    TEXT
);

CREATE INDEX IF NOT EXISTS idx_grammar_exercises_set ON grammar_exercises(set_id);

CREATE TABLE IF NOT EXISTS grammar_assignments (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id       UUID        NOT NULL REFERENCES grammar_sets(id) ON DELETE CASCADE,
  student_id   UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  assigned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status       TEXT        NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed'))
);

CREATE INDEX IF NOT EXISTS idx_grammar_assignments_set     ON grammar_assignments(set_id);
CREATE INDEX IF NOT EXISTS idx_grammar_assignments_student ON grammar_assignments(student_id);

ALTER TABLE grammar_sets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_exercises   ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tutor_grammar_sets" ON grammar_sets
  FOR ALL USING (tutor_id = auth.uid());

CREATE POLICY "tutor_grammar_exercises" ON grammar_exercises
  FOR ALL USING (
    EXISTS (SELECT 1 FROM grammar_sets s WHERE s.id = grammar_exercises.set_id AND s.tutor_id = auth.uid())
  );

CREATE POLICY "tutor_grammar_assignments" ON grammar_assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM grammar_sets s WHERE s.id = grammar_assignments.set_id AND s.tutor_id = auth.uid())
  );

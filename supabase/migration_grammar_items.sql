-- Run this in Supabase SQL Editor
-- Restructures grammar exercises from "1 exercise = 1 question" to
-- "1 exercise (instruction + type) = many items (individual sentences)" —
-- same shape as the test_tasks/test_questions split done earlier for tests.
-- Adds word_order as a 6th exercise type.
--
-- Zero data loss: every existing grammar_exercises row keeps its id and
-- becomes the "block" row; its question/correct_answer/options/points/
-- explanation get copied into a new grammar_exercise_items row (order 0),
-- then those columns are dropped from grammar_exercises since they now
-- live on the item instead.

ALTER TABLE grammar_exercises ADD COLUMN IF NOT EXISTS instruction TEXT;

ALTER TABLE grammar_exercises DROP CONSTRAINT IF EXISTS grammar_exercises_type_check;
ALTER TABLE grammar_exercises ADD CONSTRAINT grammar_exercises_type_check
  CHECK (type IN ('bracket', 'mcq', 'true_false', 'fix_error', 'gap_fill', 'word_order'));

CREATE TABLE IF NOT EXISTS grammar_exercise_items (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id    UUID        NOT NULL REFERENCES grammar_exercises(id) ON DELETE CASCADE,
  order_index    INT         NOT NULL DEFAULT 0,
  question       TEXT        NOT NULL,
  correct_answer TEXT        NOT NULL,
  options        JSONB,
  points         INT         NOT NULL DEFAULT 1,
  explanation    TEXT
);

CREATE INDEX IF NOT EXISTS idx_grammar_exercise_items_exercise ON grammar_exercise_items(exercise_id);

ALTER TABLE grammar_exercise_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tutor_grammar_exercise_items" ON grammar_exercise_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM grammar_exercises e
      JOIN grammar_sets s ON s.id = e.set_id
      WHERE e.id = grammar_exercise_items.exercise_id AND s.tutor_id = auth.uid()
    )
  );

-- Migrate: one item per existing exercise, guarded so it's safe to re-run.
INSERT INTO grammar_exercise_items (exercise_id, order_index, question, correct_answer, options, points, explanation)
SELECT id, 0, question, correct_answer, options, points, explanation
FROM grammar_exercises
WHERE NOT EXISTS (SELECT 1 FROM grammar_exercise_items WHERE exercise_id = grammar_exercises.id);

-- These now live on grammar_exercise_items instead.
ALTER TABLE grammar_exercises DROP COLUMN IF EXISTS question;
ALTER TABLE grammar_exercises DROP COLUMN IF EXISTS correct_answer;
ALTER TABLE grammar_exercises DROP COLUMN IF EXISTS options;
ALTER TABLE grammar_exercises DROP COLUMN IF EXISTS points;
ALTER TABLE grammar_exercises DROP COLUMN IF EXISTS explanation;

-- Run this in Supabase SQL Editor
-- Introduces "tasks" between sections and questions so exercises with
-- several sub-questions (find the mistake x8, odd one out x6, etc.) show
-- as one card with local 1..N numbering instead of one long test-wide
-- sequential list.

CREATE TABLE IF NOT EXISTS test_tasks (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id   UUID        NOT NULL REFERENCES test_sections(id) ON DELETE CASCADE,
  order_index  INT         NOT NULL DEFAULT 0,
  title        TEXT,
  instruction  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_tasks_section ON test_tasks(section_id);

ALTER TABLE test_questions ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES test_tasks(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_test_questions_task ON test_questions(task_id);

-- Backfill: wrap each existing section's loose questions into one
-- untitled task so nothing already created (incl. Диана's Unit 4 test)
-- breaks. Safe to re-run: skips sections that already have a task, and
-- only touches questions that don't have a task_id yet.
INSERT INTO test_tasks (section_id, order_index, title)
SELECT DISTINCT tq.section_id, 0, NULL
FROM test_questions tq
WHERE tq.section_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM test_tasks t WHERE t.section_id = tq.section_id);

UPDATE test_questions q
SET task_id = t.id
FROM test_tasks t
WHERE t.section_id = q.section_id AND q.task_id IS NULL;

-- Correction: section_id turned out to still be NOT NULL on
-- test_questions, so the app keeps writing both section_id and
-- task_id on every insert going forward — it's not actually dead,
-- just redundant with task_id.

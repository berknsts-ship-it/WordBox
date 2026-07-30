-- Run this in Supabase SQL Editor
-- test_tasks (added for task-grouping) and test_attempts (added for
-- autosave) both got created with RLS already on by default and zero
-- policies — meaning only the service-role key could read them. The
-- tutor's own authenticated session got nothing back, which is why
-- the edit/view pages showed empty tasks even though the data was
-- really there (test_questions itself was already fine — its policy
-- is scoped via section_id, independent of test_tasks).

ALTER TABLE test_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tutor_tasks" ON test_tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM test_sections ts
      JOIN tests t ON t.id = ts.test_id
      WHERE ts.id = test_tasks.section_id
        AND t.tutor_id = auth.uid()
    )
  );

-- test_attempts is only ever touched through the service-role client
-- today (saveAttempt/submitTest actions, the student page), so this
-- isn't causing a visible bug right now — added for consistency and
-- in case a tutor-facing feature reads it directly later.
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tutor_attempts" ON test_attempts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tests
      WHERE tests.id = test_attempts.test_id
        AND tests.tutor_id = auth.uid()
    )
  );

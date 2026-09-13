-- Run this in Supabase SQL Editor
-- Links a homework row to the trainer content it's actually asking the
-- student to do, so completing that content can flip the homework's own
-- status automatically instead of it sitting "не сдано" forever regardless
-- of what the student actually did.
--
-- grammar_assignment_id points at the per-student grammar_assignments row
-- (already carries status/score) rather than just grammar_sets — no need
-- to re-derive "which student's attempt" at read time.
--
-- vocabulary_sets has no per-student "assignment" row with its own status
-- (set_assignments is just a set_id/student_id junction), so homework
-- links straight to the set; "completed" is computed from trainer_progress
-- (all of the set's words mastered) rather than stored redundantly.

ALTER TABLE homework
  ADD COLUMN IF NOT EXISTS grammar_assignment_id UUID REFERENCES grammar_assignments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS vocabulary_set_id      UUID REFERENCES vocabulary_sets(id)      ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS completed_late          BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_homework_grammar_assignment ON homework(grammar_assignment_id);
CREATE INDEX IF NOT EXISTS idx_homework_vocabulary_set     ON homework(vocabulary_set_id);

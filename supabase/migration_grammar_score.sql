-- Run this in Supabase SQL Editor
-- submitGrammarAttempt already computes score/maxScore on every submission
-- but only ever returns them to the client, never persists them — so
-- "средний процент" for grammar in /tutor/progress has nothing to read.
-- Adds the two columns; the action gets updated to actually write them.

ALTER TABLE grammar_assignments ADD COLUMN IF NOT EXISTS score INT;
ALTER TABLE grammar_assignments ADD COLUMN IF NOT EXISTS max_score INT;

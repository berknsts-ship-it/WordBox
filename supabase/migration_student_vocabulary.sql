-- Run this in Supabase SQL Editor
-- Lets students add their own words alongside the tutor's, tracked by who added them.

ALTER TABLE vocabulary_words
  ADD COLUMN IF NOT EXISTS added_by    TEXT NOT NULL DEFAULT 'tutor' CHECK (added_by IN ('tutor', 'student')),
  ADD COLUMN IF NOT EXISTS added_by_id UUID;

-- added_by_id is a plain UUID (no FK): it points at auth.users(id) when
-- added_by='tutor' and students(id) when added_by='student' — two possible
-- referents, so a single foreign key isn't possible here.

CREATE INDEX IF NOT EXISTS idx_vocabulary_words_added_by
  ON vocabulary_words(added_by_id) WHERE added_by = 'student';

-- Note on RLS: vocabulary_words/vocabulary_sets currently have no row-level
-- security (verified: the anon key can already read every row). Students
-- also never get a Supabase Auth session — they're identified only by the
-- access_code in the URL — so a real `added_by_id = auth.uid()` policy
-- isn't possible for them the way it is for tutor_id elsewhere in this app.
-- Ownership for student-added words is enforced in the server actions
-- (src/app/actions/student-vocabulary.ts), the same way every other
-- student-side mutation in this codebase already works (trainer_progress,
-- homework, etc. — all through the service-role client with an app-level
-- ownership check, not DB RLS). Turning on RLS for these two tables would
-- be a separate, larger hardening pass across every existing call site —
-- happy to do that as its own task if wanted.

-- Run this in Supabase SQL Editor
-- Vocabulary sets become global (like materials) and are assigned to students via junction table

-- Allow sets without a student (global library)
ALTER TABLE vocabulary_sets ALTER COLUMN student_id DROP NOT NULL;

-- Junction table: one set → many students
CREATE TABLE IF NOT EXISTS set_assignments (
  set_id     UUID NOT NULL REFERENCES vocabulary_sets(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id)        ON DELETE CASCADE,
  PRIMARY KEY (set_id, student_id)
);

-- Backfill existing sets that already have student_id
INSERT INTO set_assignments (set_id, student_id)
SELECT id, student_id FROM vocabulary_sets WHERE student_id IS NOT NULL
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_set_assignments_student ON set_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_set_assignments_set     ON set_assignments(set_id);

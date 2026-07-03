-- Run this in Supabase SQL Editor
-- Adds example_sentence + answer_variants to vocabulary_words
-- Creates trainer_progress table for spaced repetition

ALTER TABLE vocabulary_words
  ADD COLUMN IF NOT EXISTS example_sentence TEXT,
  ADD COLUMN IF NOT EXISTS answer_variants   TEXT[] DEFAULT '{}';

CREATE TABLE IF NOT EXISTS trainer_progress (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID        NOT NULL REFERENCES students(id)          ON DELETE CASCADE,
  word_id        UUID        NOT NULL REFERENCES vocabulary_words(id)  ON DELETE CASCADE,
  status         TEXT        NOT NULL DEFAULT 'queue'
                             CHECK (status IN ('queue', 'learning', 'mastered')),
  correct_streak INT         NOT NULL DEFAULT 0,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, word_id)
);

CREATE INDEX IF NOT EXISTS idx_trainer_progress_student ON trainer_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_trainer_progress_word    ON trainer_progress(word_id);

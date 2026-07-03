-- Run in Supabase SQL Editor
-- Adds open-brackets exercise fields to vocabulary_words

ALTER TABLE vocabulary_words
  ADD COLUMN IF NOT EXISTS bracket_sentence TEXT,
  ADD COLUMN IF NOT EXISTS bracket_answer   TEXT;

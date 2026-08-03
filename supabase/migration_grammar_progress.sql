-- Run this in Supabase SQL Editor
-- Progress/autosave for grammar assignments (этап 4-5): ученик сохраняет
-- ответы по ходу прохождения, может прерваться и вернуться — как в тестах
-- (test_attempts), только тут это прямо на строке assignment, т.к. на
-- один set и ученика — одно прохождение (без пересдач).

ALTER TABLE grammar_assignments ADD COLUMN IF NOT EXISTS answers    JSONB       NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE grammar_assignments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

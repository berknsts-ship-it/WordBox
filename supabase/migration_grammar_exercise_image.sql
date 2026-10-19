-- Run this in Supabase SQL Editor
-- Картинка к упражнению грамматического тренажёра (например, таблица из
-- учебника, по которой отвечают на вопросы). Показывается над пунктами.
ALTER TABLE grammar_exercises ADD COLUMN IF NOT EXISTS image_url TEXT;

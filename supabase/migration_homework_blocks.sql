-- Run this in Supabase SQL Editor
-- Этап 1 конструктора интерактивных домашних заданий: домашка (существующая
-- таблица homework) может состоять из блоков (инструкция / банк слов /
-- картинка+ответ / автовопрос / свободный вопрос), каждый блок — из пунктов.
-- Та же двухуровневая схема, что уже используется для грамматики
-- (grammar_exercises/grammar_exercise_items) и тестов (test_tasks/
-- test_questions) — переиспользуем архитектуру, а не придумываем новую.
--
-- auto_type/options/correct_answer у пункта — ровно те же поля, что у
-- grammar_exercise_items, специально для переиспользования
-- isGrammarAnswerCorrect() при автопроверке на этапе 2, без дублирования
-- логики проверки.
--
-- Таблицы для этапов 2-3 (черновик ответов ученика, ручная проверка)
-- будут отдельной миграцией, когда дойдёт очередь до тех этапов.

CREATE TABLE IF NOT EXISTS homework_blocks (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  homework_id UUID        NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
  order_index INT         NOT NULL DEFAULT 0,
  type        TEXT        NOT NULL CHECK (type IN ('instruction', 'word_bank', 'image_answer', 'auto_question', 'free_question')),
  instruction TEXT,   -- instruction: сам текст; у остальных типов — необязательная подпись над блоком
  words       JSONB,  -- word_bank: string[] слов-подсказок
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_homework_blocks_homework ON homework_blocks(homework_id);

CREATE TABLE IF NOT EXISTS homework_block_items (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id       UUID    NOT NULL REFERENCES homework_blocks(id) ON DELETE CASCADE,
  order_index    INT     NOT NULL DEFAULT 0,
  image_url      TEXT,   -- image_answer: URL картинки в Storage (bucket board-images, префикс homework/)
  question       TEXT,   -- auto_question / free_question: текст вопроса
  auto_type      TEXT CHECK (auto_type IN ('mcq', 'gap_fill', 'true_false', 'bracket', 'word_order')),
  options        JSONB,  -- auto_question mcq: варианты
  correct_answer TEXT,   -- auto_question: эталон (не отдаём ученику до сдачи — как в grammar_exercise_items)
  points         INT     NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_homework_block_items_block ON homework_block_items(block_id);

ALTER TABLE homework_blocks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_block_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tutor_homework_blocks" ON homework_blocks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM homework h WHERE h.id = homework_blocks.homework_id AND h.tutor_id = auth.uid())
  );

CREATE POLICY "tutor_homework_block_items" ON homework_block_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM homework_blocks b
      JOIN homework h ON h.id = b.homework_id
      WHERE b.id = homework_block_items.block_id AND h.tutor_id = auth.uid()
    )
  );

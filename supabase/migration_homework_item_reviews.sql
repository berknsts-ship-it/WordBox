-- Run this in Supabase SQL Editor
-- Этап 3: ручная проверка репетитором пунктов без автопроверки (картинка+
-- ответ, свободный вопрос). Автозадания не хранят свою проверку здесь —
-- их правильность считается на лету через isGrammarAnswerCorrect() по уже
-- сохранённому ответу ученика и correct_answer, как и в гramматике/тестах,
-- чтобы не дублировать логику проверки и не рассинхронизировать её со
-- значением, которое видит ученик.

CREATE TABLE IF NOT EXISTS homework_item_reviews (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id  UUID NOT NULL REFERENCES homework_block_items(id) ON DELETE CASCADE UNIQUE,
  status   TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'correct', 'incorrect')),
  comment  TEXT
);

ALTER TABLE homework_item_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tutor_homework_item_reviews" ON homework_item_reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM homework_block_items i
      JOIN homework_blocks b ON b.id = i.block_id
      JOIN homework h ON h.id = b.homework_id
      WHERE i.id = homework_item_reviews.item_id AND h.tutor_id = auth.uid()
    )
  );

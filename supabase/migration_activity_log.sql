-- Run this in Supabase SQL Editor
-- Часть 1 аналитики прогресса: last_seen на students + activity_log для
-- значимых событий (не каждый клик — открытие вкладок тренажёра/грамматики/
-- доски, завершение набора, старт/сдача теста).
--
-- tutor_id денормализован на activity_log (как в grammar_sets и т.п.) —
-- чтобы дашборд "вся активность моих учеников" не требовал JOIN на каждый
-- запрос, и чтобы RLS-политика была прямой, без EXISTS-подзапроса.
--
-- reference — TEXT, не UUID: у части событий уже есть под рукой настоящий
-- id (assignment/test), а у части (например тренажёр лексики) пока только
-- название набора без id в компоненте — TEXT принимает и то, и другое без
-- лишнего протаскивания пропсов на этом этапе.

ALTER TABLE students ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS activity_log (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID        NOT NULL REFERENCES students(id)   ON DELETE CASCADE,
  event_type TEXT        NOT NULL CHECK (event_type IN (
    'trainer_open', 'trainer_completed',
    'grammar_open', 'grammar_completed',
    'vocabulary_open',
    'board_open',
    'test_started', 'test_submitted'
  )),
  reference  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_student_created ON activity_log(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_tutor_created   ON activity_log(tutor_id, created_at DESC);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tutor_activity_log" ON activity_log
  FOR ALL USING (tutor_id = auth.uid());

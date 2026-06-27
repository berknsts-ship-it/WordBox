-- Конспекты уроков (снэпшоты доски)
-- Выполнить в Supabase SQL Editor

CREATE TABLE IF NOT EXISTS board_snapshots (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  student_id  UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  lesson_id   UUID REFERENCES lessons(id) ON DELETE SET NULL,
  title       TEXT NOT NULL DEFAULT '',
  items       JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE board_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "snapshots_by_tutor" ON board_snapshots
  FOR ALL USING (auth.uid() = tutor_id);

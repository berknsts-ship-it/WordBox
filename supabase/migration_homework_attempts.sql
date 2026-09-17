-- Run this in Supabase SQL Editor
-- Этап 2 конструктора интерактивных домашних заданий: автосохранение
-- черновика ответов ученика — тот же паттерн, что test_attempts у тестов
-- (см. migration_test_attempts.sql). Отдельная таблица от homework, чтобы
-- частые автосейвы не задевали саму строку задания.
--
-- Без RLS — как и test_attempts: ученик не аутентифицирован через Supabase
-- Auth (заходит по коду доступа), поэтому таблицу читает/пишет только
-- server action через createAdminClient(), напрямую с клиента к ней
-- никто не обращается.

CREATE TABLE IF NOT EXISTS homework_attempts (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  homework_id UUID        NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
  student_id  UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  answers     JSONB       NOT NULL DEFAULT '{}',
  status      TEXT        NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted')),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (homework_id)
);

CREATE INDEX IF NOT EXISTS idx_homework_attempts_student ON homework_attempts(student_id);

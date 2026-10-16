-- Разрешает статус урока 'missed' («Сгорел»).
-- Старое ограничение на lessons.status не включало 'missed', поэтому отметка
-- «Сгорел» молча не сохранялась и урок оставался «Запланирован».

-- Удаляем все старые CHECK-ограничения на lessons.status (имя заранее неизвестно)
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.lessons'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE public.lessons DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

-- На всякий случай приводим старое название к новому
UPDATE public.lessons SET status = 'missed' WHERE status = 'burnt';

ALTER TABLE public.lessons
  ADD CONSTRAINT lessons_status_check
  CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled', 'missed'));

-- Проверка: должно показать новое ограничение
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.lessons'::regclass AND contype = 'c';

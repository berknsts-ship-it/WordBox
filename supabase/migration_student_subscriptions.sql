-- Run this in Supabase SQL Editor
-- Student lesson-package ("абонемент") feature: the app code (CreateSubscriptionForm,
-- SubscriptionCard, actions/subscriptions.ts, students pages, schedule page) has
-- always expected a "subscriptions" table and lessons.subscription_id/deducted_amount
-- columns — none of it was ever actually created in WordBox's database, so every
-- create/renew/cancel has been failing outright, and the students-list query itself
-- (which selects lessons.subscription_id) has been silently erroring too.
--
-- Named student_subscriptions (not "subscriptions") for consistency with T-Kit,
-- where "subscriptions" was already taken by an unrelated tutor-billing table.

CREATE TABLE IF NOT EXISTS student_subscriptions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id   UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL DEFAULT 'Абонемент',
  total_amount NUMERIC     NOT NULL,
  balance      NUMERIC     NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'active',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_subscriptions_tutor   ON student_subscriptions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_student_subscriptions_student ON student_subscriptions(student_id);

ALTER TABLE student_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tutor_student_subscriptions" ON student_subscriptions
  FOR ALL USING (tutor_id = auth.uid());

-- lessons needs to know which package it's paid from, and how much was deducted
-- once it's completed (so a price change afterwards doesn't retroactively affect it).
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES student_subscriptions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS deducted_amount NUMERIC;

-- Atomic balance deduction, called when a lesson tied to a package is marked
-- completed/missed (mirrors T-Kit's actions/lessons.ts pattern).
CREATE OR REPLACE FUNCTION public.subscription_deduct(p_id uuid, p_amount int)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.student_subscriptions
  SET balance = balance - p_amount
  WHERE id = p_id;
$$;

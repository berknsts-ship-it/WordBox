-- Run this in Supabase SQL Editor
-- Reverses subscription_deduct — needed when a lesson that already deducted
-- (completed/missed) gets cancelled or rescheduled afterward, so the
-- money/slot goes back to the subscription instead of staying silently
-- deducted forever.
CREATE OR REPLACE FUNCTION public.subscription_refund(p_id uuid, p_amount int)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.student_subscriptions
  SET balance = balance + p_amount
  WHERE id = p_id;
$$;

-- Adds a persisted "how many lessons this package covers" count to
-- subscriptions, alongside the existing money balance (total_amount/balance).
-- Nullable: existing subscriptions simply have no known lesson count until
-- set, and the UI falls back to the money-only view for those.
ALTER TABLE student_subscriptions ADD COLUMN lesson_count integer;

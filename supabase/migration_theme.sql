-- Run this in Supabase SQL Editor
-- Adds theme selection to students table

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT NULL;

-- theme = NULL means "not chosen yet" → show onboarding on first login
-- theme = 'classic' means chosen classic (the default)
-- Valid values: classic, coral, ocean, forest, sun, neon, craft, kawaii, scene, sunset, emerald, graphite

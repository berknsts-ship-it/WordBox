-- Lets a lesson remember every date it was previously scheduled at, so a
-- reschedule (possibly several times) shows as a full chain instead of the
-- lesson silently vanishing from its old slot with nothing at the new one.
-- lessons.date stays the single source of truth for "when is this lesson
-- actually happening now" (what the calendar filters on); date_history is
-- purely a breadcrumb trail of where it's been.
ALTER TABLE lessons ADD COLUMN date_history jsonb;

"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type ActivityEventType =
  | "trainer_open" | "trainer_completed"
  | "grammar_open" | "grammar_completed"
  | "vocabulary_open"
  | "board_open"
  | "test_started" | "test_submitted";

// Resolves by access code rather than requiring the caller to already know
// the student's row id — every student-facing component has the code (it's
// in the URL), not all of them have threaded studentId down this deep, and
// this mirrors the exact lookup every student page already does on load.
export async function logActivity(code: string, eventType: ActivityEventType, reference?: string | null) {
  const db = createAdminClient();
  const { data: student } = await db.from("students").select("id, tutor_id").eq("access_code", code).single();
  if (!student) return;

  await db.from("activity_log").insert({
    tutor_id: student.tutor_id,
    student_id: student.id,
    event_type: eventType,
    reference: reference ?? null,
  });
  await db.from("students").update({ last_seen_at: new Date().toISOString() }).eq("id", student.id);
}

"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function upsertWordProgress(
  studentId: string,
  wordId: string,
  status: "queue" | "learning" | "mastered"
) {
  const db = createAdminClient();
  await db.from("trainer_progress").upsert(
    {
      student_id: studentId,
      word_id: wordId,
      status,
      correct_streak: status === "mastered" ? 2 : status === "learning" ? 1 : 0,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_id,word_id" }
  );
}

"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { checkAndCompleteVocabularyHomework } from "@/lib/homework/autocomplete";

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

  // Vocabulary has no single "submit" moment like grammar does — a набор
  // counts as done the same way the set list already shows it (✅/progress
  // bar): every word in it reached "mastered". Only worth checking right
  // when a word JUST became mastered, and only costs a couple of extra
  // queries when it does.
  if (status === "mastered") {
    const { data: word } = await db.from("vocabulary_words").select("set_id").eq("id", wordId).single();
    if (word) await checkAndCompleteVocabularyHomework(studentId, word.set_id);
  }
}

import { createAdminClient } from "@/lib/supabase/admin";

type Db = ReturnType<typeof createAdminClient>;

// Flips any pending homework linked to this trainer content over to
// "submitted" (renders as "Сдано" everywhere already, no new status
// needed) and stamps whether the due date had already passed — the label
// only distinguishes "сдано" vs "сдано с опозданием" at render time from
// this one flag, nothing else changes.
async function markPendingHomeworkDone(
  db: Db,
  column: "grammar_assignment_id" | "vocabulary_set_id",
  value: string,
  studentId?: string
) {
  let query = db.from("homework").select("id, due_date").eq(column, value).eq("status", "pending");
  if (studentId) query = query.eq("student_id", studentId);
  const { data: rows } = await query;
  if (!rows || rows.length === 0) return;

  const now = Date.now();
  for (const hw of rows) {
    const late = !!hw.due_date && new Date(hw.due_date).getTime() < now;
    await db.from("homework").update({ status: "submitted", completed_late: late }).eq("id", hw.id);
  }
}

// Call once a grammar_assignments row is marked "completed" — a single,
// unambiguous moment (the student pressed "submit").
export async function completeHomeworkForGrammarAssignment(assignmentId: string) {
  const db = createAdminClient();
  await markPendingHomeworkDone(db, "grammar_assignment_id", assignmentId);
}

// Vocabulary has no per-set "submit" moment — completion is defined the
// same way the set-list page already shows a set as done: every word in
// it has reached trainer_progress status "mastered" for this student.
// Call after any word's progress changes to "mastered"; cheap early-out
// if the set still has unmastered words.
export async function checkAndCompleteVocabularyHomework(studentId: string, setId: string) {
  const db = createAdminClient();
  const { data: words } = await db.from("vocabulary_words").select("id").eq("set_id", setId);
  const wordIds = (words ?? []).map(w => w.id);
  if (wordIds.length === 0) return;

  const { data: progress } = await db
    .from("trainer_progress")
    .select("word_id, status")
    .eq("student_id", studentId)
    .in("word_id", wordIds);
  const masteredCount = (progress ?? []).filter(p => p.status === "mastered").length;
  if (masteredCount < wordIds.length) return;

  await markPendingHomeworkDone(db, "vocabulary_set_id", setId, studentId);
}

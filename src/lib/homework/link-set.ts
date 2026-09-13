import { createAdminClient } from "@/lib/supabase/admin";

type Db = ReturnType<typeof createAdminClient>;

// Giving homework "pass this set" used to be a two-step, easy-to-forget
// dance: assign the set to the student on the grammar/vocabulary page,
// THEN separately add a homework entry describing it in free text — with
// nothing tying the two together, so the homework never learned whether
// the student actually did it. This makes picking a set when creating the
// homework also assign it (if it wasn't already), so one action does both.

// Returns the grammar_assignments.id to link the homework row to —
// reuses an existing assignment for this (set, student) pair if one
// already exists (whatever its status), otherwise creates a fresh one.
export async function ensureGrammarAssignment(db: Db, setId: string, studentId: string): Promise<string | null> {
  const { data: existing } = await db
    .from("grammar_assignments")
    .select("id")
    .eq("set_id", setId)
    .eq("student_id", studentId)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await db
    .from("grammar_assignments")
    .insert({ set_id: setId, student_id: studentId })
    .select("id")
    .single();
  if (error || !created) return null;
  return created.id;
}

// Vocabulary sets are assigned via the plain set_assignments junction —
// just makes sure a row exists, nothing to return (homework links to the
// set_id directly, see migration_homework_trainer_link.sql).
export async function ensureVocabularyAssignment(db: Db, setId: string, studentId: string): Promise<void> {
  const { data: existing } = await db
    .from("set_assignments")
    .select("set_id")
    .eq("set_id", setId)
    .eq("student_id", studentId)
    .maybeSingle();
  if (existing) return;
  await db.from("set_assignments").insert({ set_id: setId, student_id: studentId });
}

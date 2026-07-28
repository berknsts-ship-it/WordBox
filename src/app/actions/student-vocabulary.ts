"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const OWN_WORDS_SET_NAME = "Мои слова";

async function getOrCreateOwnWordsSet(studentId: string): Promise<string | null> {
  const db = createAdminClient();

  const { data: existing } = await db
    .from("vocabulary_sets")
    .select("id, set_assignments!inner(student_id)")
    .eq("name", OWN_WORDS_SET_NAME)
    .eq("set_assignments.student_id", studentId)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: student } = await db
    .from("students")
    .select("tutor_id")
    .eq("id", studentId)
    .single();
  if (!student) return null;

  const { data: newSet, error } = await db
    .from("vocabulary_sets")
    .insert({ tutor_id: student.tutor_id, name: OWN_WORDS_SET_NAME })
    .select("id")
    .single();
  if (error || !newSet) return null;

  await db.from("set_assignments").insert({ set_id: newSet.id, student_id: studentId });

  return newSet.id;
}

// setId: an existing set already assigned to this student, or null/undefined
// to use (and lazily create) their personal "Мои слова" set.
export async function addStudentWord(
  studentId: string,
  english: string,
  russian: string,
  setId?: string | null
) {
  const en = english.trim();
  const ru = russian.trim();
  if (!en || !ru) return { error: "Заполни слово и перевод" };

  const db = createAdminClient();
  let targetSetId = setId;

  if (targetSetId) {
    const { data: assignment } = await db
      .from("set_assignments")
      .select("set_id")
      .eq("set_id", targetSetId)
      .eq("student_id", studentId)
      .maybeSingle();
    if (!assignment) return { error: "Эта тема тебе не назначена" };
  } else {
    targetSetId = await getOrCreateOwnWordsSet(studentId) ?? undefined;
    if (!targetSetId) return { error: "Не удалось создать тему для своих слов" };
  }

  const { data: word, error } = await db
    .from("vocabulary_words")
    .insert({
      set_id: targetSetId,
      english: en,
      russian: ru,
      added_by: "student",
      added_by_id: studentId,
    })
    .select("id, english, russian, set_id, added_by, added_by_id, vocabulary_sets(name)")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/student/[code]", "page");

  const setRel = word.vocabulary_sets as unknown as { name: string } | { name: string }[] | null;
  const setName = Array.isArray(setRel) ? setRel[0]?.name : setRel?.name;

  return { word: { ...word, setName: setName ?? OWN_WORDS_SET_NAME } };
}

async function assertOwnWord(db: ReturnType<typeof createAdminClient>, studentId: string, wordId: string) {
  const { data: word } = await db
    .from("vocabulary_words")
    .select("id, added_by, added_by_id")
    .eq("id", wordId)
    .single();
  if (!word || word.added_by !== "student" || word.added_by_id !== studentId) {
    return null;
  }
  return word;
}

export async function updateStudentWord(
  studentId: string,
  wordId: string,
  english: string,
  russian: string
) {
  const en = english.trim();
  const ru = russian.trim();
  if (!en || !ru) return { error: "Заполни слово и перевод" };

  const db = createAdminClient();
  const owned = await assertOwnWord(db, studentId, wordId);
  if (!owned) return { error: "Можно редактировать только свои слова" };

  const { error } = await db
    .from("vocabulary_words")
    .update({ english: en, russian: ru })
    .eq("id", wordId);
  if (error) return { error: error.message };

  revalidatePath("/student/[code]", "page");
  return { ok: true };
}

export async function deleteStudentWord(studentId: string, wordId: string) {
  const db = createAdminClient();
  const owned = await assertOwnWord(db, studentId, wordId);
  if (!owned) return { error: "Можно удалять только свои слова" };

  const { error } = await db.from("vocabulary_words").delete().eq("id", wordId);
  if (error) return { error: error.message };

  revalidatePath("/student/[code]", "page");
  return { ok: true };
}

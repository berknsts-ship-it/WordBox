"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ── Create topic + all words in one shot ──────────────────────────────────────

export async function createTopic(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const name = (formData.get("name") as string)?.trim();
  const student_id = (formData.get("student_id") as string) || null;
  if (!name) return { error: "Введи название набора" };

  const { data: newSet, error } = await supabase
    .from("vocabulary_sets")
    .insert({ tutor_id: user.id, name, student_id })
    .select("id")
    .single();

  if (error || !newSet) return { error: error?.message ?? "Ошибка создания" };

  if (student_id) {
    const admin = createAdminClient();
    await admin
      .from("set_assignments")
      .upsert({ set_id: newSet.id, student_id }, { onConflict: "set_id,student_id" });
  }

  // Collect word rows: english_0, russian_0, example_0, sentence_0 …
  const words: {
    set_id: string;
    english: string;
    russian: string;
    example: string | null;
    example_sentence: string | null;
    bracket_sentence: string | null;
    bracket_answer: string | null;
    answer_variants: string[];
  }[] = [];

  let i = 0;
  while (formData.has(`english_${i}`)) {
    const english = (formData.get(`english_${i}`) as string)?.trim();
    const russian = (formData.get(`russian_${i}`) as string)?.trim();
    const example = (formData.get(`example_${i}`) as string)?.trim() || null;
    const example_sentence = (formData.get(`sentence_${i}`) as string)?.trim() || null;
    const bracket_sentence = (formData.get(`bracket_sentence_${i}`) as string)?.trim() || null;
    const bracket_answer = (formData.get(`bracket_answer_${i}`) as string)?.trim() || null;
    if (english && russian) {
      words.push({ set_id: newSet.id, english, russian, example, example_sentence, bracket_sentence, bracket_answer, answer_variants: [] });
    }
    i++;
  }

  if (words.length > 0) {
    await supabase.from("vocabulary_words").insert(words);
  }

  revalidatePath("/tutor/vocabulary");
  redirect(`/tutor/vocabulary/${newSet.id}`);
}

// ── Set list ──────────────────────────────────────────────────────────────────

export async function deleteVocabularySet(id: string) {
  const supabase = await createClient();
  await supabase.from("vocabulary_sets").delete().eq("id", id);
  revalidatePath("/tutor/vocabulary");
}

export async function setVocabularyAssignments(setId: string, studentIds: string[]) {
  const db = createAdminClient();
  const { error: delError } = await db.from("set_assignments").delete().eq("set_id", setId);
  if (delError) return { error: delError.message };
  if (studentIds.length > 0) {
    const { error: insError } = await db
      .from("set_assignments")
      .insert(studentIds.map((sid) => ({ set_id: setId, student_id: sid })));
    if (insError) return { error: insError.message };
  }
  revalidatePath("/tutor/vocabulary");
  revalidatePath(`/tutor/vocabulary/${setId}`);
  return { error: null };
}

// ── Words ─────────────────────────────────────────────────────────────────────

export async function addWord(formData: FormData) {
  const supabase = await createClient();
  const set_id = formData.get("set_id") as string;
  const variantsRaw = (formData.get("answer_variants") as string) || "";
  const answer_variants = variantsRaw.split(",").map((v) => v.trim()).filter(Boolean);

  const { data } = await supabase
    .from("vocabulary_words")
    .insert({
      set_id,
      english: (formData.get("english") as string)?.trim(),
      russian: (formData.get("russian") as string)?.trim(),
      example: (formData.get("example") as string)?.trim() || null,
      example_sentence: (formData.get("example_sentence") as string)?.trim() || null,
      bracket_sentence: (formData.get("bracket_sentence") as string)?.trim() || null,
      bracket_answer: (formData.get("bracket_answer") as string)?.trim() || null,
      answer_variants: answer_variants.length ? answer_variants : [],
    })
    .select("id, english, russian, example, example_sentence, bracket_sentence, bracket_answer, answer_variants")
    .single();

  revalidatePath(`/tutor/vocabulary/${set_id}`);
  return { ok: true, word: data };
}

export async function updateWord(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const set_id = formData.get("set_id") as string;
  const variantsRaw = (formData.get("answer_variants") as string) || "";
  const answer_variants = variantsRaw.split(",").map((v) => v.trim()).filter(Boolean);

  await supabase
    .from("vocabulary_words")
    .update({
      english: (formData.get("english") as string)?.trim(),
      russian: (formData.get("russian") as string)?.trim(),
      example: (formData.get("example") as string)?.trim() || null,
      example_sentence: (formData.get("example_sentence") as string)?.trim() || null,
      bracket_sentence: (formData.get("bracket_sentence") as string)?.trim() || null,
      bracket_answer: (formData.get("bracket_answer") as string)?.trim() || null,
      answer_variants: answer_variants.length ? answer_variants : [],
    })
    .eq("id", id);

  revalidatePath(`/tutor/vocabulary/${set_id}`);
  return { ok: true };
}

export async function deleteWord(id: string, setId: string) {
  const supabase = await createClient();
  await supabase.from("vocabulary_words").delete().eq("id", id);
  revalidatePath(`/tutor/vocabulary/${setId}`);
}

export async function updateTopicName(setId: string, name: string) {
  const supabase = await createClient();
  await supabase.from("vocabulary_sets").update({ name }).eq("id", setId);
  revalidatePath(`/tutor/vocabulary/${setId}`);
  revalidatePath("/tutor/vocabulary");
}

// ── Folders ───────────────────────────────────────────────────────────────────

export async function createFolder(name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };
  const { error } = await supabase
    .from("vocabulary_folders")
    .insert({ tutor_id: user.id, name: name.trim() });
  if (error) return { error: error.message };
  revalidatePath("/tutor/vocabulary");
  return { error: null };
}

export async function deleteFolder(folderId: string) {
  const supabase = await createClient();
  await supabase.from("vocabulary_folders").delete().eq("id", folderId);
  revalidatePath("/tutor/vocabulary");
}

export async function renameFolder(folderId: string, name: string) {
  const supabase = await createClient();
  await supabase.from("vocabulary_folders").update({ name: name.trim() }).eq("id", folderId);
  revalidatePath("/tutor/vocabulary");
}

export async function moveSetToFolder(setId: string, folderId: string | null) {
  const supabase = await createClient();
  await supabase.from("vocabulary_sets").update({ folder_id: folderId }).eq("id", setId);
  revalidatePath("/tutor/vocabulary");
}

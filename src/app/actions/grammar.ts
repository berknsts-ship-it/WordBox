"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type ExerciseType = "bracket" | "mcq" | "true_false" | "fix_error" | "gap_fill";

export type ExerciseInput = {
  type: ExerciseType;
  question: string;
  correct_answer: string;
  options: string[] | null;
  points: number;
  explanation: string | null;
};

export type SetInput = {
  title: string;
  description: string | null;
  exercises: ExerciseInput[];
};

export async function createGrammarSet(input: SetInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };
  if (!input.title.trim()) return { error: "Введите название набора" };
  if (input.exercises.length === 0) return { error: "Добавьте хотя бы одно упражнение" };

  const db = createAdminClient();
  const { data: set, error } = await db.from("grammar_sets").insert({
    tutor_id: user.id,
    title: input.title.trim(),
    description: input.description?.trim() || null,
  }).select("id").single();
  if (error || !set) return { error: error?.message ?? "Не удалось создать набор" };

  const rows = input.exercises.map((ex, i) => ({
    set_id: set.id,
    order_index: i,
    type: ex.type,
    question: ex.question,
    correct_answer: ex.correct_answer,
    options: ex.options,
    points: ex.points,
    explanation: ex.explanation,
  }));
  const { error: exErr } = await db.from("grammar_exercises").insert(rows);
  if (exErr) return { error: exErr.message };

  revalidatePath("/tutor/grammar");
  return { id: set.id as string };
}

export async function updateGrammarSet(setId: string, input: SetInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };
  if (!input.title.trim()) return { error: "Введите название набора" };
  if (input.exercises.length === 0) return { error: "Добавьте хотя бы одно упражнение" };

  const db = createAdminClient();
  const { data: existing } = await db.from("grammar_sets").select("id").eq("id", setId).eq("tutor_id", user.id).single();
  if (!existing) return { error: "Набор не найден" };

  const { error } = await db.from("grammar_sets").update({
    title: input.title.trim(),
    description: input.description?.trim() || null,
  }).eq("id", setId);
  if (error) return { error: error.message };

  // Полная пересборка упражнений — тот же подход, что и у тестов (insertSections).
  await db.from("grammar_exercises").delete().eq("set_id", setId);
  const rows = input.exercises.map((ex, i) => ({
    set_id: setId,
    order_index: i,
    type: ex.type,
    question: ex.question,
    correct_answer: ex.correct_answer,
    options: ex.options,
    points: ex.points,
    explanation: ex.explanation,
  }));
  const { error: exErr } = await db.from("grammar_exercises").insert(rows);
  if (exErr) return { error: exErr.message };

  revalidatePath("/tutor/grammar");
  revalidatePath(`/tutor/grammar/${setId}`);
  return { id: setId };
}

export async function deleteGrammarSet(setId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const db = createAdminClient();
  const { error } = await db.from("grammar_sets").delete().eq("id", setId).eq("tutor_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/tutor/grammar");
}

export async function duplicateGrammarSet(setId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const db = createAdminClient();
  const { data: set } = await db.from("grammar_sets").select("title, description").eq("id", setId).eq("tutor_id", user.id).single();
  if (!set) return { error: "Набор не найден" };

  const { data: exercises } = await db.from("grammar_exercises")
    .select("order_index, type, question, correct_answer, options, points, explanation")
    .eq("set_id", setId)
    .order("order_index");

  const { data: newSet, error } = await db.from("grammar_sets").insert({
    tutor_id: user.id,
    title: `${set.title} (копия)`,
    description: set.description,
  }).select("id").single();
  if (error || !newSet) return { error: error?.message ?? "Не удалось скопировать набор" };

  if (exercises && exercises.length > 0) {
    const rows = exercises.map(ex => ({ ...ex, set_id: newSet.id }));
    const { error: exErr } = await db.from("grammar_exercises").insert(rows);
    if (exErr) return { error: exErr.message };
  }

  revalidatePath("/tutor/grammar");
}

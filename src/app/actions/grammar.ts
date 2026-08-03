"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type ExerciseType = "bracket" | "mcq" | "true_false" | "fix_error" | "gap_fill" | "word_order";

export type ItemInput = {
  question: string;
  correct_answer: string;
  options: string[] | null;
  points: number;
  explanation: string | null;
};

export type ExerciseBlockInput = {
  type: ExerciseType;
  instruction: string | null;
  items: ItemInput[];
};

export type SetInput = {
  title: string;
  description: string | null;
  exercises: ExerciseBlockInput[];
};

async function insertExercises(
  db: ReturnType<typeof createAdminClient>,
  setId: string,
  exercises: ExerciseBlockInput[]
): Promise<{ error?: string }> {
  for (let i = 0; i < exercises.length; i++) {
    const block = exercises[i];
    const { data: ex, error: exErr } = await db.from("grammar_exercises").insert({
      set_id: setId,
      order_index: i,
      type: block.type,
      instruction: block.instruction,
    }).select("id").single();
    if (exErr || !ex) return { error: exErr?.message ?? "Не удалось сохранить упражнение" };

    const rows = block.items.map((item, j) => ({
      exercise_id: ex.id,
      order_index: j,
      question: item.question,
      correct_answer: item.correct_answer,
      options: item.options,
      points: item.points,
      explanation: item.explanation,
    }));
    const { error: itemErr } = await db.from("grammar_exercise_items").insert(rows);
    if (itemErr) return { error: itemErr.message };
  }
  return {};
}

function validateSetInput(input: SetInput): string | null {
  if (!input.title.trim()) return "Введите название набора";
  if (input.exercises.length === 0) return "Добавьте хотя бы одно упражнение";
  for (const block of input.exercises) {
    if (block.items.length === 0) return "В каждом упражнении должен быть хотя бы один пункт";
    for (const item of block.items) {
      if (!item.question.trim()) return "У каждого пункта должен быть текст вопроса";
      if (!item.correct_answer.trim()) return "У каждого пункта должен быть правильный ответ";
    }
  }
  return null;
}

export async function createGrammarSet(input: SetInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };
  const validationError = validateSetInput(input);
  if (validationError) return { error: validationError };

  const db = createAdminClient();
  const { data: set, error } = await db.from("grammar_sets").insert({
    tutor_id: user.id,
    title: input.title.trim(),
    description: input.description?.trim() || null,
  }).select("id").single();
  if (error || !set) return { error: error?.message ?? "Не удалось создать набор" };

  const { error: insertErr } = await insertExercises(db, set.id, input.exercises);
  if (insertErr) return { error: insertErr };

  revalidatePath("/tutor/grammar");
  return { id: set.id as string };
}

export async function updateGrammarSet(setId: string, input: SetInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };
  const validationError = validateSetInput(input);
  if (validationError) return { error: validationError };

  const db = createAdminClient();
  const { data: existing } = await db.from("grammar_sets").select("id").eq("id", setId).eq("tutor_id", user.id).single();
  if (!existing) return { error: "Набор не найден" };

  const { error } = await db.from("grammar_sets").update({
    title: input.title.trim(),
    description: input.description?.trim() || null,
  }).eq("id", setId);
  if (error) return { error: error.message };

  // Полная пересборка (как у tests/insertSections) — проще и надёжнее частичного diff.
  // grammar_exercise_items удалятся каскадно вместе с grammar_exercises.
  await db.from("grammar_exercises").delete().eq("set_id", setId);
  const { error: insertErr } = await insertExercises(db, setId, input.exercises);
  if (insertErr) return { error: insertErr };

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
    .select("id, order_index, type, instruction, grammar_exercise_items(order_index, question, correct_answer, options, points, explanation)")
    .eq("set_id", setId)
    .order("order_index");

  const { data: newSet, error } = await db.from("grammar_sets").insert({
    tutor_id: user.id,
    title: `${set.title} (копия)`,
    description: set.description,
  }).select("id").single();
  if (error || !newSet) return { error: error?.message ?? "Не удалось скопировать набор" };

  type Row = { order_index: number; type: ExerciseType; instruction: string | null; grammar_exercise_items: ItemInput[] };
  const blocks: ExerciseBlockInput[] = ((exercises ?? []) as unknown as Row[]).map(ex => ({
    type: ex.type,
    instruction: ex.instruction,
    items: (ex.grammar_exercise_items ?? []).map(it => ({
      question: it.question, correct_answer: it.correct_answer, options: it.options, points: it.points, explanation: it.explanation,
    })),
  }));

  const { error: insertErr } = await insertExercises(db, newSet.id, blocks);
  if (insertErr) return { error: insertErr };

  revalidatePath("/tutor/grammar");
}

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

// Назначение набора ученикам. Не удаляет назначения, по которым уже есть
// прогресс (in_progress/completed) даже если галочку сняли — иначе можно
// случайно стереть работу ученика. Убрать можно только не начатое.
export async function setGrammarAssignments(setId: string, studentIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const db = createAdminClient();
  const { data: existing } = await db.from("grammar_assignments").select("student_id, status").eq("set_id", setId);
  const existingIds = new Set((existing ?? []).map(a => a.student_id));

  const toAdd = studentIds.filter(id => !existingIds.has(id));
  const toRemove = (existing ?? []).filter(a => !studentIds.includes(a.student_id) && a.status === "not_started").map(a => a.student_id);

  if (toAdd.length > 0) {
    const { error } = await db.from("grammar_assignments").insert(
      toAdd.map(student_id => ({ set_id: setId, student_id }))
    );
    if (error) return { error: error.message };
  }
  if (toRemove.length > 0) {
    const { error } = await db.from("grammar_assignments").delete().eq("set_id", setId).in("student_id", toRemove);
    if (error) return { error: error.message };
  }

  revalidatePath("/tutor/grammar");
  return {};
}

// ── Ученик: прохождение (нет Supabase Auth сессии — как везде у студентов,
// доверяем studentId/assignmentId, переданным со страницы по коду доступа) ──

export async function saveGrammarProgress(assignmentId: string, answers: Record<string, string>) {
  const db = createAdminClient();
  const { error } = await db.from("grammar_assignments")
    .update({ answers, status: "in_progress", updated_at: new Date().toISOString() })
    .eq("id", assignmentId)
    .neq("status", "completed"); // не перезаписываем уже сданную работу
  if (error) return { error: error.message };
  return {};
}

export type GrammarItemResult = { correct: boolean; correct_answer: string; explanation: string | null; points: number };

// Проверка целиком на сервере — правильные ответы/разбор не должны попадать
// клиенту до сдачи работы (иначе видно в Network до окончания прохождения).
export async function submitGrammarAttempt(assignmentId: string, answers: Record<string, string>) {
  const db = createAdminClient();
  const { data: assignment } = await db.from("grammar_assignments").select("set_id").eq("id", assignmentId).single();
  if (!assignment) return { error: "Назначение не найдено" };

  const { data: exercises } = await db.from("grammar_exercises")
    .select("type, grammar_exercise_items(id, correct_answer, points, explanation)")
    .eq("set_id", assignment.set_id);

  const { isGrammarAnswerCorrect } = await import("@/lib/grammar/checkAnswer");

  let score = 0;
  let maxScore = 0;
  const results: Record<string, GrammarItemResult> = {};
  type Row = { type: ExerciseType; grammar_exercise_items: { id: string; correct_answer: string; points: number; explanation: string | null }[] };
  for (const ex of (exercises ?? []) as unknown as Row[]) {
    for (const item of ex.grammar_exercise_items) {
      maxScore += item.points;
      const correct = isGrammarAnswerCorrect(ex.type, answers[item.id], item.correct_answer);
      if (correct) score += item.points;
      results[item.id] = { correct, correct_answer: item.correct_answer, explanation: item.explanation, points: item.points };
    }
  }

  const { error } = await db.from("grammar_assignments")
    .update({ answers, status: "completed", score, max_score: maxScore, updated_at: new Date().toISOString() })
    .eq("id", assignmentId);
  if (error) return { error: error.message };

  return { score, maxScore, results };
}

export type GrammarBoardCheckResult = { correct: boolean; correct_answer: string; explanation: string | null };

// Проверка упражнения, вынесенного на доску. Как и submitGrammarAttempt —
// correct_answer/explanation вычисляются и возвращаются только по явному
// запросу проверки, никогда не хранятся в самом элементе доски (boards.data
// видят оба участника комнаты, включая ученика без сессии).
export async function checkGrammarBoardItems(itemIds: string[], answers: Record<string, string>) {
  if (itemIds.length === 0) return { results: {} as Record<string, GrammarBoardCheckResult> };
  const db = createAdminClient();
  const { data: items, error } = await db
    .from("grammar_exercise_items")
    .select("id, correct_answer, explanation, grammar_exercises!inner(type)")
    .in("id", itemIds);
  if (error || !items) return { error: "Не удалось проверить" };

  const { isGrammarAnswerCorrect } = await import("@/lib/grammar/checkAnswer");
  type Row = { id: string; correct_answer: string; explanation: string | null; grammar_exercises: { type: ExerciseType } | { type: ExerciseType }[] };
  const results: Record<string, GrammarBoardCheckResult> = {};
  for (const it of items as unknown as Row[]) {
    const type = Array.isArray(it.grammar_exercises) ? it.grammar_exercises[0].type : it.grammar_exercises.type;
    results[it.id] = {
      correct: isGrammarAnswerCorrect(type, answers[it.id], it.correct_answer),
      correct_answer: it.correct_answer,
      explanation: it.explanation,
    };
  }
  return { results };
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

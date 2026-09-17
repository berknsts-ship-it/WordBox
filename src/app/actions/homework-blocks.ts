"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { notifyStudent } from "@/lib/notifications/send";

export type HomeworkBlockType = "instruction" | "word_bank" | "image_answer" | "auto_question" | "free_question";
export type AutoQuestionType = "mcq" | "gap_fill" | "true_false" | "bracket" | "word_order";

export type HomeworkItemInput = {
  image_url: string | null;
  question: string | null;
  auto_type: AutoQuestionType | null;
  options: string[] | null;
  correct_answer: string | null;
  points: number;
};

export type HomeworkBlockInput = {
  type: HomeworkBlockType;
  instruction: string | null;
  words: string[] | null;
  items: HomeworkItemInput[];
};

export type InteractiveHomeworkInput = {
  student_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  blocks: HomeworkBlockInput[];
};

function validate(input: InteractiveHomeworkInput): string | null {
  if (!input.student_id) return "Выбери ученика";
  if (!input.title.trim()) return "Введи название задания";
  if (input.blocks.length === 0) return "Добавь хотя бы один блок";

  for (const block of input.blocks) {
    if (block.type === "instruction" && !(block.instruction ?? "").trim()) {
      return "В блоке «Инструкция» должен быть текст";
    }
    if (block.type === "word_bank" && (!block.words || block.words.length === 0)) {
      return "В блоке «Банк слов» должно быть хотя бы одно слово";
    }
    if (block.type === "image_answer") {
      if (block.items.length === 0) return "В блоке «Картинка + ответ» должна быть хотя бы одна картинка";
      for (const item of block.items) {
        if (!item.image_url) return "Загрузи картинку в каждом пункте блока «Картинка + ответ»";
      }
    }
    if (block.type === "auto_question") {
      if (block.items.length === 0) return "В блоке «Вопрос с автопроверкой» должен быть хотя бы один пункт";
      for (const item of block.items) {
        if (!item.question?.trim()) return "У каждого автовопроса должен быть текст вопроса";
        if (!item.correct_answer?.trim()) return "У каждого автовопроса должен быть правильный ответ";
      }
    }
    if (block.type === "free_question") {
      if (block.items.length === 0) return "В блоке «Свободный вопрос» должен быть текст вопроса";
      for (const item of block.items) {
        if (!item.question?.trim()) return "У свободного вопроса должен быть текст";
      }
    }
  }
  return null;
}

export async function createInteractiveHomework(input: InteractiveHomeworkInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const validationError = validate(input);
  if (validationError) return { error: validationError };

  const db = createAdminClient();

  const { data: hw, error: hwErr } = await db.from("homework").insert({
    student_id: input.student_id,
    tutor_id: user.id,
    title: input.title,
    description: input.description,
    due_date: input.due_date,
    status: "pending",
  }).select("id").single();
  if (hwErr || !hw) return { error: hwErr?.message ?? "Не удалось создать задание" };

  for (let i = 0; i < input.blocks.length; i++) {
    const block = input.blocks[i];
    const { data: b, error: bErr } = await db.from("homework_blocks").insert({
      homework_id: hw.id,
      order_index: i,
      type: block.type,
      instruction: block.instruction,
      words: block.words,
    }).select("id").single();
    if (bErr || !b) return { error: bErr?.message ?? "Не удалось сохранить блок" };

    if (block.items.length > 0) {
      const rows = block.items.map((item, j) => ({
        block_id: b.id,
        order_index: j,
        image_url: item.image_url,
        question: item.question,
        auto_type: item.auto_type,
        options: item.options,
        correct_answer: item.correct_answer,
        points: item.points,
      }));
      const { error: itemErr } = await db.from("homework_block_items").insert(rows);
      if (itemErr) return { error: itemErr.message };
    }
  }

  notifyStudent(input.student_id, {
    title: "Новое домашнее задание",
    body: input.due_date
      ? `«${input.title}» — сдать до ${new Date(input.due_date).toLocaleDateString("ru", { day: "numeric", month: "long" })}`
      : `«${input.title}»`,
    action_url: "/student",
    type: "homework-new",
    emoji: "📝",
  }).catch(() => {});

  revalidatePath(`/tutor/students/${input.student_id}`);
  revalidatePath("/tutor/homework");
  return { ok: true, id: hw.id };
}

// ── Этап 2: выполнение учеником ─────────────────────────────────────────────
// Ученик не аутентифицирован через Supabase Auth (заходит по коду доступа),
// поэтому и черновик, и статус пишем через createAdminClient() — как в
// saveAttempt/submitTest для обычных тестов.

export async function saveHomeworkAttempt(homeworkId: string, studentId: string, answers: Record<string, string>) {
  const db = createAdminClient();
  const { error } = await db.from("homework_attempts").upsert(
    { homework_id: homeworkId, student_id: studentId, answers, status: "in_progress", updated_at: new Date().toISOString() },
    { onConflict: "homework_id" }
  );
  if (error) return { error: error.message };
  return { ok: true };
}

export async function submitHomeworkAttempt(homeworkId: string, studentId: string, answers: Record<string, string>) {
  const db = createAdminClient();
  const { error: attErr } = await db.from("homework_attempts").upsert(
    { homework_id: homeworkId, student_id: studentId, answers, status: "submitted", updated_at: new Date().toISOString() },
    { onConflict: "homework_id" }
  );
  if (attErr) return { error: attErr.message };

  const { error: hwErr } = await db.from("homework").update({ status: "submitted" }).eq("id", homeworkId).eq("student_id", studentId);
  if (hwErr) return { error: hwErr.message };

  revalidatePath("/tutor/homework");
  return { ok: true };
}

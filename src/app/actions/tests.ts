"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// ── Types ────────────────────────────────────────────────────────────────────

export type QType = "mcq" | "true_false" | "fill_in" | "match" | "gap_fill" | "writing";

type QuestionInput = {
  type: QType;
  prompt: string;
  options: Record<string, unknown> | null;
  correct_answer: Record<string, unknown> | null;
  points: number;
};

type TaskInput = {
  order_index: number;
  title: string | null;
  instruction: string | null;
  questions: QuestionInput[];
};

type SectionInput = {
  type: "listening" | "reading" | "vocabulary" | "writing";
  order_index: number;
  media_type?: string | null;
  media_url?: string | null;
  media_file_path?: string | null;
  max_plays?: number;
  hide_subtitles?: boolean;
  tasks: TaskInput[];
};

export type TestInput = {
  title: string;
  student_id: string | null;
  time_limit_min: number | null;
  issued_at: string | null;
  score_5: number | null;
  score_4: number | null;
  score_3: number | null;
  sections: SectionInput[];
};

// ── Tutor actions ─────────────────────────────────────────────────────────────

export async function createTest(input: TestInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const { data: test, error: testErr } = await supabase.from("tests").insert({
    tutor_id: user.id,
    student_id: input.student_id || null,
    title: input.title,
    time_limit_min: input.time_limit_min,
    issued_at: input.issued_at || null,
    score_5: input.score_5,
    score_4: input.score_4,
    score_3: input.score_3,
    status: "draft",
  }).select("id").single();

  if (testErr || !test) return { error: testErr?.message ?? "Ошибка создания" };

  for (const section of input.sections) {
    const { data: sec } = await supabase.from("test_sections").insert({
      test_id: test.id,
      type: section.type,
      order_index: section.order_index,
      media_type: section.media_type ?? null,
      media_url: section.media_url ?? null,
      media_file_path: section.media_file_path ?? null,
      max_plays: section.max_plays ?? 2,
      hide_subtitles: section.hide_subtitles ?? false,
    }).select("id").single();

    if (!sec) continue;

    for (const task of section.tasks) {
      const { data: t } = await supabase.from("test_tasks").insert({
        section_id: sec.id,
        order_index: task.order_index,
        title: task.title,
        instruction: task.instruction,
      }).select("id").single();

      if (!t || task.questions.length === 0) continue;

      await supabase.from("test_questions").insert(
        task.questions.map((q, i) => ({
          task_id: t.id,
          order_index: i,
          type: q.type,
          prompt: q.prompt,
          options: q.options,
          correct_answer: q.correct_answer,
          points: q.points,
        }))
      );
    }
  }

  revalidatePath("/tutor/tests");
  return { id: test.id };
}

export async function issueTest(testId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tests")
    .update({ status: "issued" })
    .eq("id", testId);
  if (error) return { error: error.message };
  revalidatePath("/tutor/tests");
  revalidatePath(`/tutor/tests/${testId}`);
}

export async function retractTest(testId: string) {
  const supabase = await createClient();
  await supabase.from("tests").update({ status: "draft" }).eq("id", testId);
  revalidatePath("/tutor/tests");
  revalidatePath(`/tutor/tests/${testId}`);
}

export async function deleteTest(testId: string) {
  const supabase = await createClient();
  await supabase.from("tests").delete().eq("id", testId);
  revalidatePath("/tutor/tests");
}

// Assigns a test to one or more students. If the test itself has no
// assignee yet, the first newly-selected student takes over this test
// row directly; everyone else gets an independent copy (same sections/
// tasks/questions, own submission/grade state) — a test's progress
// fields (status, answers, score) are per test row, so sharing one row
// across several students isn't possible, only duplicating the content is.
export async function assignTestToStudents(testId: string, studentIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const { data: test } = await supabase
    .from("tests")
    .select("*")
    .eq("id", testId)
    .eq("tutor_id", user.id)
    .single();
  if (!test) return { error: "Тест не найден" };

  let remaining = studentIds.filter((id) => id !== test.student_id);

  if (!test.student_id && remaining.length > 0) {
    const [first, ...rest] = remaining;
    await supabase.from("tests").update({ student_id: first }).eq("id", testId);
    remaining = rest;
  }

  if (remaining.length === 0) {
    revalidatePath("/tutor/tests");
    revalidatePath(`/tutor/tests/${testId}`);
    return { created: 0 };
  }

  const { data: sections } = await supabase
    .from("test_sections")
    .select("*")
    .eq("test_id", testId)
    .order("order_index");

  const sectionIds = (sections ?? []).map((s) => s.id);
  const { data: tasks } = sectionIds.length > 0
    ? await supabase.from("test_tasks").select("*").in("section_id", sectionIds)
    : { data: [] as { id: string; section_id: string; order_index: number; title: string | null; instruction: string | null }[] };

  const taskIds = (tasks ?? []).map((t) => t.id);
  const { data: questions } = taskIds.length > 0
    ? await supabase.from("test_questions").select("*").in("task_id", taskIds)
    : { data: [] as { task_id: string; order_index: number; type: string; prompt: string | null; options: Record<string, unknown> | null; correct_answer: Record<string, unknown> | null; points: number }[] };

  let created = 0;
  for (const studentId of remaining) {
    const { data: newTest, error: newTestErr } = await supabase
      .from("tests")
      .insert({
        tutor_id: user.id,
        student_id: studentId,
        title: test.title,
        time_limit_min: test.time_limit_min,
        issued_at: test.issued_at,
        score_5: test.score_5,
        score_4: test.score_4,
        score_3: test.score_3,
        status: "draft",
      })
      .select("id")
      .single();
    if (newTestErr || !newTest) continue;

    for (const sec of sections ?? []) {
      const { data: newSec } = await supabase
        .from("test_sections")
        .insert({
          test_id: newTest.id,
          type: sec.type,
          order_index: sec.order_index,
          media_type: sec.media_type,
          media_url: sec.media_url,
          media_file_path: sec.media_file_path,
          max_plays: sec.max_plays,
          hide_subtitles: sec.hide_subtitles,
        })
        .select("id")
        .single();
      if (!newSec) continue;

      const secTasks = (tasks ?? []).filter((t) => t.section_id === sec.id);
      for (const task of secTasks) {
        const { data: newTask } = await supabase
          .from("test_tasks")
          .insert({
            section_id: newSec.id,
            order_index: task.order_index,
            title: task.title,
            instruction: task.instruction,
          })
          .select("id")
          .single();
        if (!newTask) continue;

        const taskQuestions = (questions ?? []).filter((q) => q.task_id === task.id);
        if (taskQuestions.length > 0) {
          await supabase.from("test_questions").insert(
            taskQuestions.map((q) => ({
              task_id: newTask.id,
              order_index: q.order_index,
              type: q.type,
              prompt: q.prompt,
              options: q.options,
              correct_answer: q.correct_answer,
              points: q.points,
            }))
          );
        }
      }
    }
    created++;
  }

  revalidatePath("/tutor/tests");
  revalidatePath(`/tutor/tests/${testId}`);
  return { created };
}

export async function gradeWriting(
  testId: string,
  questionId: string | null,
  score: number,
  comment: string
) {
  const supabase = await createClient();

  if (questionId) {
    await supabase.from("test_answers")
      .update({ manual_score: score, tutor_comment: comment })
      .eq("test_id", testId)
      .eq("question_id", questionId);
  }

  // Recalculate totals
  const [{ data: answers }, { data: test }] = await Promise.all([
    supabase.from("test_answers").select("auto_score, manual_score").eq("test_id", testId),
    supabase.from("tests").select("auto_score, score_5, score_4, score_3").eq("id", testId).single(),
  ]);

  if (answers && test) {
    const manualTotal = answers.reduce((s, a) => s + (a.manual_score ?? 0), 0);
    const total = (test.auto_score ?? 0) + manualTotal;
    const grade = computeGrade(total, test.score_5, test.score_4, test.score_3);

    const totalPossible = await totalPossiblePoints(supabase, testId);
    const stars = computeStars(total, totalPossible);

    await supabase.from("tests").update({
      manual_score: manualTotal,
      writing_comment: comment,
      grade,
      stars,
      status: "graded",
    }).eq("id", testId);
  }

  revalidatePath(`/tutor/tests/${testId}/grade`);
  revalidatePath("/tutor/tests");
}

// ── Student actions ────────────────────────────────────────────────────────────

export async function startTest(testId: string, studentId: string) {
  const db = createAdminClient();
  const { error } = await db.from("tests").update({
    status: "in_progress",
    started_at: new Date().toISOString(),
  }).eq("id", testId).eq("student_id", studentId).eq("status", "issued");
  if (error) return { error: error.message };
}

export async function incrementPlayCount(testId: string) {
  const db = createAdminClient();
  const { data } = await db.from("tests").select("play_count").eq("id", testId).single();
  await db.from("tests").update({ play_count: (data?.play_count ?? 0) + 1 }).eq("id", testId);
}

type AnswerPayload = {
  questionId: string;
  answer: Record<string, unknown>;
};

export async function submitTest(testId: string, studentId: string, answers: AnswerPayload[]) {
  const db = createAdminClient();

  const questionIds = answers.map(a => a.questionId);
  const { data: questions } = await db.from("test_questions")
    .select("id, type, correct_answer, points")
    .in("id", questionIds);

  if (!questions) return { error: "Ошибка загрузки вопросов" };

  const answerRows = answers.map(a => {
    const q = questions.find(q => q.id === a.questionId);
    if (!q) return null;

    if (q.type === "writing") {
      return { test_id: testId, question_id: a.questionId, answer: a.answer, is_correct: null, auto_score: 0 };
    }

    const ca = q.correct_answer as Record<string, unknown> | null;
    let is_correct = false;
    let auto_score = 0;

    if (ca) {
      if (q.type === "mcq" || q.type === "true_false") {
        is_correct = String(a.answer?.answer ?? "").toLowerCase() === String(ca.answer ?? "").toLowerCase();
        auto_score = is_correct ? q.points : 0;
      } else if (q.type === "fill_in") {
        is_correct = String(a.answer?.answer ?? "").trim().toLowerCase() === String(ca.answer ?? "").trim().toLowerCase();
        auto_score = is_correct ? q.points : 0;
      } else if (q.type === "match") {
        const correct = ca.matches as number[];
        const student = a.answer?.matches as number[] | undefined ?? [];
        const ok = correct.filter((v, i) => v === student[i]).length;
        auto_score = correct.length > 0 ? Math.round((ok / correct.length) * q.points) : 0;
        is_correct = ok === correct.length;
      } else if (q.type === "gap_fill") {
        const correct = ca.gaps as string[];
        const student = a.answer?.gaps as string[] | undefined ?? [];
        const ok = correct.filter((v, i) => v.trim().toLowerCase() === (student[i] ?? "").trim().toLowerCase()).length;
        auto_score = correct.length > 0 ? Math.round((ok / correct.length) * q.points) : 0;
        is_correct = ok === correct.length;
      }
    }

    return { test_id: testId, question_id: a.questionId, answer: a.answer, is_correct, auto_score };
  }).filter(Boolean) as { test_id: string; question_id: string; answer: Record<string, unknown>; is_correct: boolean | null; auto_score: number }[];

  await db.from("test_answers").delete().eq("test_id", testId);
  if (answerRows.length > 0) await db.from("test_answers").insert(answerRows);

  const autoScore = answerRows.reduce((s, a) => s + (a.auto_score ?? 0), 0);

  const { data: secs } = await db.from("test_sections").select("id, type").eq("test_id", testId);
  const hasWriting = secs?.some(s => s.type === "writing") ?? false;

  const totalPossible = await totalPossiblePoints(db, testId);

  const { data: test } = await db.from("tests")
    .select("score_5, score_4, score_3")
    .eq("id", testId).single();

  const grade = !hasWriting && test ? computeGrade(autoScore, test.score_5, test.score_4, test.score_3) : null;
  const stars = !hasWriting ? computeStars(autoScore, totalPossible) : null;

  await db.from("tests").update({
    status: hasWriting ? "submitted" : "graded",
    submitted_at: new Date().toISOString(),
    auto_score: autoScore,
    ...(grade !== null ? { grade } : {}),
    ...(stars !== null ? { stars } : {}),
  }).eq("id", testId);

  return { autoScore, hasWriting, stars: stars ?? undefined, grade: grade ?? undefined };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function totalPossiblePoints(db: any, testId: string): Promise<number> {
  const { data: secs } = await db.from("test_sections").select("id").eq("test_id", testId);
  if (!secs?.length) return 0;
  const { data: tasks } = await db.from("test_tasks").select("id").in("section_id", secs.map((s: { id: string }) => s.id));
  if (!tasks?.length) return 0;
  const { data: qs } = await db.from("test_questions").select("points").in("task_id", tasks.map((t: { id: string }) => t.id));
  return (qs ?? []).reduce((s: number, q: { points: number }) => s + (q.points ?? 0), 0);
}

function computeStars(score: number, totalPossible: number): number {
  if (totalPossible <= 0) return 1;
  const pct = (score / totalPossible) * 100;
  if (pct >= 90) return 5;
  if (pct >= 75) return 4;
  if (pct >= 60) return 3;
  if (pct >= 45) return 2;
  return 1;
}

function computeGrade(
  total: number,
  s5: number | null,
  s4: number | null,
  s3: number | null
): number {
  if (s5 !== null && total >= s5) return 5;
  if (s4 !== null && total >= s4) return 4;
  if (s3 !== null && total >= s3) return 3;
  return 2;
}

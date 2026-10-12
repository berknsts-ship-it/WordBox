import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import GradeForm, { type WritingItem } from "./GradeForm";

export default async function GradePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: test } = await supabase
    .from("tests")
    .select("id, title, status, auto_score, score_5, score_4, score_3, students(name)")
    .eq("id", id)
    .eq("tutor_id", user.id)
    .single();

  if (!test) notFound();

  // Every "writing" question anywhere in the test — not just a dedicated
  // "Письмо" section — since a sentence-construction exercise can sit
  // inside an otherwise auto-graded vocabulary/grammar section.
  const { data: sections } = await supabase
    .from("test_sections")
    .select("test_tasks(title, order_index, test_questions(id, prompt, points, correct_answer, order_index, type))")
    .eq("test_id", id);

  type QuestionRow = { id: string; prompt: string | null; points: number; correct_answer: Record<string, unknown> | null; order_index: number; type: string };
  type TaskRow = { title: string | null; order_index: number; test_questions: QuestionRow[] };
  type SectionRow = { test_tasks: TaskRow[] };

  const writingQuestions = ((sections ?? []) as unknown as SectionRow[])
    .flatMap(s => s.test_tasks ?? [])
    .sort((a, b) => a.order_index - b.order_index)
    .flatMap(t => t.test_questions.filter(q => q.type === "writing").sort((a, b) => a.order_index - b.order_index)
      .map(q => ({ ...q, taskTitle: t.title })));

  const questionIds = writingQuestions.map(q => q.id);
  const { data: writingAnswers } = questionIds.length
    ? await supabase.from("test_answers").select("question_id, answer, manual_score, tutor_comment").eq("test_id", id).in("question_id", questionIds)
    : { data: [] };

  const items: WritingItem[] = writingQuestions.map(q => {
    const ans = (writingAnswers ?? []).find(a => a.question_id === q.id);
    return {
      questionId: q.id,
      taskTitle: q.taskTitle,
      prompt: q.prompt ?? "",
      maxPoints: q.points,
      expectedAnswer: (q.correct_answer as { answer?: string } | null)?.answer ?? null,
      studentText: (ans?.answer as { text?: string; answer?: string } | null)?.text
        ?? (ans?.answer as { text?: string; answer?: string } | null)?.answer
        ?? "",
      initialScore: ans?.manual_score ?? 0,
      initialComment: ans?.tutor_comment ?? "",
    };
  });

  const student = (test.students as unknown) as { name: string } | null;

  return (
    <div className="max-w-2xl">
      <Link href={`/tutor/tests/${id}`}
        className="flex items-center gap-1 text-sm mb-5 hover:opacity-70 transition-all"
        style={{ color: "var(--brown-mid)" }}>
        <ChevronLeft size={16} /> К тесту
      </Link>

      <h1 className="text-xl font-bold mb-1" style={{ color: "var(--brown-dark)" }}>
        Проверка письменной части
      </h1>
      {student && (
        <p className="text-sm mb-6" style={{ color: "var(--brown-light)" }}>{student.name} · {test.title}</p>
      )}

      {items.length === 0 ? (
        <div className="rounded-2xl border p-8 text-center"
          style={{ background: "white", borderColor: "var(--brown-pale)" }}>
          <p style={{ color: "var(--brown-light)" }}>В этом тесте нет вопросов для ручной проверки</p>
        </div>
      ) : (
        <GradeForm
          testId={id}
          items={items}
          autoScore={test.auto_score ?? 0}
          score5={test.score_5}
          score4={test.score_4}
          score3={test.score_3}
        />
      )}
    </div>
  );
}

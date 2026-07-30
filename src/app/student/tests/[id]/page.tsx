import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import TestTaker from "./TestTaker";

export default async function StudentTestPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { id } = await params;
  const { code } = await searchParams;

  const db = createAdminClient();

  // Verify student via access code
  const { data: student } = code
    ? await db.from("students").select("id, name, theme").eq("access_code", code).single()
    : { data: null };

  if (!student) notFound();

  const { data: test } = await db
    .from("tests")
    .select("id, title, status, time_limit_min, play_count, started_at")
    .eq("id", id)
    .eq("student_id", student.id)
    .single();

  if (!test || !["issued", "in_progress"].includes(test.status)) notFound();

  const { data: sections } = await db
    .from("test_sections")
    .select("*, test_tasks(id, order_index, title, instruction, test_questions(id, type, prompt, options, points, order_index))")
    .eq("test_id", id)
    .order("order_index");

  // Sort tasks and their questions server-side so TestTaker can render as-is
  type QuestionRow = { id: string; type: string; prompt: string | null; options: Record<string, unknown> | null; points: number; order_index: number };
  type TaskRow = { id: string; order_index: number; title: string | null; instruction: string | null; test_questions: QuestionRow[] };
  const sortedSections = (sections ?? []).map(s => ({
    ...s,
    test_tasks: ((s.test_tasks as TaskRow[]) ?? [])
      .map(t => ({ ...t, test_questions: [...t.test_questions].sort((a, b) => a.order_index - b.order_index) }))
      .sort((a, b) => a.order_index - b.order_index),
  }));

  // Resume from the last autosaved draft, if any
  const { data: attempt } = await db
    .from("test_attempts")
    .select("answers")
    .eq("test_id", id)
    .maybeSingle();

  return (
    <TestTaker
      test={test}
      sections={sortedSections}
      studentId={student.id}
      studentCode={code ?? ""}
      initialAnswers={(attempt?.answers as Record<string, Record<string, unknown>>) ?? {}}
      themeId={student.theme ?? "default"}
    />
  );
}

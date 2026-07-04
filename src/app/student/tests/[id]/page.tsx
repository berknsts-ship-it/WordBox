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
    ? await db.from("students").select("id, name").eq("access_code", code).single()
    : { data: null };

  if (!student) notFound();

  const { data: test } = await db
    .from("tests")
    .select("id, title, status, time_limit_min, play_count, max_plays, started_at")
    .eq("id", id)
    .eq("student_id", student.id)
    .single();

  if (!test || !["issued", "in_progress"].includes(test.status)) notFound();

  const { data: sections } = await db
    .from("test_sections")
    .select("*, test_questions(id, type, prompt, options, points, order_index)")
    .eq("test_id", id)
    .order("order_index");

  // Get existing answers if resuming
  const { data: existingAnswers } = await db
    .from("test_answers")
    .select("question_id, answer")
    .eq("test_id", id);

  return (
    <TestTaker
      test={test}
      sections={sections ?? []}
      studentId={student.id}
      studentCode={code ?? ""}
      existingAnswers={existingAnswers ?? []}
    />
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import GradeForm from "./GradeForm";

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

  // Get writing section + question
  const { data: writingSection } = await supabase
    .from("test_sections")
    .select("id, test_questions(id, prompt, points)")
    .eq("test_id", id)
    .eq("type", "writing")
    .single();

  const writingQ = writingSection
    ? (writingSection.test_questions as { id: string; prompt: string | null; points: number }[])?.[0]
    : null;

  // Get student's writing answer
  const { data: writingAnswer } = writingQ
    ? await supabase
        .from("test_answers")
        .select("id, answer, manual_score, tutor_comment")
        .eq("test_id", id)
        .eq("question_id", writingQ.id)
        .single()
    : { data: null };

  const student = test.students as { name: string } | null;

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

      {!writingQ ? (
        <div className="rounded-2xl border p-8 text-center"
          style={{ background: "white", borderColor: "var(--brown-pale)" }}>
          <p style={{ color: "var(--brown-light)" }}>В этом тесте нет раздела «Письмо»</p>
        </div>
      ) : (
        <GradeForm
          testId={id}
          questionId={writingQ.id}
          prompt={writingQ.prompt ?? ""}
          maxPoints={writingQ.points}
          autoScore={test.auto_score ?? 0}
          studentText={(writingAnswer?.answer as { text: string } | null)?.text ?? ""}
          initialScore={writingAnswer?.manual_score ?? 0}
          initialComment={writingAnswer?.tutor_comment ?? ""}
          score5={test.score_5}
          score4={test.score_4}
          score3={test.score_3}
        />
      )}
    </div>
  );
}

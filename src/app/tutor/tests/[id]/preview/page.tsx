import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import TestPreview, { type PreviewSection } from "./TestPreview";

export default async function TestPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: test } = await supabase
    .from("tests")
    .select("id, title, time_limit_min")
    .eq("id", id)
    .eq("tutor_id", user.id)
    .single();
  if (!test) notFound();

  // test_questions(*) includes correct_answer — fine here, this is the
  // tutor's own test, the same privacy boundary that hides it from the
  // student-facing fetch (src/app/student/tests/[id]/page.tsx) doesn't apply.
  const { data: sections } = await supabase
    .from("test_sections")
    .select("*, test_tasks(*, test_questions(*))")
    .eq("test_id", id)
    .order("order_index");

  type QuestionRow = {
    id: string; type: string; prompt: string | null; order_index: number; points: number;
    options: Record<string, unknown> | null; correct_answer: Record<string, unknown> | null;
  };
  type TaskRow = { id: string; order_index: number; title: string | null; instruction: string | null; test_questions: QuestionRow[] };
  type SectionRow = { id: string; type: string; media_type: string | null; media_url: string | null; test_tasks: TaskRow[] };

  const sectionsWithTasks: PreviewSection[] = ((sections ?? []) as unknown as SectionRow[]).map(s => ({
    id: s.id, type: s.type, media_type: s.media_type, media_url: s.media_url,
    tasksSorted: [...(s.test_tasks ?? [])]
      .sort((a, b) => a.order_index - b.order_index)
      .map(t => ({
        id: t.id, order_index: t.order_index, title: t.title, instruction: t.instruction,
        questionsSorted: [...(t.test_questions ?? [])].sort((a, b) => a.order_index - b.order_index),
      })),
  }));

  return (
    <div>
      <Link href={`/tutor/tests/${id}`}
        className="flex items-center gap-1 text-sm mb-5 hover:opacity-70 transition-all"
        style={{ color: "var(--brown-mid)" }}>
        <ChevronLeft size={16} /> {test.title}
      </Link>
      <div className="mb-5 px-4 py-2.5 rounded-xl text-xs font-medium" style={{ background: "#fff3cc", color: "#8a6200" }}>
        Это предпросмотр для тебя как репетитора — ответы нигде не сохраняются и ученику не видны. Можно пройти сколько угодно раз.
      </div>
      <TestPreview title={test.title} sections={sectionsWithTasks} />
    </div>
  );
}

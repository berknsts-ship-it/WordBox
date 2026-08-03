import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import GrammarSetEditor from "../GrammarSetEditor";
import type { ExerciseType } from "@/app/actions/grammar";

export default async function EditGrammarSetPage({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();
  const { data: set } = await db
    .from("grammar_sets")
    .select("id, title, description")
    .eq("id", setId)
    .eq("tutor_id", user.id)
    .single();

  if (!set) redirect("/tutor/grammar");

  const { data: exercises } = await db
    .from("grammar_exercises")
    .select("id, order_index, type, question, correct_answer, options, points, explanation")
    .eq("set_id", setId)
    .order("order_index");

  const initial = {
    title: set.title,
    description: set.description ?? "",
    exercises: (exercises ?? []).map(ex => ({
      _id: ex.id as string,
      type: ex.type as ExerciseType,
      question: ex.question as string,
      correct_answer: ex.correct_answer as string,
      options: (ex.options as string[] | null) ?? null,
      points: ex.points as number,
      explanation: ex.explanation as string | null,
    })),
  };

  return (
    <div>
      <Link href="/tutor/grammar"
        className="flex items-center gap-1 text-sm mb-5 hover:opacity-70 transition-all"
        style={{ color: "var(--brown-mid)" }}>
        <ChevronLeft size={16} /> Библиотека грамматики
      </Link>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--brown-dark)" }}>
        Редактирование набора
      </h1>
      <GrammarSetEditor existingSetId={setId} initial={initial} />
    </div>
  );
}

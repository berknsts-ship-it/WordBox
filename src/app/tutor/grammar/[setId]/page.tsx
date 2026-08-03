import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import GrammarSetEditor from "../GrammarSetEditor";
import type { ExerciseType } from "@/app/actions/grammar";

type ItemRow = {
  id: string; order_index: number; question: string; correct_answer: string;
  options: string[] | null; points: number; explanation: string | null;
};
type ExerciseRow = {
  id: string; order_index: number; type: ExerciseType; instruction: string | null;
  grammar_exercise_items: ItemRow[];
};

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
    .select("id, order_index, type, instruction, grammar_exercise_items(id, order_index, question, correct_answer, options, points, explanation)")
    .eq("set_id", setId)
    .order("order_index");

  const initial = {
    title: set.title,
    description: set.description ?? "",
    exercises: ((exercises ?? []) as unknown as ExerciseRow[])
      .sort((a, b) => a.order_index - b.order_index)
      .map(ex => ({
        _id: ex.id,
        type: ex.type,
        instruction: ex.instruction ?? "",
        items: [...(ex.grammar_exercise_items ?? [])]
          .sort((a, b) => a.order_index - b.order_index)
          .map(it => ({
            _id: it.id,
            question: it.question,
            correct_answer: it.correct_answer,
            options: it.options ?? null,
            points: it.points,
            explanation: it.explanation,
          })),
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

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, XCircle } from "lucide-react";
import { isGrammarAnswerCorrect } from "@/lib/grammarCheck";
import type { ExerciseType } from "@/app/actions/grammar";

type ItemRow = { id: string; question: string; correct_answer: string; points: number; explanation: string | null };
type ExerciseRow = { id: string; type: ExerciseType; instruction: string | null; grammar_exercise_items: ItemRow[] };

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  not_started: { label: "Не начат", color: "var(--brown-light)", bg: "#f5f0e8" },
  in_progress: { label: "В процессе", color: "#c07800", bg: "#fff3cc" },
  completed:   { label: "Пройден",    color: "#1a7a3a", bg: "#d8f5e0" },
};

export default async function GrammarResultsPage({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();
  const { data: set } = await db.from("grammar_sets").select("id, title").eq("id", setId).eq("tutor_id", user.id).single();
  if (!set) redirect("/tutor/grammar");

  const [{ data: exercises }, { data: assignments }] = await Promise.all([
    db.from("grammar_exercises")
      .select("id, type, instruction, grammar_exercise_items(id, question, correct_answer, points, explanation)")
      .eq("set_id", setId),
    db.from("grammar_assignments").select("id, student_id, status, answers, assigned_at, updated_at").eq("set_id", setId).order("assigned_at"),
  ]);

  const studentIds = (assignments ?? []).map(a => a.student_id);
  const { data: students } = studentIds.length > 0
    ? await supabase.from("students").select("id, name").in("id", studentIds)
    : { data: [] };
  const studentNames = new Map((students ?? []).map(s => [s.id, s.name]));

  // Плоский список пунктов с типом их упражнения — для проверки.
  const allItems: (ItemRow & { type: ExerciseType })[] = [];
  for (const ex of (exercises ?? []) as unknown as ExerciseRow[]) {
    for (const item of ex.grammar_exercise_items ?? []) allItems.push({ ...item, type: ex.type });
  }
  const maxScore = allItems.reduce((a, it) => a + it.points, 0);

  const card = { background: "white", borderColor: "var(--brown-pale)" };

  return (
    <div className="max-w-2xl">
      <Link href="/tutor/grammar" className="flex items-center gap-1 text-sm mb-5 hover:opacity-70 transition-all" style={{ color: "var(--brown-mid)" }}>
        <ChevronLeft size={16} /> Библиотека грамматики
      </Link>
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--brown-dark)" }}>Результаты: {set.title}</h1>
      <p className="text-sm mb-6" style={{ color: "var(--brown-light)" }}>
        Максимум {maxScore} {maxScore === 1 ? "балл" : maxScore < 5 ? "балла" : "баллов"}
      </p>

      {(assignments ?? []).length === 0 ? (
        <p className="text-sm" style={{ color: "var(--brown-light)" }}>Набор пока никому не назначен</p>
      ) : (
        <div className="space-y-3">
          {(assignments ?? []).map(a => {
            const answers = (a.answers as Record<string, string>) ?? {};
            const status = STATUS_LABELS[a.status] ?? STATUS_LABELS.not_started;
            const hasAnswers = a.status !== "not_started";

            let score = 0;
            const perItem = hasAnswers
              ? allItems.map(item => {
                  const correct = isGrammarAnswerCorrect(item.type, answers[item.id], item.correct_answer);
                  if (correct) score += item.points;
                  return { item, correct, submitted: answers[item.id] };
                })
              : [];

            return (
              <details key={a.id} className="rounded-2xl border p-4" style={card}>
                <summary className="flex items-center gap-3 cursor-pointer select-none list-none">
                  <span className="font-semibold text-sm flex-1" style={{ color: "var(--brown-dark)" }}>
                    {studentNames.get(a.student_id) ?? "Ученик"}
                  </span>
                  {hasAnswers && (
                    <span className="text-sm font-semibold" style={{ color: "var(--brown-mid)" }}>
                      {score} / {maxScore}
                    </span>
                  )}
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ color: status.color, background: status.bg }}>
                    {status.label}
                  </span>
                </summary>

                {hasAnswers && (
                  <div className="mt-3 pt-3 space-y-1.5 border-t" style={{ borderColor: "var(--brown-pale)" }}>
                    {perItem.map(({ item, correct, submitted }) => (
                      <div key={item.id} className="text-sm px-3 py-2 rounded-lg flex items-start gap-2"
                        style={{ background: correct ? "#f2faf2" : "#fff3f0" }}>
                        {correct ? (
                          <CheckCircle2 size={15} className="shrink-0 mt-0.5" style={{ color: "#2a7a3a" }} />
                        ) : (
                          <XCircle size={15} className="shrink-0 mt-0.5" style={{ color: "#c04020" }} />
                        )}
                        <div className="flex-1 min-w-0">
                          <p style={{ color: "var(--brown-dark)" }}>{item.question}</p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--brown-mid)" }}>
                            Ответ ученика: <span className="font-medium">{submitted || "—"}</span>
                            {!correct && <> · Правильно: <span className="font-medium">{item.correct_answer}</span></>}
                          </p>
                          {!correct && item.explanation && (
                            <p className="text-xs mt-1 italic" style={{ color: "var(--brown-light)" }}>{item.explanation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}

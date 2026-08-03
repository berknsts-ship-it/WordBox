import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import type { ExerciseType } from "@/app/actions/grammar";
import GrammarPractice from "@/components/student/GrammarPractice";

type ItemRow = {
  id: string; order_index: number; question: string; options: string[] | null; points: number;
  correct_answer: string; explanation: string | null;
};
type ExerciseRow = { id: string; order_index: number; type: ExerciseType; instruction: string | null; grammar_exercise_items: ItemRow[] };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default async function ExercisesTab({
  studentId,
  code,
  activeAssignmentId,
}: {
  studentId: string;
  code: string;
  activeAssignmentId?: string;
}) {
  const db = createAdminClient();

  // ── Session mode: проходим конкретный назначенный набор ──
  if (activeAssignmentId) {
    const { data: assignment } = await db
      .from("grammar_assignments")
      .select("id, set_id, status, answers")
      .eq("id", activeAssignmentId)
      .eq("student_id", studentId)
      .single();

    if (!assignment) return null;

    const { data: set } = await db.from("grammar_sets").select("title, description").eq("id", assignment.set_id).single();
    if (!set) return null;

    const completed = assignment.status === "completed";

    const { data: exercises } = await db
      .from("grammar_exercises")
      .select("id, order_index, type, instruction, grammar_exercise_items(id, order_index, question, options, points, correct_answer, explanation)")
      .eq("set_id", assignment.set_id)
      .order("order_index");

    // correct_answer/explanation остаются на сервере, пока работа не сдана —
    // проверка происходит только внутри submitGrammarAttempt, чтобы ответы не
    // утекали через Network до конца прохождения. Если уже пройдено — можно
    // сразу посчитать результат и показать разбор (spoiler тут ожидаем).
    const { isGrammarAnswerCorrect } = await import("@/lib/grammar/checkAnswer");
    const answers = (assignment.answers as Record<string, string>) ?? {};
    let score = 0;
    let maxScore = 0;
    const results: Record<string, { correct: boolean; correct_answer: string; explanation: string | null; points: number }> = {};

    const preparedExercises = ((exercises ?? []) as unknown as ExerciseRow[])
      .sort((a, b) => a.order_index - b.order_index)
      .map(ex => ({
        id: ex.id,
        type: ex.type,
        instruction: ex.instruction,
        items: [...(ex.grammar_exercise_items ?? [])]
          .sort((a, b) => a.order_index - b.order_index)
          .map(item => {
            maxScore += item.points;
            if (completed) {
              const correct = isGrammarAnswerCorrect(ex.type, answers[item.id], item.correct_answer);
              if (correct) score += item.points;
              results[item.id] = { correct, correct_answer: item.correct_answer, explanation: item.explanation, points: item.points };
            }
            return {
              id: item.id,
              points: item.points,
              // Для mcq — варианты как есть; для "порядок слов" — перемешанные
              // слова (не сам эталон!); для остальных типов options не нужны.
              options: ex.type === "word_order"
                ? shuffle(item.correct_answer.split("|")[0].trim().split(/\s+/))
                : ex.type === "mcq"
                  ? item.options
                  : null,
            };
          }),
      }));

    return (
      <GrammarPractice
        assignmentId={assignment.id}
        code={code}
        setTitle={set.title}
        setDescription={set.description}
        exercises={preparedExercises}
        initialAnswers={answers}
        initialStatus={assignment.status}
        initialResult={completed ? { score, maxScore, results } : null}
      />
    );
  }

  // ── List mode: список назначенных наборов со статусом ──
  const { data: assignments } = await db
    .from("grammar_assignments")
    .select("id, status, grammar_sets(id, title, description)")
    .eq("student_id", studentId);

  type Row = { id: string; status: string; grammar_sets: { id: string; title: string; description: string | null } | null };
  const sets = ((assignments ?? []) as unknown as Row[]).filter(a => a.grammar_sets);

  if (sets.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-5xl mb-3">✏️</p>
        <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>
          Упражнений пока нет
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--brown-light)" }}>
          Репетитор назначит набор упражнений — и здесь можно будет их пройти
        </p>
      </div>
    );
  }

  const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    not_started: { label: "Не начат", color: "var(--brown-light)", bg: "#f5f0e8" },
    in_progress: { label: "В процессе", color: "#c07800", bg: "#fff3cc" },
    completed:   { label: "Пройден", color: "#1a7a3a", bg: "#d8f5e0" },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {sets.map(a => {
        const s = a.grammar_sets!;
        const status = STATUS_LABELS[a.status] ?? STATUS_LABELS.not_started;
        return (
          <Link
            key={a.id}
            href={`/student/${code}?tab=trainer&sub=exercises&assignment=${a.id}`}
            className="rounded-2xl border p-5 hover:shadow-md transition-all group"
            style={{ background: "var(--theme-card-bg)", borderColor: "var(--theme-card-border)" }}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-2xl">{a.status === "completed" ? "✅" : "✏️"}</p>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ color: status.color, background: status.bg }}>
                {status.label}
              </span>
            </div>
            <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>{s.title}</p>
            {s.description && (
              <p className="text-xs mt-1" style={{ color: "var(--brown-light)" }}>{s.description}</p>
            )}
            <p className="text-sm mt-2.5 font-semibold group-hover:underline" style={{ color: "var(--brown-light)" }}>
              {a.status === "completed" ? "Посмотреть →" : a.status === "in_progress" ? "Продолжить →" : "Начать →"}
            </p>
          </Link>
        );
      })}
    </div>
  );
}

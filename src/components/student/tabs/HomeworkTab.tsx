import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { ClipboardList, Paperclip, AlertCircle, CheckCircle2, Clock3, Dumbbell, Blocks } from "lucide-react";
import HomeworkBlocksRunner, { type RunBlock } from "./HomeworkBlocksRunner";
import type { AutoQuestionType } from "@/app/actions/homework-blocks";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type BlockItemRow = {
  id: string; order_index: number; image_url: string | null; question: string | null;
  auto_type: AutoQuestionType | null; options: string[] | null; correct_answer: string | null;
};
type BlockRow = {
  id: string; order_index: number; type: RunBlock["type"]; instruction: string | null; words: string[] | null;
  homework_block_items: BlockItemRow[];
};

const STATUS: Record<string, { label: string; color: string; dot: string; icon: React.ReactNode }> = {
  pending:   {
    label: "Нужно сделать",
    color: "bg-[#f5ece3] text-[#74070E]",
    dot: "bg-[#74070E]",
    icon: <Clock3 size={12} />,
  },
  submitted: {
    label: "Отправлено",
    color: "bg-[#e8eff5] text-[#4a6580]",
    dot: "bg-[#7a9ab8]",
    icon: <CheckCircle2 size={12} />,
  },
  checked:   {
    label: "Проверено ✓",
    color: "bg-[#e6efea] text-[#4a7a5e]",
    dot: "bg-[#6ea882]",
    icon: <CheckCircle2 size={12} />,
  },
};

export default async function HomeworkTab({ studentId, code, activeHomeworkId }: { studentId: string; code: string; activeHomeworkId?: string }) {
  if (activeHomeworkId) {
    const db = createAdminClient();
    const { data: hw } = await db
      .from("homework")
      .select("id, title, description, status")
      .eq("id", activeHomeworkId)
      .eq("student_id", studentId)
      .single();
    if (!hw) return null;

    const { data: blocks } = await db
      .from("homework_blocks")
      .select("id, order_index, type, instruction, words, homework_block_items(id, order_index, image_url, question, auto_type, options, correct_answer)")
      .eq("homework_id", hw.id)
      .order("order_index");

    if (!blocks || blocks.length === 0) return null;

    const { data: attempt } = await db
      .from("homework_attempts")
      .select("answers")
      .eq("homework_id", hw.id)
      .maybeSingle();

    const preparedBlocks: RunBlock[] = ((blocks ?? []) as unknown as BlockRow[])
      .sort((a, b) => a.order_index - b.order_index)
      .map(b => ({
        id: b.id,
        type: b.type,
        instruction: b.instruction,
        words: b.words,
        items: [...(b.homework_block_items ?? [])]
          .sort((x, y) => x.order_index - y.order_index)
          .map(item => ({
            id: item.id,
            image_url: item.image_url,
            question: item.question,
            autoType: item.auto_type,
            // word_order: только перемешанные слова эталона, не сам эталон —
            // как в ExercisesTab.tsx для грамматики, чтобы ответ не утёк
            // через Network до сдачи работы.
            options: item.auto_type === "word_order" && item.correct_answer
              ? shuffle(item.correct_answer.split("|")[0].trim().split(/\s+/))
              : item.options,
          })),
      }));

    return (
      <HomeworkBlocksRunner
        homeworkId={hw.id}
        studentId={studentId}
        code={code}
        title={hw.title}
        description={hw.description}
        blocks={preparedBlocks}
        initialAnswers={(attempt?.answers as Record<string, string>) ?? {}}
        initialStatus={hw.status}
      />
    );
  }

  const supabase = await createClient();
  const { data: homework } = await supabase
    .from("homework")
    .select(`
      id, title, description, due_date, status, material_url, material_label, completed_late,
      grammar_assignment_id, vocabulary_set_id, grammar_assignments(score, max_score)
    `)
    .eq("student_id", studentId)
    .order("due_date", { ascending: true });

  const vocabSetIds = (homework ?? []).map(hw => hw.vocabulary_set_id).filter((id): id is string => !!id);
  let vocabResults = new Map<string, { mastered: number; total: number }>();
  if (vocabSetIds.length > 0) {
    const { data: words } = await supabase.from("vocabulary_words").select("id, set_id").in("set_id", vocabSetIds);
    const wordIds = (words ?? []).map(w => w.id);
    const { data: progress } = wordIds.length > 0
      ? await supabase.from("trainer_progress").select("word_id, status").eq("student_id", studentId).in("word_id", wordIds)
      : { data: [] as { word_id: string; status: string }[] };
    const masteredWordIds = new Set((progress ?? []).filter(p => p.status === "mastered").map(p => p.word_id));
    const totals = new Map<string, number>(), mastered = new Map<string, number>();
    for (const w of words ?? []) {
      totals.set(w.set_id, (totals.get(w.set_id) ?? 0) + 1);
      if (masteredWordIds.has(w.id)) mastered.set(w.set_id, (mastered.get(w.set_id) ?? 0) + 1);
    }
    vocabResults = new Map(vocabSetIds.map(id => [id, { mastered: mastered.get(id) ?? 0, total: totals.get(id) ?? 0 }]));
  }

  // Интерактивные домашки (блоки-конструктор) не имеют material_url/
  // grammar_assignment_id/vocabulary_set_id — только по этому множеству
  // отличаем их от обычных, чтобы показать «Открыть» вместо тех ссылок.
  // homework_blocks закрыт RLS на репетитора (auth.uid()), поэтому читаем
  // admin-клиентом — ученик не аутентифицирован через Supabase Auth.
  let interactiveIds = new Set<string>();
  if ((homework ?? []).length > 0) {
    const admin = createAdminClient();
    const { data: blockRows } = await admin
      .from("homework_blocks")
      .select("homework_id")
      .in("homework_id", (homework ?? []).map(hw => hw.id));
    interactiveIds = new Set((blockRows ?? []).map(r => r.homework_id as string));
  }

  if (!homework || homework.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList size={36} />}
        color="#74070E"
        bg="linear-gradient(135deg, #f5ece3 0%, #ede3d5 100%)"
        text="Домашних заданий нет"
        hint="Здесь появятся задания от репетитора"
      />
    );
  }

  return (
    <div className="space-y-3">
      {homework.map((hw) => {
        const s = STATUS[hw.status] ?? STATUS.pending;
        const isOverdue = hw.due_date && hw.status === "pending" && new Date(hw.due_date) < new Date();
        const gaRel = hw.grammar_assignments as { score: number; max_score: number } | { score: number; max_score: number }[] | null;
        const ga = Array.isArray(gaRel) ? gaRel[0] : gaRel;
        const vocabResult = hw.vocabulary_set_id ? vocabResults.get(hw.vocabulary_set_id) : undefined;
        const resultPct = ga && ga.max_score > 0
          ? Math.round((ga.score / ga.max_score) * 100)
          : vocabResult && vocabResult.total > 0
            ? Math.round((vocabResult.mastered / vocabResult.total) * 100)
            : null;

        return (
          <div
            key={hw.id}
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--theme-card-bg)", boxShadow: "var(--shadow-card)", border: "1px solid var(--theme-card-border)" }}
          >
            {/* Цветная полоска сверху по статусу */}
            <div className="h-1" style={{
              background: hw.status === "checked"
                ? "linear-gradient(90deg, #6ea882, #a0c8b0)"
                : hw.status === "submitted"
                ? "linear-gradient(90deg, #7a9ab8, #a0b8d0)"
                : isOverdue
                ? "linear-gradient(90deg, #c49090, #d4a8a8)"
                : "linear-gradient(90deg, #74070E, #a01018)",
            }} />

            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>{hw.title}</p>
                  {hw.description && (
                    <p className="text-sm mt-1" style={{ color: "var(--brown-light)" }}>{hw.description}</p>
                  )}
                  {hw.due_date && (
                    <div className={`flex items-center gap-1.5 mt-2 text-xs font-medium ${isOverdue ? "text-red-500" : ""}`}
                      style={!isOverdue ? { color: "var(--brown-light)" } : {}}>
                      {isOverdue && <AlertCircle size={12} />}
                      {isOverdue ? "Просрочено · " : "Срок: "}
                      {new Date(hw.due_date).toLocaleDateString("ru", { day: "numeric", month: "long" })}
                    </div>
                  )}
                  {interactiveIds.has(hw.id) && (
                    <Link
                      href={`/student/${code}?tab=homework&hw=${hw.id}`}
                      className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-75"
                      style={{ background: "var(--gradient-primary)", color: "#fff", boxShadow: "var(--shadow-button)" }}
                    >
                      <Blocks size={11} />
                      {hw.status === "pending" ? "Открыть и выполнить" : "Открыть"}
                    </Link>
                  )}
                  {hw.material_url && (
                    <a
                      href={hw.material_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-75"
                      style={{ background: "var(--gradient-primary)", color: "#fff", boxShadow: "var(--shadow-button)" }}
                    >
                      <Paperclip size={11} />
                      {hw.material_label || "Открыть материал"}
                    </a>
                  )}
                  {hw.grammar_assignment_id && (
                    <Link
                      href={`/student/${code}?tab=trainer&sub=exercises&assignment=${hw.grammar_assignment_id}`}
                      className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-75"
                      style={{ background: "var(--gradient-primary)", color: "#fff", boxShadow: "var(--shadow-button)" }}
                    >
                      <Dumbbell size={11} />
                      {hw.status === "pending" ? "Пройти в тренажёре" : "Открыть в тренажёре"}
                    </Link>
                  )}
                  {hw.vocabulary_set_id && (
                    <Link
                      href={`/student/${code}?tab=trainer&set=${hw.vocabulary_set_id}`}
                      className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-75"
                      style={{ background: "var(--gradient-primary)", color: "#fff", boxShadow: "var(--shadow-button)" }}
                    >
                      <Dumbbell size={11} />
                      {hw.status === "pending" ? "Пройти в тренажёре" : "Открыть в тренажёре"}
                    </Link>
                  )}
                  {resultPct !== null && (
                    <p className="text-xs mt-2 font-semibold" style={{ color: "var(--brown-mid)" }}>
                      🎯 Результат: {resultPct}%
                    </p>
                  )}
                </div>
                <span className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${s.color}`}>
                  {s.icon}
                  {s.label}{hw.status === "submitted" && hw.completed_late ? " (с опозданием)" : ""}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyState({ icon, color, bg, text, hint }: {
  icon: React.ReactNode; color: string; bg: string; text: string; hint: string;
}) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
        style={{ background: bg, color, boxShadow: `0 4px 16px ${color}30` }}>
        {icon}
      </div>
      <p className="font-semibold text-base" style={{ color: "var(--brown-dark)" }}>{text}</p>
      <p className="text-sm mt-1.5" style={{ color: "var(--brown-light)" }}>{hint}</p>
    </div>
  );
}

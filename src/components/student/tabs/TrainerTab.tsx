import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import WordTrainer from "@/components/student/WordTrainer";

export default async function TrainerTab({
  studentId,
  code,
  activeSetId,
}: {
  studentId: string;
  code: string;
  activeSetId?: string;
}) {
  const supabase = await createClient();

  // ── Session mode: show the trainer for a specific set ──
  if (activeSetId) {
    const [{ data: set }, { data: words }] = await Promise.all([
      supabase.from("vocabulary_sets").select("name").eq("id", activeSetId).single(),
      supabase
        .from("vocabulary_words")
        .select("id, english, russian, example, example_sentence, answer_variants")
        .eq("set_id", activeSetId),
    ]);

    if (!set) return null;

    if (!words || words.length === 0) {
      return (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>
            В этом наборе пока нет слов
          </p>
          <Link
            href={`/student/${code}?tab=trainer`}
            className="mt-4 inline-block text-sm font-semibold hover:underline"
            style={{ color: "var(--brown-mid)" }}
          >
            ← Назад к наборам
          </Link>
        </div>
      );
    }

    const safeWords = words.map((w) => ({
      id: w.id,
      english: w.english,
      russian: w.russian,
      example: w.example ?? null,
      example_sentence: (w as { example_sentence?: string | null }).example_sentence ?? null,
      answer_variants: (w as { answer_variants?: string[] | null }).answer_variants ?? [],
    }));

    return (
      <WordTrainer
        words={safeWords}
        setName={set.name}
        code={code}
        studentId={studentId}
      />
    );
  }

  // ── Set list — load via junction table ──
  const { data: assignments } = await supabase
    .from("set_assignments")
    .select("vocabulary_sets(id, name)")
    .eq("student_id", studentId);

  // Flatten the join result
  type SetRow = { id: string; name: string };
  const sets: SetRow[] = (assignments ?? [])
    .map((a) => {
      const vs = a.vocabulary_sets;
      if (!vs || Array.isArray(vs)) return null;
      const s = vs as { id: string; name: string };
      return { id: s.id, name: s.name };
    })
    .filter((s): s is SetRow => s !== null);

  if (sets.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-5xl mb-3">📚</p>
        <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>
          Наборов слов пока нет
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--brown-light)" }}>
          Репетитор добавит слова — и здесь появятся карточки для тренировки
        </p>
      </div>
    );
  }

  // Load per-set progress
  const setIds = sets.map((s) => s.id);
  const { data: allWords } = await supabase
    .from("vocabulary_words")
    .select("id, set_id")
    .in("set_id", setIds);

  const wordIds = (allWords ?? []).map((w) => w.id);

  let progressData: { word_id: string; status: string }[] = [];
  if (wordIds.length > 0) {
    try {
      const db = createAdminClient();
      const { data } = await db
        .from("trainer_progress")
        .select("word_id, status")
        .eq("student_id", studentId)
        .in("word_id", wordIds);
      progressData = data ?? [];
    } catch {
      // trainer_progress table may not exist yet
    }
  }

  // Build per-set mastered / total maps
  const wordSetMap = new Map<string, string>(); // wordId → setId
  for (const w of allWords ?? []) wordSetMap.set(w.id, w.set_id);

  const totalBySet = new Map<string, number>();
  const masteredBySet = new Map<string, number>();
  for (const w of allWords ?? []) {
    totalBySet.set(w.set_id, (totalBySet.get(w.set_id) ?? 0) + 1);
  }
  for (const p of progressData) {
    if (p.status !== "mastered") continue;
    const sid = wordSetMap.get(p.word_id);
    if (sid) masteredBySet.set(sid, (masteredBySet.get(sid) ?? 0) + 1);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {sets.map((set) => {
        const total = totalBySet.get(set.id) ?? 0;
        const mastered = masteredBySet.get(set.id) ?? 0;
        const pct = total > 0 ? (mastered / total) * 100 : 0;
        const isDone = total > 0 && mastered >= total;

        return (
          <Link
            key={set.id}
            href={`/student/${code}?tab=trainer&set=${set.id}`}
            className="rounded-2xl border p-5 hover:shadow-md transition-all group"
            style={{
              background: "var(--theme-card-bg)",
              borderColor: isDone ? "#6b9e6b" : "var(--theme-card-border)",
              borderWidth: isDone ? "2px" : "1px",
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-2xl">{isDone ? "✅" : "🃏"}</p>
              {total > 0 && (
                <span
                  className="text-xs font-semibold"
                  style={{ color: isDone ? "#4a7a5e" : "var(--brown-light)" }}
                >
                  {mastered}/{total}
                </span>
              )}
            </div>

            <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>{set.name}</p>

            {total > 0 && (
              <div className="mt-3">
                <div
                  className="w-full h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(0,0,0,0.07)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: isDone ? "#6b9e6b" : "var(--brown-mid)",
                    }}
                  />
                </div>
              </div>
            )}

            <p
              className="text-sm mt-2.5 font-semibold group-hover:underline"
              style={{ color: isDone ? "#4a7a5e" : "var(--brown-light)" }}
            >
              {isDone ? "Повторить ещё раз →" : "Начать тренировку →"}
            </p>
          </Link>
        );
      })}
    </div>
  );
}

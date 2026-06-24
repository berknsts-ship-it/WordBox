import { createClient } from "@/lib/supabase/server";
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

  // Режим тренажёра — загружаем слова конкретного набора
  if (activeSetId) {
    const [{ data: set }, { data: words }] = await Promise.all([
      supabase.from("vocabulary_sets").select("name").eq("id", activeSetId).single(),
      supabase.from("vocabulary_words").select("id, english, russian, example").eq("set_id", activeSetId),
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

    return <WordTrainer words={words} setName={set.name} code={code} />;
  }

  // Список наборов
  const { data: sets } = await supabase
    .from("vocabulary_sets")
    .select("id, name")
    .eq("student_id", studentId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (!sets || sets.length === 0) {
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {sets.map((set) => (
        <Link
          key={set.id}
          href={`/student/${code}?tab=trainer&set=${set.id}`}
          className="bg-white/80 rounded-2xl border p-5 hover:shadow-md transition-all group"
          style={{ borderColor: "var(--brown-pale)" }}
        >
          <p className="text-3xl mb-3">🃏</p>
          <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>{set.name}</p>
          <p className="text-sm mt-1 font-semibold group-hover:underline" style={{ color: "var(--brown-light)" }}>
            Начать тренировку →
          </p>
        </Link>
      ))}
    </div>
  );
}

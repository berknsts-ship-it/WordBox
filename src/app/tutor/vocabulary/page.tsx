import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function VocabularyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: sets } = await supabase
    .from("vocabulary_sets")
    .select("id, name, student_id, students(name)")
    .eq("tutor_id", user!.id)
    .order("created_at", { ascending: false });

  const { data: words } = await supabase
    .from("vocabulary_words")
    .select("id, set_id")
    .eq("tutor_id", user!.id);

  const wordCountBySet: Record<string, number> = {};
  for (const w of words ?? []) {
    wordCountBySet[w.set_id] = (wordCountBySet[w.set_id] ?? 0) + 1;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl">Словари</h1>
        <p className="text-sm mt-1" style={{ color: "var(--brown-light)" }}>
          Все наборы слов по всем ученикам · {sets?.length ?? 0} наборов · {words?.length ?? 0} слов
        </p>
      </div>

      {!sets || sets.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">📚</p>
          <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>Словарей пока нет</p>
          <p className="text-sm mt-2" style={{ color: "var(--brown-light)" }}>
            Перейди на страницу ученика → вкладка Словари → создай набор
          </p>
          <Link href="/tutor/students"
            className="inline-block mt-4 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white hover:opacity-80"
            style={{ background: "var(--brown-mid)" }}>
            К ученикам
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sets.map((set) => {
            const studentName = (Array.isArray(set.students)
              ? (set.students as {name:string}[])[0]?.name
              : (set.students as {name:string}|null)?.name) ?? "Ученик";
            const count = wordCountBySet[set.id] ?? 0;

            return (
              <Link
                key={set.id}
                href={`/tutor/students/${set.student_id}?tab=vocabulary&set=${set.id}`}
                className="bg-white/80 rounded-2xl border px-5 py-4 hover:shadow-md transition-shadow block"
                style={{ borderColor: "var(--brown-pale)" }}>
                <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>{set.name}</p>
                <p className="text-xs mt-1" style={{ color: "var(--brown-light)" }}>
                  {studentName} · {count} {count === 1 ? "слово" : count < 5 ? "слова" : "слов"}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

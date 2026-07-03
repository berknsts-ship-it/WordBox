import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { addVocabularySet } from "@/app/actions/vocabulary";
import { SubmitButton } from "@/components/ui/SubmitButton";

export default async function VocabularyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: sets }, { data: students }] = await Promise.all([
    supabase
      .from("vocabulary_sets")
      .select("id, name, student_id, students(name)")
      .eq("tutor_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("students")
      .select("id, name")
      .eq("tutor_id", user!.id)
      .order("name"),
  ]);

  // Count words per set via sets (not by tutor_id on words)
  const setIds = (sets ?? []).map((s) => s.id);
  let wordCountBySet: Record<string, number> = {};
  if (setIds.length > 0) {
    const { data: words } = await supabase
      .from("vocabulary_words")
      .select("id, set_id")
      .in("set_id", setIds);
    for (const w of words ?? []) {
      wordCountBySet[w.set_id] = (wordCountBySet[w.set_id] ?? 0) + 1;
    }
  }

  const totalWords = Object.values(wordCountBySet).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--brown-dark)" }}>Словари</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--brown-light)" }}>
            {sets?.length ?? 0} наборов · {totalWords} слов
          </p>
        </div>
      </div>

      {/* Форма создания набора */}
      {students && students.length > 0 && (
        <div
          className="rounded-2xl border p-5 mb-6"
          style={{ background: "white", borderColor: "var(--brown-pale)" }}
        >
          <p className="text-sm font-semibold mb-3" style={{ color: "var(--brown-dark)" }}>
            Создать набор слов
          </p>
          <form action={addVocabularySet} className="flex flex-col sm:flex-row gap-2">
            <select
              name="student_id"
              required
              className="rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              style={{
                background: "var(--cream)",
                border: "1.5px solid var(--brown-pale)",
                color: "var(--brown-dark)",
              }}
            >
              <option value="">Выбери ученика...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <input
              name="name"
              required
              placeholder="Название набора"
              className="flex-1 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              style={{
                background: "var(--cream)",
                border: "1.5px solid var(--brown-pale)",
                color: "var(--brown-dark)",
              }}
            />
            <SubmitButton
              label="Создать"
              pendingLabel="Создаём..."
              style={{
                background: "var(--gradient-primary)",
                color: "white",
                padding: "0.625rem 1.25rem",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            />
          </form>
        </div>
      )}

      {!sets || sets.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">📚</p>
          <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>
            {students?.length ? "Создай первый набор выше" : "Нет учеников"}
          </p>
          {!students?.length && (
            <Link
              href="/tutor/students/new"
              className="inline-block mt-4 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white hover:opacity-80"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-button)" }}
            >
              Добавить ученика
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sets.map((set) => {
            const studentName =
              (Array.isArray(set.students)
                ? (set.students as { name: string }[])[0]?.name
                : (set.students as { name: string } | null)?.name) ?? "Ученик";
            const count = wordCountBySet[set.id] ?? 0;

            return (
              <Link
                key={set.id}
                href={`/tutor/students/${set.student_id}?tab=vocabulary&set=${set.id}`}
                className="rounded-2xl border px-5 py-4 hover:shadow-md transition-shadow block"
                style={{ background: "white", borderColor: "var(--brown-pale)" }}
              >
                <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>{set.name}</p>
                <p className="text-xs mt-1" style={{ color: "var(--brown-light)" }}>
                  {studentName} · {count}{" "}
                  {count === 1 ? "слово" : count < 5 ? "слова" : "слов"}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

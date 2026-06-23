import { createClient } from "@/lib/supabase/server";
import { addVocabularySet, deleteVocabularySet, addWord, deleteWord } from "@/app/actions/vocabulary";
import Link from "next/link";

export default async function TutorVocabularyTab({
  studentId,
  activeSetId,
}: {
  studentId: string;
  activeSetId?: string;
}) {
  const supabase = await createClient();
  const { data: sets } = await supabase
    .from("vocabulary_sets")
    .select("id, name, created_at")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  // Если выбран конкретный набор — показываем слова
  if (activeSetId) {
    const activeSet = sets?.find((s) => s.id === activeSetId);
    const { data: words } = await supabase
      .from("vocabulary_words")
      .select("id, english, russian, example")
      .eq("set_id", activeSetId)
      .order("created_at", { ascending: true });

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/tutor/students/${studentId}?tab=vocabulary`}
            className="text-sm font-semibold hover:underline"
            style={{ color: "var(--brown-light)" }}
          >
            ← Все наборы
          </Link>
          <span style={{ color: "var(--brown-pale)" }}>·</span>
          <span className="font-semibold" style={{ color: "var(--brown-dark)" }}>
            {activeSet?.name}
          </span>
          <span className="text-sm" style={{ color: "var(--brown-light)" }}>
            {words?.length ?? 0} слов
          </span>
        </div>

        {/* Форма добавления слова */}
        <div className="bg-white/80 rounded-3xl border p-6" style={{ borderColor: "var(--brown-pale)" }}>
          <h2 className="text-base font-semibold mb-4" style={{ color: "var(--brown-dark)" }}>
            Добавить слово
          </h2>
          <form action={addWord} className="space-y-4">
            <input type="hidden" name="set_id" value={activeSetId} />
            <input type="hidden" name="student_id" value={studentId} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
                  Английский *
                </label>
                <input
                  name="english"
                  required
                  autoFocus
                  placeholder="apple"
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
                  Русский *
                </label>
                <input
                  name="russian"
                  required
                  placeholder="яблоко"
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
                Пример использования (необязательно)
              </label>
              <input
                name="example"
                placeholder="I eat an apple every day."
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl px-4 py-2.5 text-white text-sm font-semibold hover:opacity-80 transition-opacity"
              style={{ background: "var(--brown-mid)" }}
            >
              Добавить слово
            </button>
          </form>
        </div>

        {/* Список слов */}
        {words && words.length > 0 && (
          <div className="space-y-2">
            {words.map((word) => (
              <div
                key={word.id}
                className="bg-white/80 rounded-2xl border px-4 py-3 flex items-center gap-4"
                style={{ borderColor: "var(--brown-pale)" }}
              >
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <p className="font-semibold text-sm" style={{ color: "var(--brown-dark)" }}>
                    {word.english}
                  </p>
                  <p className="text-sm" style={{ color: "var(--brown-mid)" }}>
                    {word.russian}
                  </p>
                </div>
                {word.example && (
                  <p className="text-xs italic flex-1 hidden sm:block" style={{ color: "var(--brown-light)" }}>
                    {word.example}
                  </p>
                )}
                <form action={deleteWord.bind(null, word.id, studentId)}>
                  <button type="submit" className="text-xs text-red-400 hover:text-red-600 px-2 py-1">
                    ✕
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        {words?.length === 0 && (
          <div className="text-center py-10">
            <p className="text-3xl mb-2">📝</p>
            <p className="text-sm" style={{ color: "var(--brown-light)" }}>
              Добавь первые слова в этот набор
            </p>
          </div>
        )}
      </div>
    );
  }

  // Список наборов
  return (
    <div className="space-y-6">
      {/* Форма создания набора */}
      <div className="bg-white/80 rounded-3xl border p-6" style={{ borderColor: "var(--brown-pale)" }}>
        <h2 className="text-base font-semibold mb-4" style={{ color: "var(--brown-dark)" }}>
          Создать набор слов
        </h2>
        <form action={addVocabularySet} className="flex gap-3">
          <input type="hidden" name="student_id" value={studentId} />
          <input
            name="name"
            required
            placeholder="Например: Тема — еда, числа, времена года..."
            className="flex-1 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
            style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
          />
          <button
            type="submit"
            className="rounded-xl px-4 py-2.5 text-white text-sm font-semibold hover:opacity-80 whitespace-nowrap"
            style={{ background: "var(--brown-mid)" }}
          >
            Создать
          </button>
        </form>
      </div>

      {/* Список наборов */}
      {!sets || sets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">📚</p>
          <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>Наборов пока нет</p>
          <p className="text-sm mt-1" style={{ color: "var(--brown-light)" }}>
            Создай первый набор слов для ученика
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sets.map((set) => (
            <div
              key={set.id}
              className="bg-white/80 rounded-2xl border p-4"
              style={{ borderColor: "var(--brown-pale)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>{set.name}</p>
                <form action={deleteVocabularySet.bind(null, set.id, studentId)}>
                  <button type="submit" className="text-xs text-red-400 hover:text-red-600 px-2 py-1 shrink-0">
                    ✕
                  </button>
                </form>
              </div>
              <Link
                href={`/tutor/students/${studentId}?tab=vocabulary&set=${set.id}`}
                className="mt-3 inline-block text-sm font-semibold hover:opacity-70 transition-opacity"
                style={{ color: "var(--brown-mid)" }}
              >
                ✏️ Добавить слова →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

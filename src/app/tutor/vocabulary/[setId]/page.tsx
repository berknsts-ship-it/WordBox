import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { addWord, deleteWord } from "@/app/actions/vocabulary";
import { SubmitButton } from "@/components/ui/SubmitButton";

export default async function SetDetailPage({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: set }, { data: words }] = await Promise.all([
    supabase
      .from("vocabulary_sets")
      .select("id, name")
      .eq("id", setId)
      .eq("tutor_id", user.id)
      .single(),
    supabase
      .from("vocabulary_words")
      .select("id, english, russian, example, example_sentence")
      .eq("set_id", setId)
      .order("created_at", { ascending: true }),
  ]);

  if (!set) redirect("/tutor/vocabulary");

  const inputStyle = {
    background: "var(--cream)",
    border: "1.5px solid var(--brown-pale)",
    color: "var(--brown-dark)",
  };

  return (
    <div className="max-w-2xl">
      <Link
        href="/tutor/vocabulary"
        className="flex items-center gap-1 text-sm mb-5 hover:opacity-70 transition-all"
        style={{ color: "var(--brown-mid)" }}
      >
        <ChevronLeft size={15} /> Все словари
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--brown-dark)" }}>{set.name}</h1>
        <span className="text-sm" style={{ color: "var(--brown-light)" }}>
          {words?.length ?? 0} слов
        </span>
      </div>

      {/* Форма добавления слова */}
      <div
        className="rounded-2xl border p-5 mb-6"
        style={{ background: "white", borderColor: "var(--brown-pale)" }}
      >
        <p className="text-sm font-semibold mb-4" style={{ color: "var(--brown-dark)" }}>
          Добавить слово
        </p>
        <form action={addWord} className="space-y-3">
          <input type="hidden" name="set_id" value={setId} />

          <div className="grid grid-cols-2 gap-3">
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
                style={inputStyle}
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
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
              Пример
            </label>
            <input
              name="example"
              placeholder="I eat an apple every day."
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
              Предложение с пробелом{" "}
              <span className="font-normal" style={{ color: "var(--brown-light)" }}>
                (для режима «заполни пробел»)
              </span>
            </label>
            <input
              name="example_sentence"
              placeholder="I eat an ___ every day."
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              style={inputStyle}
            />
            <p className="text-xs mt-1" style={{ color: "var(--brown-light)" }}>
              Используй ___ для обозначения пропуска
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
              Доп. варианты ответа{" "}
              <span className="font-normal" style={{ color: "var(--brown-light)" }}>
                (через запятую)
              </span>
            </label>
            <input
              name="answer_variants"
              placeholder="cancelled, cancels"
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>

          <SubmitButton
            label="Добавить слово"
            pendingLabel="Добавляем..."
            style={{
              background: "var(--gradient-primary)",
              color: "white",
              width: "100%",
              padding: "0.625rem 1rem",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          />
        </form>
      </div>

      {/* Список слов */}
      {words && words.length > 0 ? (
        <div className="space-y-2">
          {words.map((word) => (
            <div
              key={word.id}
              className="rounded-2xl border px-4 py-3 flex items-start gap-3"
              style={{ background: "white", borderColor: "var(--brown-pale)" }}
            >
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-2 gap-4">
                  <p className="font-semibold text-sm" style={{ color: "var(--brown-dark)" }}>
                    {word.english}
                  </p>
                  <p className="text-sm" style={{ color: "var(--brown-mid)" }}>
                    {word.russian}
                  </p>
                </div>
                {word.example && (
                  <p className="text-xs italic mt-1" style={{ color: "var(--brown-light)" }}>
                    {word.example}
                  </p>
                )}
                {(word as { example_sentence?: string | null }).example_sentence && (
                  <p className="text-xs mt-0.5" style={{ color: "var(--brown-mid)" }}>
                    📝 {(word as { example_sentence?: string | null }).example_sentence}
                  </p>
                )}
              </div>
              <form action={deleteWord.bind(null, word.id, setId)}>
                <button
                  type="submit"
                  className="text-xs hover:text-red-600 px-2 py-1 transition-colors"
                  style={{ color: "var(--brown-light)" }}
                >
                  ✕
                </button>
              </form>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-3xl mb-2">📝</p>
          <p className="text-sm" style={{ color: "var(--brown-light)" }}>
            Добавь первые слова в этот набор
          </p>
        </div>
      )}
    </div>
  );
}

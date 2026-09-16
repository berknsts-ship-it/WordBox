import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileUploadField } from "@/components/tutor/FileUploadField";
import { addHomework as addHomeworkAction } from "@/app/actions/homework";

async function addHomework(formData: FormData) {
  "use server";
  await addHomeworkAction(formData);
  redirect("/tutor/homework");
}

export default async function NewHomeworkPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: students }, { data: grammarSets }, { data: vocabSets }] = await Promise.all([
    supabase.from("students").select("id, name").eq("tutor_id", user!.id).order("name"),
    supabase.from("grammar_sets").select("id, title").eq("tutor_id", user!.id).order("title"),
    supabase.from("vocabulary_sets").select("id, name").eq("tutor_id", user!.id).order("name"),
  ]);

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/tutor/homework" className="text-sm hover:opacity-70 transition-opacity"
          style={{ color: "var(--brown-light)" }}>
          ← Задания
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl">Новое задание</h1>
        <Link href="/tutor/homework/new-interactive"
          className="text-sm font-semibold px-3 py-1.5 rounded-xl hover:opacity-80 transition-opacity"
          style={{ background: "var(--brown-pale)", color: "var(--brown-dark)" }}>
          🧩 Интерактивное задание (картинки + автопроверка) →
        </Link>
      </div>

      <div className="bg-white/80 rounded-3xl border p-6" style={{ borderColor: "var(--brown-pale)" }}>
        <form action={addHomework} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
              Ученик *
            </label>
            <select
              name="student_id"
              required
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
            >
              <option value="">Выбери ученика</option>
              {students?.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
              Название *
            </label>
            <input
              name="title"
              required
              placeholder="Упражнение на Present Perfect..."
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
              Описание
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Что нужно сделать..."
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
              style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
              Срок сдачи
            </label>
            <input
              name="due_date"
              type="date"
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
            />
          </div>

          {(grammarSets && grammarSets.length > 0) || (vocabSets && vocabSets.length > 0) ? (
            <div className="border-t pt-4 space-y-3" style={{ borderColor: "var(--brown-pale)" }}>
              <p className="text-xs font-semibold" style={{ color: "var(--brown-light)" }}>
                🎯 Связать с тренажёром (необязательно)
              </p>
              <p className="text-xs -mt-1" style={{ color: "var(--brown-light)" }}>
                Выбери набор — когда ученик его пройдёт, задание само отметится «Сдано»
              </p>
              {grammarSets && grammarSets.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
                    Набор грамматики
                  </label>
                  <select
                    name="pick_grammar_set"
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
                  >
                    <option value="">— не привязывать —</option>
                    {grammarSets.map((s) => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
              )}
              {vocabSets && vocabSets.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
                    Набор словаря
                  </label>
                  <select
                    name="pick_vocabulary_set"
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
                  >
                    <option value="">— не привязывать —</option>
                    {vocabSets.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ) : null}

          <div className="border-t pt-4 space-y-3" style={{ borderColor: "var(--brown-pale)" }}>
            <p className="text-xs font-semibold" style={{ color: "var(--brown-light)" }}>
              📎 Прикрепить материал (необязательно)
            </p>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
                Ссылка
              </label>
              <input
                name="material_url"
                type="url"
                placeholder="https://..."
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
                Название ссылки
              </label>
              <input
                name="material_label"
                placeholder="Например: Видео урок, Упражнение"
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: "var(--brown-pale)" }} />
              <span className="text-xs" style={{ color: "var(--brown-light)" }}>или</span>
              <div className="flex-1 h-px" style={{ background: "var(--brown-pale)" }} />
            </div>
            <FileUploadField
              folder="homework"
              urlFieldName="uploaded_url"
              fileNameFieldName="uploaded_file_name"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl px-4 py-2.5 text-white text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-button)" }}
          >
            Дать задание
          </button>
        </form>
      </div>
    </div>
  );
}

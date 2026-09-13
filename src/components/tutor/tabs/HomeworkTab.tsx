import { createClient } from "@/lib/supabase/server";
import { addHomework, updateHomeworkStatus, deleteHomework } from "@/app/actions/homework";
import { FileUploadField } from "@/components/tutor/FileUploadField";

const STATUS = {
  pending:   { label: "Нужно сделать", color: "bg-[#f5ece3] text-[#74070E]" },
  submitted: { label: "Отправлено",    color: "bg-[#e8eff5] text-[#4a6580]" },
  checked:   { label: "Проверено ✓",   color: "bg-[#e6efea] text-[#4a7a5e]" },
};

export default async function TutorHomeworkTab({ studentId }: { studentId: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: homework }, { data: grammarSets }, { data: vocabSets }] = await Promise.all([
    supabase
      .from("homework")
      .select(`
        id, title, description, due_date, status, material_url, material_label, completed_late,
        grammar_assignment_id, vocabulary_set_id,
        grammar_assignments(score, max_score)
      `)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false }),
    supabase.from("grammar_sets").select("id, title").eq("tutor_id", user!.id).order("title"),
    supabase.from("vocabulary_sets").select("id, name").eq("tutor_id", user!.id).order("name"),
  ]);

  // Vocabulary result (%) isn't stored anywhere — computed the same way
  // the trainer's own set list shows progress, just for the sets actually
  // linked to homework here.
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

  return (
    <div className="space-y-6">

      {/* Форма */}
      <div className="bg-white/80 rounded-3xl border p-6" style={{ borderColor: "var(--brown-pale)" }}>
        <h2 className="text-base font-semibold mb-4" style={{ color: "var(--brown-dark)" }}>
          Добавить задание
        </h2>
        <form action={addHomework} className="space-y-4">
          <input type="hidden" name="student_id" value={studentId} />

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
              Название *
            </label>
            <input
              name="title"
              required
              placeholder="Например: Упражнения 5-7, стр. 42"
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
              rows={2}
              placeholder="Подробности задания..."
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

          {/* Прикрепить материал */}
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
                placeholder="Например: Видео-урок, Упражнение"
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
            Добавить задание
          </button>
        </form>
      </div>

      {/* Список */}
      {homework && homework.length > 0 && (
        <div className="space-y-3">
          {homework.map((hw) => {
            const s = STATUS[hw.status as keyof typeof STATUS] ?? STATUS.pending;
            const gaRel = hw.grammar_assignments as { score: number; max_score: number } | { score: number; max_score: number }[] | null;
            const ga = Array.isArray(gaRel) ? gaRel[0] : gaRel;
            const vocabResult = hw.vocabulary_set_id ? vocabResults.get(hw.vocabulary_set_id) : undefined;
            const resultPct = ga && ga.max_score > 0
              ? Math.round((ga.score / ga.max_score) * 100)
              : vocabResult && vocabResult.total > 0
                ? Math.round((vocabResult.mastered / vocabResult.total) * 100)
                : null;
            return (
              <div key={hw.id} className="bg-white/80 rounded-2xl border p-4"
                style={{ borderColor: "var(--brown-pale)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--brown-dark)" }}>{hw.title}</p>
                    {hw.description && (
                      <p className="text-xs mt-0.5" style={{ color: "var(--brown-light)" }}>{hw.description}</p>
                    )}
                    {hw.due_date && (
                      <p className="text-xs mt-1" style={{ color: "var(--brown-light)" }}>
                        Срок: {new Date(hw.due_date).toLocaleDateString("ru", { day: "numeric", month: "long" })}
                      </p>
                    )}
                    {hw.material_url && (
                      <p className="text-xs mt-1 truncate" style={{ color: "var(--brown-light)" }}>
                        📎 {hw.material_label || hw.material_url}
                      </p>
                    )}
                    {resultPct !== null && (
                      <p className="text-xs mt-1 font-semibold" style={{ color: "var(--brown-mid)" }}>
                        🎯 Результат: {resultPct}%
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.color}`}>
                      {s.label}{hw.status === "submitted" && hw.completed_late ? " (с опозданием)" : ""}
                    </span>
                    <div className="flex gap-1">
                      {hw.status !== "checked" && (
                        <form action={updateHomeworkStatus.bind(null, hw.id, "checked", studentId)}>
                          <button type="submit" className="text-xs px-2.5 py-1 rounded-lg hover:opacity-80"
                            style={{ background: "var(--brown-pale)", color: "var(--brown-mid)" }}>
                            ✓ Проверено
                          </button>
                        </form>
                      )}
                      <form action={deleteHomework.bind(null, hw.id, studentId)}>
                        <button type="submit" className="text-xs text-red-400 hover:text-red-600 px-2 py-1">✕</button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

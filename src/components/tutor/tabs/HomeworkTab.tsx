import { createClient } from "@/lib/supabase/server";
import { addHomework, updateHomeworkStatus, deleteHomework } from "@/app/actions/homework";

const STATUS = {
  pending:   { label: "Нужно сделать", color: "bg-amber-50 text-amber-700" },
  submitted: { label: "Отправлено",    color: "bg-blue-50 text-blue-700" },
  checked:   { label: "Проверено ✓",   color: "bg-emerald-50 text-emerald-700" },
};

export default async function TutorHomeworkTab({ studentId }: { studentId: string }) {
  const supabase = await createClient();
  const { data: homework } = await supabase
    .from("homework")
    .select("id, title, description, due_date, status")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

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

          <button type="submit"
            className="w-full rounded-xl px-4 py-2.5 text-white text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ background: "var(--brown-mid)" }}>
            Добавить задание
          </button>
        </form>
      </div>

      {/* Список */}
      {homework && homework.length > 0 && (
        <div className="space-y-3">
          {homework.map((hw) => {
            const s = STATUS[hw.status as keyof typeof STATUS] ?? STATUS.pending;
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
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.color}`}>{s.label}</span>
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

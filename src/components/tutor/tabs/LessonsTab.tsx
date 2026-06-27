import { createClient } from "@/lib/supabase/server";
import { addLesson } from "@/app/actions/lessons";
import { STATUS_CONFIG } from "@/components/tutor/LessonStatusPicker";
import LessonCard from "@/components/tutor/LessonCard";

export default async function TutorLessonsTab({ studentId }: { studentId: string }) {
  const supabase = await createClient();

  const [{ data: lessons }, { data: studentData }] = await Promise.all([
    supabase
      .from("lessons")
      .select("id, date, topic, notes, duration_minutes, status, payment_status, price_rub")
      .eq("student_id", studentId)
      .order("date", { ascending: false }),
    supabase
      .from("students")
      .select("default_price_rub")
      .eq("id", studentId)
      .single(),
  ]);

  const defaultPrice = studentData?.default_price_rub ?? null;

  return (
    <div className="space-y-6">
      {/* Форма добавления */}
      <div className="bg-white/80 rounded-3xl border p-6" style={{ borderColor: "var(--brown-pale)" }}>
        <h2 className="text-base font-semibold mb-4" style={{ color: "var(--brown-dark)" }}>
          Добавить урок
        </h2>
        <form action={addLesson} className="space-y-4">
          <input type="hidden" name="student_id" value={studentId} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
                Дата и время *
              </label>
              <input
                name="date" type="datetime-local" required
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
                Длительность (мин)
              </label>
              <input
                name="duration_minutes" type="number" defaultValue={60} min={15} max={180}
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
                Тема урока
              </label>
              <input
                name="topic" placeholder="Present Perfect, чтение текста..."
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
                Стоимость (₽)
              </label>
              <input
                name="price_rub" type="number" min={0}
                defaultValue={defaultPrice ?? ""}
                placeholder="1500"
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
              Заметки по уроку
            </label>
            <textarea
              name="notes" rows={2} placeholder="Что прошли, что задали..."
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
              style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
              Статус
            </label>
            <select
              name="status"
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
            >
              {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl px-4 py-2.5 text-white text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-button)" }}
          >
            Добавить урок
          </button>
        </form>
      </div>

      {/* Список уроков */}
      {lessons && lessons.length > 0 && (
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} studentId={studentId} />
          ))}
        </div>
      )}
    </div>
  );
}

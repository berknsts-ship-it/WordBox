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
      <div className="rounded-2xl p-6" style={{
        background: "rgba(253,248,242,0.88)",
        boxShadow: "0 4px 24px rgba(28,10,11,0.07), inset 0 0 0 1px rgba(156,122,69,0.20)",
      }}>
        <div className="flex items-center gap-3 mb-5">
          <p className="luxury-section-label">Добавить урок</p>
          <div className="flex-1 h-px" style={{ background: "rgba(156,122,69,0.18)" }} />
        </div>
        <form action={addLesson} className="space-y-4">
          <input type="hidden" name="student_id" value={studentId} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block luxury-section-label mb-1.5">Дата и время *</label>
              <input
                name="date" type="datetime-local" required
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                style={{ background: "white", border: "1px solid rgba(156,122,69,0.25)", color: "var(--brown-dark)" }}
              />
            </div>
            <div>
              <label className="block luxury-section-label mb-1.5">Длительность (мин)</label>
              <input
                name="duration_minutes" type="number" defaultValue={60} min={15} max={180}
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                style={{ background: "white", border: "1px solid rgba(156,122,69,0.25)", color: "var(--brown-dark)" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block luxury-section-label mb-1.5">Тема урока</label>
              <input
                name="topic" placeholder="Present Perfect, чтение текста..."
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                style={{ background: "white", border: "1px solid rgba(156,122,69,0.25)", color: "var(--brown-dark)" }}
              />
            </div>
            <div>
              <label className="block luxury-section-label mb-1.5">Стоимость (₽)</label>
              <input
                name="price_rub" type="number" min={0}
                defaultValue={defaultPrice ?? ""}
                placeholder="1500"
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                style={{ background: "white", border: "1px solid rgba(156,122,69,0.25)", color: "var(--brown-dark)" }}
              />
            </div>
          </div>

          <div>
            <label className="block luxury-section-label mb-1.5">Заметки по уроку</label>
            <textarea
              name="notes" rows={2} placeholder="Что прошли, что задали..."
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
              style={{ background: "white", border: "1px solid rgba(156,122,69,0.25)", color: "var(--brown-dark)" }}
            />
          </div>

          <div>
            <label className="block luxury-section-label mb-1.5">Статус</label>
            <select
              name="status"
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              style={{ background: "white", border: "1px solid rgba(156,122,69,0.25)", color: "var(--brown-dark)" }}
            >
              {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl px-4 py-3 text-sm font-semibold tracking-widest uppercase hover:opacity-85 transition-opacity"
            style={{
              background: "linear-gradient(135deg, #5e1018, #74070E)",
              color: "#EDE0CC",
              boxShadow: "0 4px 16px rgba(116,7,14,0.32)",
              fontFamily: "var(--font-cormorant), Georgia, serif",
            }}
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

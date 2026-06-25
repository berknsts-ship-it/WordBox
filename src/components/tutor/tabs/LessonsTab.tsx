import { createClient } from "@/lib/supabase/server";
import { addLesson, deleteLesson } from "@/app/actions/lessons";
import LessonStatusPicker, { STATUS_CONFIG } from "@/components/tutor/LessonStatusPicker";

export default async function TutorLessonsTab({ studentId }: { studentId: string }) {
  const supabase = await createClient();
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, date, topic, notes, duration_minutes, status")
    .eq("student_id", studentId)
    .order("date", { ascending: false });

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
                name="date"
                type="datetime-local"
                required
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
                Длительность (мин)
              </label>
              <input
                name="duration_minutes"
                type="number"
                defaultValue={60}
                min={15}
                max={180}
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
              Тема урока
            </label>
            <input
              name="topic"
              placeholder="Например: Present Perfect, чтение текста..."
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
              Заметки по уроку
            </label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Что прошли, что задали..."
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
          {lessons.map((lesson) => {
            const date = new Date(lesson.date);
            const isPast = date < new Date();
            return (
              <div key={lesson.id} className="bg-white/80 rounded-2xl border p-4"
                style={{ borderColor: "var(--brown-pale)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${lesson.status === "completed" ? "bg-[#6ea882]" : isPast ? "bg-[#c49090]" : "bg-[#b8956a]"}`} />
                      <p className="font-semibold text-sm" style={{ color: "var(--brown-dark)" }}>
                        {lesson.topic || "Урок английского"}
                      </p>
                    </div>
                    <p className="text-xs ml-4" style={{ color: "var(--brown-light)" }}>
                      {date.toLocaleDateString("ru", { day: "numeric", month: "long", weekday: "short" })} · {date.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })} · {lesson.duration_minutes} мин
                    </p>
                    {lesson.notes && (
                      <p className="text-xs ml-4 mt-1 italic" style={{ color: "var(--brown-light)" }}>
                        {lesson.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <LessonStatusPicker
                      lessonId={lesson.id}
                      studentId={studentId}
                      currentStatus={lesson.status}
                    />
                    <form action={deleteLesson.bind(null, lesson.id, studentId)}>
                      <button type="submit" className="text-xs text-red-400 hover:text-red-600 px-2 py-1">
                        ✕
                      </button>
                    </form>
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

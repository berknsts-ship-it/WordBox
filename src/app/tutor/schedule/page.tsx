import { createClient } from "@/lib/supabase/server";
import { addLesson, deleteLesson } from "@/app/actions/lessons";
import LessonStatusPicker from "@/components/tutor/LessonStatusPicker";

function groupByDate(lessons: Lesson[]): Record<string, Lesson[]> {
  const groups: Record<string, Lesson[]> = {};
  for (const lesson of lessons) {
    const key = new Date(lesson.date).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(lesson);
  }
  return groups;
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Сегодня";
  if (date.toDateString() === tomorrow.toDateString()) return "Завтра";

  return date.toLocaleDateString("ru", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

type Lesson = {
  id: string;
  date: string;
  topic: string | null;
  notes: string | null;
  duration_minutes: number;
  status: string;
  student_id: string;
  students: { name: string }[] | null;
};

export default async function SchedulePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: upcoming }, { data: past }, { data: students }] = await Promise.all([
    supabase
      .from("lessons")
      .select("id, date, topic, notes, duration_minutes, status, student_id, students(name)")
      .eq("tutor_id", user!.id)
      .eq("status", "scheduled")
      .gte("date", new Date().toISOString())
      .order("date", { ascending: true }),
    supabase
      .from("lessons")
      .select("id, date, topic, notes, duration_minutes, status, student_id, students(name)")
      .eq("tutor_id", user!.id)
      .in("status", ["completed", "cancelled"])
      .order("date", { ascending: false })
      .limit(20),
    supabase
      .from("students")
      .select("id, name")
      .eq("tutor_id", user!.id)
      .order("name"),
  ]);

  const upcomingGroups = groupByDate((upcoming as Lesson[]) ?? []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl">Расписание</h1>
          <p className="text-sm mt-1" style={{ color: "var(--brown-light)" }}>
            {upcoming?.length ?? 0} предстоящих уроков
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая колонка — форма */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 rounded-3xl border p-6 sticky top-20"
            style={{ borderColor: "var(--brown-pale)" }}>
            <h2 className="font-semibold mb-4" style={{ color: "var(--brown-dark)" }}>
              Добавить урок
            </h2>
            <form action={addLesson} className="space-y-4">
              <input type="hidden" name="status" value="scheduled" />

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

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
                  Тема
                </label>
                <input
                  name="topic"
                  placeholder="Present Perfect, чтение..."
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
                  Заметки
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
                  style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
                />
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
        </div>

        {/* Правая колонка — список */}
        <div className="lg:col-span-2 space-y-6">

          {/* Предстоящие */}
          {Object.keys(upcomingGroups).length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-3">📅</p>
              <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>Предстоящих уроков нет</p>
              <p className="text-sm mt-1" style={{ color: "var(--brown-light)" }}>
                Добавь первый урок в форме слева
              </p>
            </div>
          ) : (
            Object.entries(upcomingGroups).map(([dateStr, lessons]) => (
              <div key={dateStr}>
                <p className="text-sm font-bold mb-3 capitalize"
                  style={{ color: "var(--brown-mid)" }}>
                  {formatDateLabel(dateStr)}
                </p>
                <div className="space-y-2">
                  {lessons.map((lesson) => (
                    <LessonCard key={lesson.id} lesson={lesson} />
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Прошедшие */}
          {past && past.length > 0 && (
            <div>
              <p className="text-sm font-bold mb-3" style={{ color: "var(--brown-light)" }}>
                Прошедшие уроки
              </p>
              <div className="space-y-2 opacity-70">
                {(past as Lesson[]).map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LessonCard({ lesson }: { lesson: Lesson }) {
  const date = new Date(lesson.date);
  const s = lesson.students;
  const studentName = (Array.isArray(s) ? (s as {name:string}[])[0]?.name : (s as {name:string}|null)?.name) ?? "Ученик";
  const initials = studentName[0].toUpperCase();

  return (
    <div className="bg-white/80 rounded-2xl border px-4 py-3 flex items-center gap-4"
      style={{ borderColor: "var(--brown-pale)" }}>

      {/* Аватар */}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
        style={{ background: "var(--brown-pale)", color: "var(--brown-mid)" }}>
        {initials}
      </div>

      {/* Время */}
      <div className="shrink-0 text-center min-w-[44px]">
        <p className="text-sm font-bold" style={{ color: "var(--brown-dark)" }}>
          {date.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })}
        </p>
        <p className="text-xs" style={{ color: "var(--brown-light)" }}>
          {lesson.duration_minutes} мин
        </p>
      </div>

      {/* Инфо */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate" style={{ color: "var(--brown-dark)" }}>
          {studentName}
        </p>
        {lesson.topic && (
          <p className="text-xs truncate" style={{ color: "var(--brown-light)" }}>
            {lesson.topic}
          </p>
        )}
      </div>

      {/* Статус и кнопки */}
      <div className="flex items-center gap-2 shrink-0">
        <LessonStatusPicker
          lessonId={lesson.id}
          studentId={lesson.student_id}
          currentStatus={lesson.status}
        />
        <form action={deleteLesson.bind(null, lesson.id, lesson.student_id)}>
          <button type="submit" className="text-xs text-red-400 hover:text-red-600 px-1.5 py-1">
            ✕
          </button>
        </form>
      </div>
    </div>
  );
}

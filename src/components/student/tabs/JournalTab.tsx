import { createClient } from "@/lib/supabase/server";

export default async function JournalTab({ studentId }: { studentId: string }) {
  const supabase = await createClient();
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, date, topic, notes, duration_minutes")
    .eq("student_id", studentId)
    .eq("status", "completed")
    .order("date", { ascending: false });

  if (!lessons || lessons.length === 0) {
    return <EmptyState icon="📖" text="Уроков пока не было" hint="После каждого урока здесь будут появляться заметки" />;
  }

  return (
    <div className="space-y-3">
      {lessons.map((lesson) => {
        const date = new Date(lesson.date);
        return (
          <div key={lesson.id} className="bg-white rounded-2xl border border-stone-100 p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="font-semibold text-stone-800">
                {lesson.topic || "Урок английского"}
              </p>
              <span className="shrink-0 text-xs text-stone-400 bg-stone-50 px-2.5 py-1 rounded-full">
                {date.toLocaleDateString("ru", { day: "numeric", month: "long" })}
              </span>
            </div>
            {lesson.notes ? (
              <p className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed">
                {lesson.notes}
              </p>
            ) : (
              <p className="text-sm text-stone-300 italic">Заметок нет</p>
            )}
            <p className="text-xs text-stone-300 mt-2">{lesson.duration_minutes} мин</p>
          </div>
        );
      })}
    </div>
  );
}

function EmptyState({ icon, text, hint }: { icon: string; text: string; hint: string }) {
  return (
    <div className="text-center py-16">
      <p className="text-5xl mb-3">{icon}</p>
      <p className="font-semibold text-stone-700">{text}</p>
      <p className="text-sm text-stone-400 mt-1">{hint}</p>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";

export default async function ScheduleTab({ studentId }: { studentId: string }) {
  const supabase = await createClient();
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, date, duration_minutes, topic, status")
    .eq("student_id", studentId)
    .eq("status", "scheduled")
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true });

  if (!lessons || lessons.length === 0) {
    return <EmptyState icon="📅" text="Ближайших уроков нет" hint="Здесь появятся твои запланированные уроки" />;
  }

  return (
    <div className="space-y-3">
      {lessons.map((lesson) => {
        const date = new Date(lesson.date);
        const weekday = date.toLocaleDateString("ru", { weekday: "long" });
        const time = date.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
        const dayNum = date.getDate();
        const month = date.toLocaleDateString("ru", { month: "short" });

        return (
          <div
            key={lesson.id}
            className="bg-white rounded-2xl border border-stone-100 p-4 flex items-center gap-4"
          >
            <div className="rounded-xl px-3 py-2.5 text-center min-w-[56px]"
              style={{ background: "linear-gradient(135deg, #f5ede0 0%, #ece0cc 100%)" }}>
              <p className="text-[11px] font-semibold uppercase" style={{ color: "var(--brown-light)" }}>{month}</p>
              <p className="text-2xl font-bold leading-none" style={{ color: "var(--brown-dark)" }}>{dayNum}</p>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-stone-800">
                {lesson.topic || "Урок английского"}
              </p>
              <p className="text-sm text-stone-400 mt-0.5 capitalize">
                {weekday} · {time} · {lesson.duration_minutes} мин
              </p>
            </div>
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#6ea882" }} />
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

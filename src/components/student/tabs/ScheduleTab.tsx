import { createClient } from "@/lib/supabase/server";
import { Clock, CalendarDays } from "lucide-react";

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
    return (
      <EmptyState
        icon={<CalendarDays size={36} />}
        color="#7a9ab8"
        bg="linear-gradient(135deg, #e8eff5 0%, #d4e4f0 100%)"
        text="Ближайших уроков нет"
        hint="Здесь появятся твои запланированные уроки"
      />
    );
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
            className="bg-white/90 rounded-2xl p-4 flex items-center gap-4"
            style={{ boxShadow: "var(--shadow-card)", border: "1px solid rgba(237,227,213,0.8)" }}
          >
            {/* Дата */}
            <div
              className="rounded-xl px-3 py-2.5 text-center min-w-[58px] flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #f5ece3 0%, #ede3d5 100%)", boxShadow: "0 2px 6px rgba(116,7,14,0.15)" }}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--brown-light)" }}>{month}</p>
              <p className="text-2xl font-bold leading-none mt-0.5" style={{ color: "var(--brown-dark)", fontFamily: "var(--font-lora)" }}>{dayNum}</p>
            </div>

            {/* Контент */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate" style={{ color: "var(--brown-dark)" }}>
                {lesson.topic || "Урок английского"}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm capitalize" style={{ color: "var(--brown-light)" }}>{weekday}</span>
                <span className="text-sm font-medium" style={{ color: "var(--brown-mid)" }}>{time}</span>
                <span className="flex items-center gap-1 text-xs" style={{ color: "var(--brown-light)" }}>
                  <Clock size={11} />
                  {lesson.duration_minutes} мин
                </span>
              </div>
            </div>

            {/* Индикатор */}
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: "#6ea882", boxShadow: "0 0 6px rgba(110,168,130,0.5)" }} />
          </div>
        );
      })}
    </div>
  );
}

function EmptyState({ icon, color, bg, text, hint }: {
  icon: React.ReactNode; color: string; bg: string; text: string; hint: string;
}) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
        style={{ background: bg, color, boxShadow: `0 4px 16px ${color}30` }}>
        {icon}
      </div>
      <p className="font-semibold text-base" style={{ color: "var(--brown-dark)" }}>{text}</p>
      <p className="text-sm mt-1.5" style={{ color: "var(--brown-light)" }}>{hint}</p>
    </div>
  );
}

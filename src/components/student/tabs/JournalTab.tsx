import { createClient } from "@/lib/supabase/server";
import { NotebookText, Clock } from "lucide-react";

export default async function JournalTab({ studentId }: { studentId: string }) {
  const supabase = await createClient();
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, date, topic, notes, duration_minutes")
    .eq("student_id", studentId)
    .eq("status", "completed")
    .order("date", { ascending: false });

  if (!lessons || lessons.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
          style={{
            background: "linear-gradient(135deg, #f0ece5 0%, #e4d8ca 100%)",
            color: "var(--brown-light)",
            boxShadow: "0 4px 16px rgba(78,104,19,0.2)",
          }}
        >
          <NotebookText size={36} />
        </div>
        <p className="font-semibold text-base" style={{ color: "var(--brown-dark)" }}>Уроков пока не было</p>
        <p className="text-sm mt-1.5" style={{ color: "var(--brown-light)" }}>
          После каждого урока здесь будут появляться заметки
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {lessons.map((lesson, i) => {
        const date = new Date(lesson.date);
        return (
          <div
            key={lesson.id}
            className="bg-white/90 rounded-2xl overflow-hidden flex"
            style={{ boxShadow: "var(--shadow-card)", border: "1px solid rgba(237,227,213,0.8)" }}
          >
            {/* Левый цветной акцент */}
            <div
              className="w-1 flex-shrink-0"
              style={{ background: i === 0 ? "var(--gradient-primary)" : "linear-gradient(180deg, #4E6813, #ede3d5)" }}
            />
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>
                  {lesson.topic || "Урок английского"}
                </p>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: "var(--brown-pale)", color: "var(--brown-mid)" }}
                  >
                    {date.toLocaleDateString("ru", { day: "numeric", month: "long" })}
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--brown-light)" }}>
                    <Clock size={10} />
                    {lesson.duration_minutes} мин
                  </span>
                </div>
              </div>
              {lesson.notes ? (
                <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "var(--brown-mid)" }}>
                  {lesson.notes}
                </p>
              ) : (
                <p className="text-sm italic" style={{ color: "var(--brown-pale)" }}>Заметок нет</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

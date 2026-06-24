import { createClient } from "@/lib/supabase/server";

const STATUS: Record<string, { label: string; color: string; dot: string }> = {
  pending:   { label: "Нужно сделать", color: "bg-amber-50 text-amber-700",   dot: "bg-amber-400" },
  submitted: { label: "Отправлено",    color: "bg-blue-50 text-blue-700",     dot: "bg-blue-400" },
  checked:   { label: "Проверено ✓",   color: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-400" },
};

export default async function HomeworkTab({ studentId }: { studentId: string }) {
  const supabase = await createClient();
  const { data: homework } = await supabase
    .from("homework")
    .select("id, title, description, due_date, status, material_url, material_label")
    .eq("student_id", studentId)
    .order("due_date", { ascending: true });

  if (!homework || homework.length === 0) {
    return <EmptyState icon="📝" text="Домашних заданий нет" hint="Здесь появятся задания от репетитора" />;
  }

  return (
    <div className="space-y-3">
      {homework.map((hw) => {
        const s = STATUS[hw.status] ?? STATUS.pending;
        const isOverdue = hw.due_date && hw.status === "pending" && new Date(hw.due_date) < new Date();

        return (
          <div key={hw.id} className="bg-white rounded-2xl border border-stone-100 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3 items-start">
                <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
                <div>
                  <p className="font-semibold text-stone-800">{hw.title}</p>
                  {hw.description && (
                    <p className="text-sm text-stone-500 mt-1">{hw.description}</p>
                  )}
                  {hw.due_date && (
                    <p className={`text-xs mt-2 font-medium ${isOverdue ? "text-red-500" : "text-stone-400"}`}>
                      {isOverdue ? "⚠️ Просрочено · " : "Срок: "}
                      {new Date(hw.due_date).toLocaleDateString("ru", { day: "numeric", month: "long" })}
                    </p>
                  )}
                  {hw.material_url && (
                    <a
                      href={hw.material_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80"
                      style={{ background: "var(--brown-pale)", color: "var(--brown-mid)" }}
                    >
                      📎 {hw.material_label || "Открыть материал"}
                    </a>
                  )}
                </div>
              </div>
              <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${s.color}`}>
                {s.label}
              </span>
            </div>
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

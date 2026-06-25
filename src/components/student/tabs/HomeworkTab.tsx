import { createClient } from "@/lib/supabase/server";
import { ClipboardList, Paperclip, AlertCircle, CheckCircle2, Clock3 } from "lucide-react";

const STATUS: Record<string, { label: string; color: string; dot: string; icon: React.ReactNode }> = {
  pending:   {
    label: "Нужно сделать",
    color: "bg-[#f5ece3] text-[#74070E]",
    dot: "bg-[#74070E]",
    icon: <Clock3 size={12} />,
  },
  submitted: {
    label: "Отправлено",
    color: "bg-[#e8eff5] text-[#4a6580]",
    dot: "bg-[#7a9ab8]",
    icon: <CheckCircle2 size={12} />,
  },
  checked:   {
    label: "Проверено ✓",
    color: "bg-[#e6efea] text-[#4a7a5e]",
    dot: "bg-[#6ea882]",
    icon: <CheckCircle2 size={12} />,
  },
};

export default async function HomeworkTab({ studentId }: { studentId: string }) {
  const supabase = await createClient();
  const { data: homework } = await supabase
    .from("homework")
    .select("id, title, description, due_date, status, material_url, material_label")
    .eq("student_id", studentId)
    .order("due_date", { ascending: true });

  if (!homework || homework.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList size={36} />}
        color="#74070E"
        bg="linear-gradient(135deg, #f5ece3 0%, #ede3d5 100%)"
        text="Домашних заданий нет"
        hint="Здесь появятся задания от репетитора"
      />
    );
  }

  return (
    <div className="space-y-3">
      {homework.map((hw) => {
        const s = STATUS[hw.status] ?? STATUS.pending;
        const isOverdue = hw.due_date && hw.status === "pending" && new Date(hw.due_date) < new Date();

        return (
          <div
            key={hw.id}
            className="bg-white/90 rounded-2xl overflow-hidden"
            style={{ boxShadow: "var(--shadow-card)", border: "1px solid rgba(237,227,213,0.8)" }}
          >
            {/* Цветная полоска сверху по статусу */}
            <div className="h-1" style={{
              background: hw.status === "checked"
                ? "linear-gradient(90deg, #6ea882, #a0c8b0)"
                : hw.status === "submitted"
                ? "linear-gradient(90deg, #7a9ab8, #a0b8d0)"
                : isOverdue
                ? "linear-gradient(90deg, #c49090, #d4a8a8)"
                : "linear-gradient(90deg, #74070E, #a01018)",
            }} />

            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>{hw.title}</p>
                  {hw.description && (
                    <p className="text-sm mt-1" style={{ color: "var(--brown-light)" }}>{hw.description}</p>
                  )}
                  {hw.due_date && (
                    <div className={`flex items-center gap-1.5 mt-2 text-xs font-medium ${isOverdue ? "text-red-500" : ""}`}
                      style={!isOverdue ? { color: "var(--brown-light)" } : {}}>
                      {isOverdue && <AlertCircle size={12} />}
                      {isOverdue ? "Просрочено · " : "Срок: "}
                      {new Date(hw.due_date).toLocaleDateString("ru", { day: "numeric", month: "long" })}
                    </div>
                  )}
                  {hw.material_url && (
                    <a
                      href={hw.material_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-75"
                      style={{ background: "var(--gradient-primary)", color: "#fff", boxShadow: "var(--shadow-button)" }}
                    >
                      <Paperclip size={11} />
                      {hw.material_label || "Открыть материал"}
                    </a>
                  )}
                </div>
                <span className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${s.color}`}>
                  {s.icon}
                  {s.label}
                </span>
              </div>
            </div>
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

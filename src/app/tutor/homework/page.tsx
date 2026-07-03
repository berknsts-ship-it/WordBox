import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { HomeworkActions } from "@/components/tutor/HomeworkActions";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: "Не сдано",   color: "bg-[#f5ece3] text-[#74070E]" },
  submitted: { label: "Сдано",      color: "bg-[#e8eff5] text-[#4a6580]" },
  checked:   { label: "Проверено",  color: "bg-[#e6efea] text-[#4a7a5e]" },
};

export default async function HomeworkPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = "pending" } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const query = supabase
    .from("homework")
    .select("id, title, description, due_date, status, student_id, students(name)")
    .eq("tutor_id", user!.id)
    .order("due_date", { ascending: true });

  if (filter !== "all") {
    query.eq("status", filter);
  }

  const { data: homework } = await query;

  const counts = await Promise.all(
    ["pending", "submitted", "checked"].map(async (s) => {
      const { count } = await supabase
        .from("homework")
        .select("id", { count: "exact", head: true })
        .eq("tutor_id", user!.id)
        .eq("status", s);
      return { status: s, count: count ?? 0 };
    })
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl">Домашние задания</h1>
        <p className="text-sm mt-1" style={{ color: "var(--brown-light)" }}>
          Все задания по всем ученикам
        </p>
      </div>

      {/* Фильтры */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { value: "pending",   label: "Не сданы" },
          { value: "submitted", label: "Ожидают проверки" },
          { value: "checked",   label: "Проверены" },
          { value: "all",       label: "Все" },
        ].map(({ value, label }) => {
          const count = counts.find((c) => c.status === value)?.count;
          return (
            <Link
              key={value}
              href={`/tutor/homework?filter=${value}`}
              className="px-4 py-2 rounded-2xl text-sm font-semibold transition-all"
              style={
                filter === value
                  ? { background: "var(--brown-mid)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.7)", color: "var(--brown-light)", border: "1.5px solid var(--brown-pale)" }
              }
            >
              {label}{count !== undefined ? ` (${count})` : ""}
            </Link>
          );
        })}
      </div>

      {/* Список */}
      {!homework || homework.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">📝</p>
          <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>
            Заданий нет
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--brown-light)" }}>
            Добавляй задания на странице каждого ученика
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {homework.map((hw) => {
            const studentName = (Array.isArray(hw.students)
              ? (hw.students as {name:string}[])[0]?.name
              : (hw.students as {name:string}|null)?.name) ?? "Ученик";
            const statusCfg = STATUS_LABELS[hw.status] ?? STATUS_LABELS.pending;
            const dueDate = hw.due_date ? new Date(hw.due_date) : null;
            const isOverdue = dueDate && dueDate < new Date() && hw.status === "pending";

            return (
              <div key={hw.id}
                className="bg-white/80 rounded-2xl border px-4 py-3 flex items-center gap-4"
                style={{ borderColor: isOverdue ? "#fca5a5" : "var(--brown-pale)" }}>

                {/* Аватар ученика */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: "var(--brown-pale)", color: "var(--brown-mid)" }}>
                  {studentName[0].toUpperCase()}
                </div>

                {/* Инфо */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate" style={{ color: "var(--brown-dark)" }}>
                      {hw.title}
                    </p>
                    {isOverdue && (
                      <span className="text-xs text-red-500 font-semibold shrink-0">просрочено</span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: "var(--brown-light)" }}>
                    {studentName}
                    {dueDate && ` · до ${dueDate.toLocaleDateString("ru", { day: "numeric", month: "short" })}`}
                  </p>
                </div>

                {/* Статус + кнопки */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                  <HomeworkActions id={hw.id} studentId={hw.student_id} status={hw.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Clock, CheckCircle, FileText, Eye, AlertCircle } from "lucide-react";
import { deleteTest, issueTest } from "@/app/actions/tests";

const STATUS_LABEL: Record<string, string> = {
  draft: "Черновик",
  issued: "Выдан",
  in_progress: "Выполняется",
  submitted: "На проверке",
  graded: "Проверен",
};
const STATUS_COLOR: Record<string, string> = {
  draft: "#94a3b8",
  issued: "#2060d0",
  in_progress: "#c07800",
  submitted: "#7c3aed",
  graded: "#1a7a3a",
};
const STATUS_BG: Record<string, string> = {
  draft: "#f1f5f9",
  issued: "#e8f0ff",
  in_progress: "#fff3cc",
  submitted: "#f3e8ff",
  graded: "#d8f5e0",
};

export default async function TestsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tests } = await supabase
    .from("tests")
    .select("id, title, status, issued_at, submitted_at, grade, auto_score, manual_score, students(name)")
    .eq("tutor_id", user.id)
    .order("created_at", { ascending: false });

  const card = { background: "white", borderColor: "var(--brown-pale)", boxShadow: "var(--shadow-card)" };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold" style={{ color: "var(--brown-dark)" }}>Контрольные работы</h1>
        <Link
          href="/tutor/tests/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus size={16} /> Создать тест
        </Link>
      </div>

      {(!tests || tests.length === 0) ? (
        <div className="rounded-2xl border p-12 text-center" style={card}>
          <FileText size={40} className="mx-auto mb-3" style={{ color: "var(--brown-light)" }} />
          <p className="font-semibold mb-1" style={{ color: "var(--brown-dark)" }}>Нет контрольных работ</p>
          <p className="text-sm mb-4" style={{ color: "var(--brown-light)" }}>Создайте первый тест для ученика</p>
          <Link href="/tutor/tests/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "var(--gradient-primary)" }}>
            <Plus size={14} /> Создать тест
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map(t => {
            const student = (t.students as unknown) as { name: string } | null;
            const total = (t.auto_score ?? 0) + (t.manual_score ?? 0);
            return (
              <div key={t.id} className="rounded-xl border p-4 flex items-center gap-4 flex-wrap" style={card}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold" style={{ color: "var(--brown-dark)" }}>{t.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: STATUS_BG[t.status] ?? "#f1f5f9", color: STATUS_COLOR[t.status] ?? "#94a3b8" }}>
                      {STATUS_LABEL[t.status] ?? t.status}
                    </span>
                    {t.grade && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: t.grade >= 4 ? "#d8f5e0" : t.grade === 3 ? "#fff3cc" : "#ffe0e0",
                                 color: t.grade >= 4 ? "#1a7a3a" : t.grade === 3 ? "#c07800" : "#cc3030" }}>
                        Оценка: {t.grade}
                      </span>
                    )}
                  </div>
                  <div className="text-sm mt-1 flex items-center gap-3 flex-wrap" style={{ color: "var(--brown-light)" }}>
                    {student && <span>{student.name}</span>}
                    {t.issued_at && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {t.issued_at.slice(0, 10)}
                      </span>
                    )}
                    {t.grade && <span>{total} баллов</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {t.status === "submitted" && (
                    <Link href={`/tutor/tests/${t.id}/grade`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white"
                      style={{ background: "var(--gradient-primary)" }}>
                      <CheckCircle size={13} /> Проверить
                    </Link>
                  )}
                  <Link href={`/tutor/tests/${t.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium"
                    style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)" }}>
                    <Eye size={13} /> Открыть
                  </Link>
                  {(t.status === "draft" || t.status === "issued") && (
                    <form action={async () => {
                      "use server";
                      await deleteTest(t.id);
                    }}>
                      <button type="submit"
                        className="px-3 py-1.5 rounded-lg border text-sm"
                        style={{ borderColor: "#fecaca", color: "#dc2626" }}
                        onClick={() => {}} >
                        Удалить
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

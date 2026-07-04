import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { ClipboardCheck, Clock, AlertCircle } from "lucide-react";
import TestRewardIcons from "@/components/student/TestRewardIcons";

const STATUS_LABEL: Record<string, string> = {
  issued: "Ожидает выполнения",
  in_progress: "Выполняется",
  submitted: "На проверке",
  graded: "Проверена",
};

const STATUS_COLOR: Record<string, string> = {
  issued: "#2060d0",
  in_progress: "#c07800",
  submitted: "#7c3aed",
  graded: "#1a7a3a",
};

const STATUS_BG: Record<string, string> = {
  issued: "#e8f0ff",
  in_progress: "#fff3cc",
  submitted: "#f3e8ff",
  graded: "#d8f5e0",
};

export default async function TestsTab({
  studentId,
  accessCode,
  themeId,
}: {
  studentId: string;
  accessCode: string;
  themeId?: string | null;
}) {
  const db = createAdminClient();

  const { data: tests } = await db
    .from("tests")
    .select("id, title, status, time_limit_min, issued_at, auto_score, manual_score, grade, stars")
    .eq("student_id", studentId)
    .neq("status", "draft")
    .order("created_at", { ascending: false });

  if (!tests || tests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
        <ClipboardCheck size={40} style={{ color: "var(--brown-light)" }} />
        <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>Нет контрольных работ</p>
        <p className="text-sm" style={{ color: "var(--brown-light)" }}>
          Здесь появятся задания от репетитора
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tests.map(t => {
        const total = (t.auto_score ?? 0) + (t.manual_score ?? 0);
        const canTake = t.status === "issued" || t.status === "in_progress";

        return (
          <div key={t.id}
            className="rounded-2xl p-4 flex items-center gap-4 flex-wrap"
            style={{ background: "var(--theme-card-bg)", boxShadow: "var(--shadow-card)", border: "1px solid var(--theme-card-border)" }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold" style={{ color: "var(--brown-dark)" }}>{t.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: STATUS_BG[t.status] ?? "#f1f5f9", color: STATUS_COLOR[t.status] ?? "#94a3b8" }}>
                  {STATUS_LABEL[t.status] ?? t.status}
                </span>
                {t.grade && (
                  <span className="text-sm font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: t.grade >= 4 ? "#d8f5e0" : t.grade === 3 ? "#fff3cc" : "#ffe0e0",
                      color: t.grade >= 4 ? "#1a7a3a" : t.grade === 3 ? "#c07800" : "#cc3030",
                    }}>
                    Оценка: {t.grade}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: "var(--brown-light)" }}>
                {t.issued_at && (
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {t.issued_at.slice(0, 10)}
                  </span>
                )}
                {t.time_limit_min && <span>{t.time_limit_min} мин.</span>}
                {t.status === "graded" && <span>{total} б.</span>}
              </div>
            </div>

            {canTake && (
              <Link
                href={`/student/tests/${t.id}?code=${accessCode}`}
                className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: "var(--gradient-primary)" }}>
                {t.status === "in_progress" ? "Продолжить" : "Начать"}
              </Link>
            )}
            {t.status === "submitted" && (
              <span className="shrink-0 text-xs px-3 py-2 rounded-xl flex items-center gap-1"
                style={{ background: "#f3e8ff", color: "#7c3aed" }}>
                <AlertCircle size={13} /> Ожидает проверки
              </span>
            )}
            {t.status === "graded" && t.stars && (
              <div className="shrink-0">
                <TestRewardIcons stars={t.stars} themeId={themeId ?? "default"} size={30} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

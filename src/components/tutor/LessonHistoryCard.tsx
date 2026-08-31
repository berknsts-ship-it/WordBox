"use client";

import LessonTable, { type LessonRow } from "./LessonTable";

// Same table as the subscription summary uses, for students who pay per
// lesson instead of by package — they had no summary at all before, since
// the whole card only rendered when there was an active subscription.
export default function LessonHistoryCard({ allLessons }: { allLessons: Record<string, unknown>[] }) {
  const lessons = allLessons as unknown as LessonRow[];

  if (lessons.length === 0) {
    return (
      <div className="rounded-2xl border p-5" style={{ background: "white", borderColor: "var(--brown-pale)", boxShadow: "var(--shadow-card)" }}>
        <p className="text-sm" style={{ color: "var(--brown-light)" }}>
          Занятий пока не было — добавляйте их в расписании.
        </p>
      </div>
    );
  }

  const completed = lessons.filter(l => l.status === "completed").length;
  const cancelled = lessons.filter(l => l.status === "cancelled").length;
  const missed    = lessons.filter(l => l.status === "missed").length;

  return (
    <div className="rounded-2xl border p-5 space-y-3" style={{ background: "white", borderColor: "var(--brown-pale)", boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center gap-4 flex-wrap text-xs px-3 py-2 rounded-xl" style={{ background: "#fdf8f0", color: "var(--brown-mid)" }}>
        <span>Всего: <b style={{ color: "var(--brown-dark)" }}>{completed}</b> проведено</span>
        <span><b style={{ color: "var(--brown-dark)" }}>{cancelled}</b> отменено</span>
        <span><b style={{ color: "var(--brown-dark)" }}>{missed}</b> сгорело</span>
      </div>
      <LessonTable lessons={lessons} title="История занятий (оплата поурочно)" />
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Lesson {
  id: string;
  date: string;
  duration_min?: number | null;
  price_rub?: number | null;
  status: string;
  deducted_amount?: number | null;
}

const COLLAPSED_COUNT = 5;

// Same shape of stats/history as SubscriptionCard, for students who pay per
// lesson instead of by package — they had no summary at all before, since
// the whole card only rendered when there was an active subscription.
export default function LessonHistoryCard({ allLessons }: { allLessons: Record<string, unknown>[] }) {
  const [open, setOpen] = useState(false);
  const lessons = (allLessons as unknown as Lesson[])
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

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
  const visible   = open ? lessons : lessons.slice(0, COLLAPSED_COUNT);

  return (
    <div className="rounded-2xl border p-5 space-y-3" style={{ background: "white", borderColor: "var(--brown-pale)", boxShadow: "var(--shadow-card)" }}>
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--brown-light)" }}>
        История занятий (оплата поурочно)
      </p>
      <div className="flex items-center gap-4 flex-wrap text-xs px-3 py-2 rounded-xl" style={{ background: "#fdf8f0", color: "var(--brown-mid)" }}>
        <span>Всего: <b style={{ color: "var(--brown-dark)" }}>{completed}</b> проведено</span>
        <span><b style={{ color: "var(--brown-dark)" }}>{cancelled}</b> отменено</span>
        <span><b style={{ color: "var(--brown-dark)" }}>{missed}</b> сгорело</span>
      </div>
      <div className="divide-y" style={{ borderColor: "var(--brown-pale)" }}>
        {visible.map(l => {
          const dt = new Date(l.date);
          const dateStr = dt.toLocaleDateString("ru", { day: "numeric", month: "long" });
          const isScheduled = l.status === "scheduled";
          const isMissed    = l.status === "missed";
          const amount      = l.deducted_amount ?? l.price_rub;
          return (
            <div key={l.id} className="flex items-center justify-between py-2.5 gap-2">
              <span className="text-sm" style={{ color: "var(--brown-dark)" }}>
                {dateStr}
                {l.duration_min ? ` · ${l.duration_min} мин` : ""}
                {isMissed && " · пропущено без предупреждения"}
                {isScheduled && " · запланировано"}
              </span>
              <span className="text-sm font-medium shrink-0"
                style={{ color: isMissed ? "#c0392b" : isScheduled ? "var(--brown-light)" : "var(--brown-dark)" }}>
                {amount ? `${amount.toLocaleString("ru")} ₽` : "—"}
              </span>
            </div>
          );
        })}
      </div>
      {lessons.length > COLLAPSED_COUNT && (
        <button onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1 text-xs font-medium hover:opacity-70 transition-all"
          style={{ color: "var(--brown-mid)" }}>
          <ChevronDown size={13} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
          {open ? "Свернуть" : `Показать ещё ${lessons.length - COLLAPSED_COUNT}`}
        </button>
      )}
    </div>
  );
}

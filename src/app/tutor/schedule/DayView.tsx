"use client";

import { computeHourRange, layoutLessons, dateKey, STATUS_BG, STATUS_TEXT, STATUS_LABEL, type TimedLesson } from "./calendarUtils";

const ROW_H = 56; // px per hour

export default function DayView<T extends TimedLesson>({
  date, lessons, onLessonClick,
}: {
  date: Date;
  lessons: T[];
  onLessonClick: (lesson: T) => void;
}) {
  const key = dateKey(date);
  const dayLessons = lessons.filter(l => l.date.slice(0, 10) === key);
  const { startHour, endHour } = computeHourRange(dayLessons);
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const laidOut = layoutLessons(dayLessons);

  const now = new Date();
  const isToday = dateKey(now) === key;
  const nowOffset = isToday ? ((now.getHours() * 60 + now.getMinutes()) / 60 - startHour) * ROW_H : null;

  if (dayLessons.length === 0) {
    return (
      <p className="text-sm py-10 text-center" style={{ color: "var(--brown-light)" }}>
        На этот день занятий нет
      </p>
    );
  }

  return (
    <div className="relative flex" style={{ height: hours.length * ROW_H }}>
      {/* Hour labels */}
      <div className="flex flex-col shrink-0 w-12 text-right pr-2">
        {hours.map(h => (
          <div key={h} className="text-xs" style={{ height: ROW_H, color: "var(--brown-light)" }}>
            {String(h).padStart(2, "0")}:00
          </div>
        ))}
      </div>
      {/* Grid + lessons */}
      <div className="relative flex-1 border-l" style={{ borderColor: "var(--brown-pale)" }}>
        {hours.map((h, i) => (
          <div key={h} className="absolute left-0 right-0 border-t" style={{ top: i * ROW_H, borderColor: "var(--brown-pale)" }} />
        ))}
        {nowOffset !== null && nowOffset >= 0 && nowOffset <= hours.length * ROW_H && (
          <div className="absolute left-0 right-0 z-10 flex items-center" style={{ top: nowOffset }}>
            <div className="w-2 h-2 rounded-full -ml-1" style={{ background: "#e05030" }} />
            <div className="flex-1 h-px" style={{ background: "#e05030" }} />
          </div>
        )}
        {laidOut.map(l => {
          const startMin = parseInt(l.date.slice(11, 13)) * 60 + parseInt(l.date.slice(14, 16));
          const top = ((startMin / 60) - startHour) * ROW_H;
          const height = Math.max(28, ((l.duration_min ?? 60) / 60) * ROW_H - 2);
          const widthPct = 100 / l.cols;
          return (
            <button key={l.id} onClick={() => onLessonClick(l)}
              className="absolute rounded-lg px-2 py-1 text-left overflow-hidden hover:opacity-90 transition-all shadow-sm"
              style={{
                top, height,
                left: `${l.col * widthPct}%`, width: `calc(${widthPct}% - 4px)`,
                background: STATUS_BG[l.status] ?? "#f1f5f9",
                color: STATUS_TEXT[l.status] ?? "#64748b",
                border: `1px solid ${STATUS_TEXT[l.status] ?? "#cbd5e1"}33`,
              }}>
              <div className="text-xs font-semibold truncate">{l.students?.name ?? "Ученик"}</div>
              <div className="text-[11px] truncate opacity-80">
                {l.date.slice(11, 16)} · {STATUS_LABEL[l.status] ?? l.status}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

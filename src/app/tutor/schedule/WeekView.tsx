"use client";

import { computeHourRange, layoutLessons, dateKey, STATUS_BG, STATUS_TEXT, initials, type TimedLesson } from "./calendarUtils";

const ROW_H = 48; // px per hour — a bit tighter than Day view, 7 columns need the room
const WEEKDAYS_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export default function WeekView<T extends TimedLesson>({
  weekStart, lessons, onLessonClick, onDayClick,
}: {
  weekStart: Date; // Monday of the displayed week
  lessons: T[];
  onLessonClick: (lesson: T) => void;
  onDayClick: (date: Date) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const weekKeys = days.map(dateKey);
  const weekLessons = lessons.filter(l => weekKeys.includes(l.date.slice(0, 10)));
  const { startHour, endHour } = computeHourRange(weekLessons);
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const todayKey = dateKey(new Date());

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: 720 }}>
        {/* Day headers */}
        <div className="flex">
          <div className="shrink-0 w-12" />
          {days.map((d, i) => {
            const key = weekKeys[i];
            const isToday = key === todayKey;
            return (
              <button key={key} onClick={() => onDayClick(d)}
                className="flex-1 text-center py-1.5 rounded-lg hover:opacity-80 transition-all"
                style={{ background: isToday ? "var(--brown-pale)" : "transparent" }}>
                <div className="text-xs" style={{ color: "var(--brown-light)" }}>{WEEKDAYS_SHORT[i]}</div>
                <div className="text-sm font-semibold" style={{ color: isToday ? "var(--brown-dark)" : "var(--brown-mid)" }}>
                  {d.getDate()}
                </div>
              </button>
            );
          })}
        </div>
        {/* Grid */}
        <div className="relative flex" style={{ height: hours.length * ROW_H }}>
          <div className="flex flex-col shrink-0 w-12 text-right pr-2">
            {hours.map(h => (
              <div key={h} className="text-xs" style={{ height: ROW_H, color: "var(--brown-light)" }}>
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>
          {days.map((d, di) => {
            const key = weekKeys[di];
            const dayLessons = weekLessons.filter(l => l.date.slice(0, 10) === key);
            const laidOut = layoutLessons(dayLessons);
            return (
              <div key={key} className="relative flex-1 border-l" style={{ borderColor: "var(--brown-pale)" }}>
                {hours.map((h, i) => (
                  <div key={h} className="absolute left-0 right-0 border-t" style={{ top: i * ROW_H, borderColor: "var(--brown-pale)" }} />
                ))}
                {laidOut.map(l => {
                  const startMin = parseInt(l.date.slice(11, 13)) * 60 + parseInt(l.date.slice(14, 16));
                  const top = ((startMin / 60) - startHour) * ROW_H;
                  const height = Math.max(22, ((l.duration_min ?? 60) / 60) * ROW_H - 2);
                  const widthPct = 100 / l.cols;
                  return (
                    <button key={l.id} onClick={() => onLessonClick(l)}
                      className="absolute rounded px-1 py-0.5 text-left overflow-hidden hover:opacity-90 transition-all"
                      style={{
                        top, height,
                        left: `${l.col * widthPct}%`, width: `calc(${widthPct}% - 2px)`,
                        background: STATUS_BG[l.status] ?? "#f1f5f9",
                        color: STATUS_TEXT[l.status] ?? "#64748b",
                      }}>
                      <div className="text-[10px] font-semibold leading-tight truncate">
                        {l.students ? initials(l.students.name) : "?"} {l.date.slice(11, 16)}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

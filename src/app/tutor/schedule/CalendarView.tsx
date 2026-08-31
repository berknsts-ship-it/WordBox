"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DayView from "./DayView";
import WeekView from "./WeekView";
import MonthView from "./MonthView";
import LessonDetailModal from "./LessonDetailModal";
import { dateKey } from "./calendarUtils";

type Lesson = {
  id: string;
  student_id: string;
  date: string;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled" | "missed";
  rescheduled_to?: string | null;
  duration_min?: number | null;
  price_rub?: number | null;
  subscription_id?: string | null;
  deducted_amount?: number | null;
  notes?: string | null;
  payment_status?: "paid" | "unpaid";
  students?: { name: string } | null;
};
type Student     = { id: string; name: string; default_price_rub?: number | null };
type Subscription = { id: string; student_id: string; balance: number; name: string; paid?: boolean };

const MONTHS = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];

function mondayOf(d: Date): Date {
  const wd = d.getDay(); // 0=Sun
  const diff = wd === 0 ? -6 : 1 - wd;
  const m = new Date(d);
  m.setDate(m.getDate() + diff);
  return m;
}

export default function CalendarView({
  lessons, students, subscriptions,
}: {
  lessons: Lesson[];
  students: Student[];
  subscriptions: Subscription[];
}) {
  const [mode, setMode] = useState<"day" | "week" | "month">("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalLesson, setModalLesson] = useState<Lesson | null>(null);

  const goToday = () => setCurrentDate(new Date());
  const goPrev = () => setCurrentDate(d => {
    const next = new Date(d);
    if (mode === "day") next.setDate(next.getDate() - 1);
    else if (mode === "week") next.setDate(next.getDate() - 7);
    else next.setMonth(next.getMonth() - 1);
    return next;
  });
  const goNext = () => setCurrentDate(d => {
    const next = new Date(d);
    if (mode === "day") next.setDate(next.getDate() + 1);
    else if (mode === "week") next.setDate(next.getDate() + 7);
    else next.setMonth(next.getMonth() + 1);
    return next;
  });

  const goToDay = (d: Date) => { setCurrentDate(d); setMode("day"); };

  const weekStart = mondayOf(currentDate);
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6);

  const label = mode === "day"
    ? currentDate.toLocaleDateString("ru", { weekday: "long", day: "numeric", month: "long" })
    : mode === "week"
    ? `${weekStart.getDate()} ${MONTHS[weekStart.getMonth()].slice(0,3)} – ${weekEnd.getDate()} ${MONTHS[weekEnd.getMonth()].slice(0,3)}`
    : `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const modeTabBase = "px-3 py-1.5 rounded-lg text-sm font-medium transition-all";
  const isTodayShown = mode === "day" && dateKey(currentDate) === dateKey(new Date());

  return (
    <div>
      {/* View switcher + navigation */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex gap-1 rounded-xl p-1" style={{ background: "#f5efe4" }}>
          {(["day","week","month"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={modeTabBase}
              style={mode === m ? { background: "white", color: "var(--brown-dark)", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" } : { color: "var(--brown-mid)" }}>
              {m === "day" ? "День" : m === "week" ? "Неделя" : "Месяц"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goPrev} className="p-2 rounded-xl hover:opacity-70 transition-all" style={{ color: "var(--brown-mid)" }}>
            <ChevronLeft size={18}/>
          </button>
          <span className="text-sm font-semibold min-w-[150px] text-center capitalize" style={{ color: "var(--brown-dark)" }}>
            {label}
          </span>
          <button onClick={goNext} className="p-2 rounded-xl hover:opacity-70 transition-all" style={{ color: "var(--brown-mid)" }}>
            <ChevronRight size={18}/>
          </button>
          <button onClick={goToday} disabled={isTodayShown}
            className="px-3 py-1.5 rounded-xl text-sm font-medium border transition-all disabled:opacity-40"
            style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)" }}>
            Сегодня
          </button>
        </div>
      </div>

      {mode === "day" && (
        <DayView date={currentDate} lessons={lessons} onLessonClick={setModalLesson} />
      )}
      {mode === "week" && (
        <WeekView weekStart={weekStart} lessons={lessons} onLessonClick={setModalLesson} onDayClick={goToDay} />
      )}
      {mode === "month" && (
        <MonthView year={currentDate.getFullYear()} month={currentDate.getMonth()}
          lessons={lessons} students={students} subscriptions={subscriptions}
          onLessonClick={setModalLesson} onDayClick={goToDay} />
      )}

      {modalLesson && (
        <LessonDetailModal lesson={modalLesson} subscriptions={subscriptions} onClose={() => setModalLesson(null)} />
      )}
    </div>
  );
}

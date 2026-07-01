"use client";

import { useRef } from "react";
import { updateLessonStatusForm } from "@/app/actions/lessons";

export const STATUS_CONFIG = {
  scheduled:   { label: "Запланирован",  color: "bg-[#f5ece3] text-[#74070E]",    dot: "bg-[#74070E]" },
  completed:   { label: "Проведён",      color: "bg-[#e6efea] text-[#4a7a5e]", dot: "bg-[#6ea882]" },
  rescheduled: { label: "Перенесён",     color: "bg-[#e8eff5] text-[#4a6580]",       dot: "bg-[#7a9ab8]" },
  cancelled:   { label: "Отменён",       color: "bg-stone-100 text-stone-500",    dot: "bg-stone-300" },
  burnt:       { label: "Сгорел",        color: "bg-red-50 text-red-600",         dot: "bg-red-400" },
} as const;

type Status = keyof typeof STATUS_CONFIG;

export default function LessonStatusPicker({
  lessonId,
  studentId,
  currentStatus,
}: {
  lessonId: string;
  studentId: string;
  currentStatus: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const config = STATUS_CONFIG[currentStatus as Status] ?? STATUS_CONFIG.scheduled;

  return (
    <form ref={formRef} action={updateLessonStatusForm}>
      <input type="hidden" name="id" value={lessonId} />
      <input type="hidden" name="studentId" value={studentId} />
      <div className="relative">
        <select
          name="status"
          defaultValue={currentStatus}
          onChange={() => formRef.current?.requestSubmit()}
          className={`appearance-none text-xs font-semibold pl-2.5 pr-6 py-1 rounded-full cursor-pointer focus:outline-none ${config.color}`}
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 6px center" }}
        >
          {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
    </form>
  );
}

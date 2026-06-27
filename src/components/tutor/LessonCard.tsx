"use client";

import { useState, useTransition } from "react";
import { updateLesson, deleteLesson, togglePaymentStatus } from "@/app/actions/lessons";
import LessonStatusPicker, { STATUS_CONFIG } from "@/components/tutor/LessonStatusPicker";

type Lesson = {
  id: string;
  date: string;
  topic: string | null;
  notes: string | null;
  duration_minutes: number;
  status: string;
  payment_status: string | null;
  price_rub: number | null;
};

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function LessonCard({ lesson, studentId }: { lesson: Lesson; studentId: string }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  const date = new Date(lesson.date);
  const isPast = date < new Date();
  const isCancelled = lesson.status === "cancelled";
  const payStatus = (lesson.payment_status ?? "unpaid") as "paid" | "unpaid";

  const dotColor = lesson.status === "completed" ? "#6ea882" : isPast ? "#c49090" : "#74070E";

  return (
    <div className="bg-white/80 rounded-2xl border overflow-hidden" style={{ borderColor: "var(--brown-pale)" }}>
      {/* Заголовок карточки */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dotColor }} />
              <p className="font-semibold text-sm truncate" style={{ color: "var(--brown-dark)" }}>
                {lesson.topic || "Урок английского"}
              </p>
            </div>
            <p className="text-xs ml-4" style={{ color: "var(--brown-light)" }}>
              {date.toLocaleDateString("ru", { day: "numeric", month: "long", weekday: "short" })}
              {" · "}{date.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })}
              {" · "}{lesson.duration_minutes} мин
              {lesson.price_rub ? ` · ${lesson.price_rub.toLocaleString("ru")} ₽` : ""}
            </p>
            {lesson.notes && !editing && (
              <p className="text-xs ml-4 mt-1 italic" style={{ color: "var(--brown-light)" }}>
                {lesson.notes}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing(e => !e)}
                className="text-xs px-2 py-1 rounded-lg transition-all font-semibold"
                style={editing
                  ? { background: "var(--brown-mid)", color: "#fff" }
                  : { background: "var(--brown-pale)", color: "var(--brown-light)" }}
              >
                {editing ? "✕" : "✏ Изменить"}
              </button>
              <LessonStatusPicker lessonId={lesson.id} studentId={studentId} currentStatus={lesson.status} />
              <form action={deleteLesson.bind(null, lesson.id, studentId)}>
                <button type="submit" className="text-xs text-red-400 hover:text-red-600 px-2 py-1">✕</button>
              </form>
            </div>

            {!isCancelled && !editing && (
              <form action={togglePaymentStatus.bind(null, lesson.id, payStatus)}>
                <button
                  type="submit"
                  className="text-xs font-semibold px-3 py-1 rounded-xl transition-all"
                  style={payStatus === "paid"
                    ? { background: "#dcfce7", color: "#166534" }
                    : { background: "#fff7ed", color: "#9a3412" }}
                >
                  {payStatus === "paid" ? "✓ Оплачено" : "₽ Не оплачено"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Форма редактирования */}
      {editing && (
        <form
          action={(fd) => {
            startTransition(async () => {
              await updateLesson(fd);
              setEditing(false);
            });
          }}
          className="border-t px-4 pb-4 pt-3 space-y-3"
          style={{ borderColor: "var(--brown-pale)", background: "var(--cream)" }}
        >
          <input type="hidden" name="id" value={lesson.id} />
          <input type="hidden" name="student_id" value={studentId} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>Дата и время</label>
              <input
                name="date" type="datetime-local" required
                defaultValue={toDatetimeLocal(lesson.date)}
                className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
                style={{ background: "#fff", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>Длительность (мин)</label>
              <input
                name="duration_minutes" type="number" min={15} max={180}
                defaultValue={lesson.duration_minutes}
                className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
                style={{ background: "#fff", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>Тема</label>
              <input
                name="topic" defaultValue={lesson.topic ?? ""}
                placeholder="Present Perfect..."
                className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
                style={{ background: "#fff", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>Стоимость (₽)</label>
              <input
                name="price_rub" type="number" min={0}
                defaultValue={lesson.price_rub ?? ""}
                placeholder="1500"
                className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
                style={{ background: "#fff", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>Заметки</label>
            <textarea
              name="notes" rows={2} defaultValue={lesson.notes ?? ""}
              placeholder="Что прошли, что задали..."
              className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none resize-none"
              style={{ background: "#fff", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>Статус урока</label>
              <select
                name="status" defaultValue={lesson.status}
                className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
                style={{ background: "#fff", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
              >
                {Object.entries(STATUS_CONFIG).map(([v, { label }]) => (
                  <option key={v} value={v}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>Оплата</label>
              <select
                name="payment_status" defaultValue={payStatus}
                className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
                style={{ background: "#fff", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
              >
                <option value="unpaid">Не оплачено</option>
                <option value="paid">Оплачено</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit" disabled={pending}
              className="flex-1 rounded-xl py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80"
              style={{ background: "var(--gradient-primary)", opacity: pending ? 0.6 : 1 }}
            >
              {pending ? "Сохраняю..." : "Сохранить"}
            </button>
            <button
              type="button" onClick={() => setEditing(false)}
              className="px-4 rounded-xl py-2 text-sm font-semibold"
              style={{ background: "var(--brown-pale)", color: "var(--brown-dark)" }}
            >
              Отмена
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

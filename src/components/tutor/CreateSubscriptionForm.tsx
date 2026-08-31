"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSubscription } from "@/app/actions/subscriptions";
import { CreditCard } from "lucide-react";

// Только быстрый ввод суммы — без предположений о количестве занятий:
// сколько уроков войдёт в абонемент зависит от цены урока конкретного
// ученика, которую этот пресет не знает и знать не может.
const AMOUNT_PRESETS = [4000, 8000, 12000];

// Дни недели, а не «раз в неделю от даты первого занятия» — у части учеников
// занятия дважды в неделю (напр. Пн+Чт), у части один раз, порядок JS
// getDay(): Вс=0 ... Сб=6, но в интерфейсе показываем в привычном Пн-Вс.
const WEEKDAYS = [
  { v: 1, label: "Пн" },
  { v: 2, label: "Вт" },
  { v: 3, label: "Ср" },
  { v: 4, label: "Чт" },
  { v: 5, label: "Пт" },
  { v: 6, label: "Сб" },
  { v: 0, label: "Вс" },
];

export default function CreateSubscriptionForm({ studentId, studentName }: { studentId: string; studentName: string }) {
  const router = useRouter();
  const [name, setName]       = useState("");
  const [amount, setAmount]   = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const [scheduleNow, setScheduleNow] = useState(false);
  // Package size — shown always (feeds "6 из 8 занятий" in the summary),
  // not just when auto-scheduling; scheduleNow reuses the same value rather
  // than asking for it twice.
  const [lessonCount, setLessonCount] = useState("");
  const [firstDate,   setFirstDate]   = useState("");
  const [time,        setTime]        = useState("");
  const [duration,    setDuration]    = useState("60");
  const [weekdays,    setWeekdays]    = useState<number[]>([]);

  const countNum = parseInt(lessonCount) || 0;
  const amountNum = parseInt(amount) || 0;
  const perLesson = scheduleNow && countNum > 0 && amountNum > 0 ? Math.round(amountNum / countNum) : null;

  function handleFirstDateChange(v: string) {
    setFirstDate(v);
    // Первая дата задаёт день недели по умолчанию, если тьютор ещё не
    // выбирал дни вручную — дальше можно добавить второй/третий день.
    if (weekdays.length === 0 && v) {
      setWeekdays([new Date(`${v}T00:00:00`).getDay()]);
    }
  }

  function toggleWeekday(v: number) {
    setWeekdays(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v].sort());
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("name", name || "Абонемент");
      fd.set("total_amount", amount);
      if (lessonCount.trim()) fd.set("lesson_count", lessonCount);
      if (scheduleNow) {
        fd.set("first_date", firstDate);
        fd.set("time", time);
        fd.set("duration_min", duration);
        fd.set("weekdays", weekdays.join(","));
      }
      const result = await createSubscription(studentId, fd);
      if (result?.error) setError(result.error);
      else router.refresh();
    } catch {
      setError("Не удалось создать абонемент");
    } finally {
      setLoading(false);
    }
  }

  const card = { background: "white", borderColor: "var(--brown-pale)", boxShadow: "var(--shadow-card)" };

  if (!open) {
    return (
      <div className="rounded-2xl border p-6 text-center" style={card}>
        <CreditCard size={32} className="mx-auto mb-3" style={{ color: "var(--brown-light)" }} />
        <p className="font-medium mb-1" style={{ color: "var(--brown-dark)" }}>Нет активного абонемента</p>
        <p className="text-sm mb-4" style={{ color: "var(--brown-mid)" }}>
          {studentName} оплачивает занятия поурочно
        </p>
        <button onClick={() => setOpen(true)}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: "var(--gradient-primary)" }}>
          Создать абонемент
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-5" style={card}>
      <h2 className="font-semibold mb-4" style={{ color: "var(--brown-dark)" }}>Новый абонемент</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm mb-1 block" style={{ color: "var(--brown-mid)" }}>Название</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Например: Август"
            className="w-full px-3 py-2 rounded-xl border outline-none text-sm"
            style={{ borderColor: "var(--brown-pale)", background: "#fdf8f0" }} />
        </div>
        <div>
          <label className="text-sm mb-1 block" style={{ color: "var(--brown-mid)" }}>Сумма абонемента, ₽</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {AMOUNT_PRESETS.map(a => (
              <button key={a} type="button"
                onClick={() => setAmount(String(a))}
                className="text-xs px-3 py-1.5 rounded-lg border hover:opacity-80 transition-all"
                style={{
                  borderColor: amount === String(a) ? "var(--brown-dark)" : "var(--brown-pale)",
                  background:  amount === String(a) ? "var(--brown-pale)" : "white",
                  color: "var(--brown-dark)",
                }}>
                {a.toLocaleString("ru")} ₽
              </button>
            ))}
          </div>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="Или введите сумму" min="100" step="100" required
            className="w-full px-3 py-2 rounded-xl border outline-none text-sm"
            style={{ borderColor: "var(--brown-pale)", background: "#fdf8f0" }} />
        </div>
        <div>
          <label className="text-sm mb-1 block" style={{ color: "var(--brown-mid)" }}>Количество занятий (необязательно)</label>
          <input type="number" value={lessonCount} onChange={e => setLessonCount(e.target.value)}
            placeholder="Например: 8" min="1" max="52"
            className="w-full px-3 py-2 rounded-xl border outline-none text-sm"
            style={{ borderColor: "var(--brown-pale)", background: "#fdf8f0" }} />
          <p className="text-xs mt-1" style={{ color: "var(--brown-light)" }}>
            Если укажете — сводка будет показывать «6 из 8 занятий», а не только сумму.
          </p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "var(--brown-dark)" }}>
          <input type="checkbox" checked={scheduleNow} onChange={e => setScheduleNow(e.target.checked)}
            className="w-4 h-4 accent-amber-700" />
          Сразу назначить дни занятий
        </label>

        {scheduleNow && (
          <div className="grid grid-cols-2 gap-2 p-3 rounded-xl" style={{ background: "#fdf8f0", border: "1px solid var(--brown-pale)" }}>
            <div className="col-span-2">
              <label className="text-xs mb-1 block" style={{ color: "var(--brown-mid)" }}>Дата первого занятия</label>
              <input type="date" value={firstDate} onChange={e => handleFirstDateChange(e.target.value)}
                required={scheduleNow}
                className="w-full px-3 py-2 rounded-xl border outline-none text-sm"
                style={{ borderColor: "var(--brown-pale)", background: "white" }} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--brown-mid)" }}>Время</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                required={scheduleNow}
                className="w-full px-3 py-2 rounded-xl border outline-none text-sm"
                style={{ borderColor: "var(--brown-pale)", background: "white" }} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--brown-mid)" }}>Длительность</label>
              <select value={duration} onChange={e => setDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border outline-none text-sm"
                style={{ borderColor: "var(--brown-pale)", background: "white" }}>
                <option value="30">30 мин</option>
                <option value="45">45 мин</option>
                <option value="60">1 час</option>
                <option value="90">1.5 часа</option>
                <option value="120">2 часа</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs mb-1 block" style={{ color: "var(--brown-mid)" }}>
                Дни недели {weekdays.length > 1 && `(${weekdays.length} раза в неделю)`}
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {WEEKDAYS.map(w => (
                  <button key={w.v} type="button" onClick={() => toggleWeekday(w.v)}
                    className="w-9 h-9 rounded-lg border text-xs font-medium transition-all"
                    style={{
                      borderColor: weekdays.includes(w.v) ? "var(--brown-dark)" : "var(--brown-pale)",
                      background:  weekdays.includes(w.v) ? "var(--brown-pale)" : "white",
                      color: "var(--brown-dark)",
                    }}>
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="col-span-2 text-xs" style={{ color: "var(--brown-mid)" }}>
              {!lessonCount.trim()
                ? "Укажите количество занятий выше, чтобы расставить их по дням."
                : weekdays.length === 0
                ? "Выберите хотя бы один день недели."
                : "Занятия встанут по выбранным дням, начиная с указанной даты."}
              {perLesson !== null && ` Цена одного занятия: ${perLesson.toLocaleString("ru")} ₽ (${amountNum.toLocaleString("ru")} ÷ ${countNum}).`}
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={loading || !amount || (scheduleNow && (weekdays.length === 0 || !lessonCount.trim()))}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: "var(--gradient-primary)" }}>
            {loading ? "Создаём..." : "Создать абонемент"}
          </button>
          <button type="button" onClick={() => setOpen(false)}
            className="px-4 py-2 rounded-xl border text-sm"
            style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)" }}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}

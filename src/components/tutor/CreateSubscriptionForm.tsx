"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSubscription } from "@/app/actions/subscriptions";
import { CreditCard } from "lucide-react";

// Только быстрый ввод суммы — без предположений о количестве занятий:
// сколько уроков войдёт в абонемент зависит от цены урока конкретного
// ученика, которую этот пресет не знает и знать не может.
const AMOUNT_PRESETS = [4000, 8000, 12000];

export default function CreateSubscriptionForm({ studentId, studentName }: { studentId: string; studentName: string }) {
  const router = useRouter();
  const [name, setName]       = useState("");
  const [amount, setAmount]   = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const [scheduleNow, setScheduleNow] = useState(false);
  const [lessonCount, setLessonCount] = useState("8");
  const [firstDate,   setFirstDate]   = useState("");
  const [time,        setTime]        = useState("");
  const [duration,    setDuration]    = useState("60");

  const countNum = parseInt(lessonCount) || 0;
  const amountNum = parseInt(amount) || 0;
  const perLesson = scheduleNow && countNum > 0 && amountNum > 0 ? Math.round(amountNum / countNum) : null;

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("name", name || "Абонемент");
      fd.set("total_amount", amount);
      if (scheduleNow) {
        fd.set("lesson_count", lessonCount);
        fd.set("first_date", firstDate);
        fd.set("time", time);
        fd.set("duration_min", duration);
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

        <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "var(--brown-dark)" }}>
          <input type="checkbox" checked={scheduleNow} onChange={e => setScheduleNow(e.target.checked)}
            className="w-4 h-4 accent-amber-700" />
          Сразу назначить дни занятий
        </label>

        {scheduleNow && (
          <div className="grid grid-cols-2 gap-2 p-3 rounded-xl" style={{ background: "#fdf8f0", border: "1px solid var(--brown-pale)" }}>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs mb-1 block" style={{ color: "var(--brown-mid)" }}>Количество занятий</label>
              <input type="number" value={lessonCount} onChange={e => setLessonCount(e.target.value)}
                min="1" max="52" required={scheduleNow}
                className="w-full px-3 py-2 rounded-xl border outline-none text-sm"
                style={{ borderColor: "var(--brown-pale)", background: "white" }} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs mb-1 block" style={{ color: "var(--brown-mid)" }}>Дата первого занятия</label>
              <input type="date" value={firstDate} onChange={e => setFirstDate(e.target.value)}
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
            <p className="col-span-2 text-xs" style={{ color: "var(--brown-mid)" }}>
              Занятия встанут еженедельно, начиная с выбранной даты.
              {perLesson !== null && ` Цена одного занятия: ${perLesson.toLocaleString("ru")} ₽ (${amountNum.toLocaleString("ru")} ÷ ${countNum}).`}
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={loading || !amount}
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

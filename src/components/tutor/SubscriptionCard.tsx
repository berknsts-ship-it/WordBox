"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { renewSubscription, cancelSubscription, deleteSubscription, toggleSubscriptionPaid, updateSubscriptionAmount } from "@/app/actions/subscriptions";
import { Pencil } from "lucide-react";
import LessonTable from "./LessonTable";

interface Lesson {
  id: string;
  date: string;
  duration_min?: number | null;
  price_rub?: number | null;
  status: string;
  deducted_amount?: number | null;
  notes?: string | null;
  subscription_id?: string | null;
  date_history?: string[] | null;
}

interface Sub {
  id: string;
  name: string;
  total_amount: number;
  balance: number;
  created_at: string;
  paid?: boolean;
  lesson_count?: number | null;
}

interface Student {
  id: string;
  name: string;
}

export default function SubscriptionCard({
  subscription: sub,
  student,
  allLessons,
  studentId,
}: {
  subscription: Sub;
  student: Student;
  allLessons: Record<string, unknown>[];
  studentId: string;
}) {
  const router = useRouter();
  const [renewMode, setRenewMode] = useState(false);
  const [renewByLessons, setRenewByLessons] = useState(true);
  const [addLessons, setAddLessons] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editAmount, setEditAmount] = useState(String(sub.total_amount));
  const [editLessonCount, setEditLessonCount] = useState(sub.lesson_count ? String(sub.lesson_count) : "");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(sub.paid ?? false);
  const [payLoading, setPayLoading] = useState(false);
  const [confirmUnpay, setConfirmUnpay] = useState(false);

  const all = allLessons as unknown as Lesson[];
  // Newest first — allLessons already comes pre-sorted from the page query,
  // but don't depend on caller ordering here.
  const subLessons = all.filter(l => l.subscription_id === sub.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const spent = sub.total_amount - sub.balance;
  const pct   = sub.total_amount > 0 ? Math.min(100, Math.round((spent / sub.total_amount) * 100)) : 0;
  const doneCount = subLessons.filter(l => l.deducted_amount).length;

  const lessonCount = sub.lesson_count ?? null;
  const lessonsLeft = lessonCount !== null ? lessonCount - doneCount : null;

  // Status: lesson-count based when the package size is known (matches how
  // the tutor actually thinks about it — "8 занятий"), falls back to the
  // money percentage for older subscriptions that don't have one set.
  type Level = "ok" | "warn" | "danger";
  const level: Level = lessonsLeft !== null
    ? (lessonsLeft <= 0 ? "danger" : lessonsLeft <= 2 ? "warn" : "ok")
    : (sub.balance <= 0 ? "danger" : pct >= 80 ? "warn" : "ok");
  const levelLabel = level === "danger" ? "Закончился — продлить" : level === "warn" ? "Заканчивается" : "Активен";
  const levelColor = level === "danger" ? "#c0392b" : level === "warn" ? "#c07800" : "#1a7a3a";
  const levelBg    = level === "danger" ? "#fdecea" : level === "warn" ? "#fff3e0" : "#e8f7ec";

  // All-time counts across every subscription this student has ever had —
  // separate from the active package's own progress above.
  const lifetimeCompleted = all.filter(l => l.status === "completed").length;
  const lifetimeCancelled = all.filter(l => l.status === "cancelled").length;
  const lifetimeMissed    = all.filter(l => l.status === "missed").length;

  const createdDate = new Date(sub.created_at).toLocaleDateString("ru", {
    day: "numeric", month: "long",
  });

  const initials = student.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const addLessonsNum = parseInt(addLessons) || 0;
  const impliedAmount = lessonCount && addLessonsNum > 0
    ? Math.round((sub.total_amount / lessonCount) * addLessonsNum)
    : null;

  async function handleRenew(fd: FormData) {
    setLoading(true);
    setError(null);
    try {
      const result = await renewSubscription(sub.id, studentId, fd);
      if (result?.error) setError(result.error);
      else { setRenewMode(false); setAddAmount(""); setAddLessons(""); router.refresh(); }
    } catch {
      setError("Не удалось пополнить");
    } finally {
      setLoading(false);
    }
  }

  async function handleEditAmount(fd: FormData) {
    setEditLoading(true);
    setEditError(null);
    try {
      const result = await updateSubscriptionAmount(sub.id, studentId, fd);
      if (result?.error) setEditError(result.error);
      else { setEditMode(false); router.refresh(); }
    } catch {
      setEditError("Не удалось изменить сумму");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleTogglePaid() {
    if (paid) { setConfirmUnpay(true); return; }
    setPayLoading(true);
    await toggleSubscriptionPaid(sub.id, studentId, paid);
    setPaid(true);
    setPayLoading(false);
  }

  async function confirmUnmarkPaid() {
    setConfirmUnpay(false);
    setPayLoading(true);
    await toggleSubscriptionPaid(sub.id, studentId, paid);
    setPaid(false);
    setPayLoading(false);
  }

  async function handleCancel() {
    if (!window.confirm("Перевести ученика на разовую оплату? Абонемент будет закрыт.")) return;
    setCancelling(true);
    setError(null);
    try {
      const result = await cancelSubscription(sub.id, studentId);
      if (result?.error) setError(result.error);
      else router.refresh();
    } catch {
      setError("Не удалось отменить");
    } finally {
      setCancelling(false);
    }
  }

  // Actually deletes the row — for "создала по ошибке", not a subscription
  // that really ran its course (that's handleCancel above).
  async function handleDelete() {
    if (!window.confirm(`Удалить абонемент «${sub.name}» насовсем? Это нельзя отменить.`)) return;
    setCancelling(true);
    setError(null);
    try {
      const result = await deleteSubscription(sub.id, studentId);
      if (result?.error) setError(result.error);
      else router.refresh();
    } catch {
      setError("Не удалось удалить");
    } finally {
      setCancelling(false);
    }
  }

  const card = { background: "white", borderColor: "var(--brown-pale)", boxShadow: "var(--shadow-card)" };

  return (
    <div className="rounded-2xl border p-5 space-y-4" style={card}>
      {/* Шапка */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold shrink-0"
            style={{ background: "var(--gradient-primary)", fontSize: 15 }}>
            {initials}
          </div>
          <div>
            <div className="font-semibold" style={{ color: "var(--brown-dark)" }}>{student.name}</div>
            <div className="text-sm" style={{ color: "var(--brown-light)" }}>
              Абонемент «{sub.name}» · куплен {createdDate}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          {lessonsLeft !== null ? (
            <>
              <div className="text-xs" style={{ color: "var(--brown-light)" }}>Осталось занятий</div>
              <div className="text-2xl font-bold" style={{ color: levelColor }}>
                {Math.max(0, lessonsLeft)}
              </div>
            </>
          ) : (
            <>
              <div className="text-xs" style={{ color: "var(--brown-light)" }}>Остаток</div>
              <div className="text-2xl font-bold" style={{ color: sub.balance < 0 ? "#c0392b" : "var(--brown-dark)" }}>
                {sub.balance.toLocaleString("ru")} ₽
              </div>
            </>
          )}
        </div>
      </div>

      {/* Статус-бейдж */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: levelBg, color: levelColor }}>
          {levelLabel}
        </span>
        {/* Оплата абонемента целиком */}
        {!confirmUnpay ? (
          <button
            onClick={handleTogglePaid}
            disabled={payLoading}
            className="px-3 py-1 rounded-full text-xs font-semibold transition-all hover:opacity-80"
            style={{
              background: paid ? "#d8f5e0" : "#fff3e0",
              color:      paid ? "#1a7a3a" : "#c07800",
              border:     `1.5px solid ${paid ? "#b0e8c0" : "#f0d090"}`,
            }}>
            {payLoading ? "..." : paid ? "✓ Оплачен" : "₽ Не оплачен"}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: "var(--brown-mid)" }}>Снять отметку об оплате?</span>
            <button onClick={confirmUnmarkPaid} className="text-sm px-3 py-1 rounded-lg font-semibold text-white"
              style={{ background: "#e05030" }}>Снять</button>
            <button onClick={() => setConfirmUnpay(false)} className="text-sm px-3 py-1 rounded-lg border"
              style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)" }}>Отмена</button>
          </div>
        )}
      </div>

      {/* Прогресс */}
      <div>
        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "var(--brown-pale)" }}>
          <div className="h-full rounded-full transition-all"
            style={{
              width: `${lessonCount ? Math.min(100, Math.round((doneCount / lessonCount) * 100)) : pct}%`,
              background: level === "danger" ? "#e05030" : level === "warn" ? "#e0a020" : "#4caf7a",
            }} />
        </div>
        {editMode ? (
          <form action={handleEditAmount} className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-sm shrink-0" style={{ color: "var(--brown-mid)" }}>Сумма, ₽</span>
            <input
              name="total_amount" type="number" min="100" step="100" required
              value={editAmount} onChange={e => setEditAmount(e.target.value)}
              className="w-28 px-3 py-1.5 rounded-xl border outline-none text-sm"
              style={{ borderColor: "var(--brown-pale)", background: "#fdf8f0" }} />
            <span className="text-sm shrink-0" style={{ color: "var(--brown-mid)" }}>Занятий</span>
            <input
              name="lesson_count" type="number" min="1" max="200" placeholder="—"
              value={editLessonCount} onChange={e => setEditLessonCount(e.target.value)}
              className="w-20 px-3 py-1.5 rounded-xl border outline-none text-sm"
              style={{ borderColor: "var(--brown-pale)", background: "#fdf8f0" }} />
            <button type="submit" disabled={editLoading}
              className="px-3 py-1.5 rounded-xl text-sm font-semibold text-white shrink-0"
              style={{ background: "var(--gradient-primary)", opacity: editLoading ? 0.7 : 1 }}>
              Сохранить
            </button>
            <button type="button" onClick={() => { setEditMode(false); setEditAmount(String(sub.total_amount)); setEditLessonCount(sub.lesson_count ? String(sub.lesson_count) : ""); setEditError(null); }}
              className="px-3 py-1.5 rounded-xl text-sm border shrink-0"
              style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)" }}>
              Отмена
            </button>
          </form>
        ) : (
        <p className="text-sm mt-1.5 flex items-center gap-1.5 flex-wrap" style={{ color: "var(--brown-mid)" }}>
          {lessonCount
            ? `Проведено ${doneCount} из ${lessonCount} занятий`
            : `Списано ${spent.toLocaleString("ru")} ₽ из ${sub.total_amount.toLocaleString("ru")} ₽`}
          <button onClick={() => setEditMode(true)} title="Изменить сумму/количество занятий"
            className="p-0.5 rounded hover:opacity-70 transition-opacity" style={{ color: "var(--brown-light)" }}>
            <Pencil size={12} />
          </button>
          {lessonCount
            ? ` · ${spent.toLocaleString("ru")} ₽ из ${sub.total_amount.toLocaleString("ru")} ₽`
            : (doneCount > 0 && ` за ${doneCount} ${doneCount === 1 ? "занятие" : doneCount < 5 ? "занятия" : "занятий"}`)}
        </p>
        )}
        {editError && <p className="text-sm text-red-600 mt-1">{editError}</p>}
      </div>

      {/* Всего за всё время */}
      <div className="flex items-center gap-4 flex-wrap text-xs px-3 py-2 rounded-xl" style={{ background: "#fdf8f0", color: "var(--brown-mid)" }}>
        <span>Всего с начала: <b style={{ color: "var(--brown-dark)" }}>{lifetimeCompleted}</b> проведено</span>
        <span><b style={{ color: "var(--brown-dark)" }}>{lifetimeCancelled}</b> отменено</span>
        <span><b style={{ color: "var(--brown-dark)" }}>{lifetimeMissed}</b> сгорело</span>
      </div>

      {/* История уроков — настоящая таблица: дата, длительность, статус,
          сумма, история переносов (если было). Свежие сверху. */}
      {subLessons.length > 0 ? (
        <LessonTable lessons={subLessons} title="История занятий" />
      ) : (
        <p className="text-sm" style={{ color: "var(--brown-light)" }}>
          Уроков по этому абонементу ещё нет. Добавляйте уроки в расписании — они автоматически привяжутся.
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Пополнение */}
      {renewMode && (
        <form action={handleRenew} className="space-y-2 pt-1">
          {lessonCount ? (
            <div className="flex items-center gap-2 flex-wrap">
              {renewByLessons ? (
                <>
                  <input name="add_lessons" type="number" min="1" step="1" placeholder="Сколько занятий добавить"
                    value={addLessons} onChange={e => setAddLessons(e.target.value)} required
                    className="flex-1 min-w-[140px] px-3 py-2 rounded-xl border outline-none text-sm"
                    style={{ borderColor: "var(--brown-pale)", background: "#fdf8f0" }} />
                  <button type="button" onClick={() => setRenewByLessons(false)}
                    className="text-xs underline shrink-0" style={{ color: "var(--brown-light)" }}>
                    указать сумму
                  </button>
                </>
              ) : (
                <>
                  <input name="add_amount" type="number" min="100" step="100" placeholder="Сумма пополнения, ₽"
                    value={addAmount} onChange={e => setAddAmount(e.target.value)} required
                    className="flex-1 min-w-[140px] px-3 py-2 rounded-xl border outline-none text-sm"
                    style={{ borderColor: "var(--brown-pale)", background: "#fdf8f0" }} />
                  <button type="button" onClick={() => setRenewByLessons(true)}
                    className="text-xs underline shrink-0" style={{ color: "var(--brown-light)" }}>
                    указать занятия
                  </button>
                </>
              )}
              <button type="submit" disabled={loading}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: "var(--gradient-primary)", opacity: loading ? 0.7 : 1 }}>
                Пополнить
              </button>
              <button type="button" onClick={() => setRenewMode(false)}
                className="px-3 py-2 rounded-xl text-sm border"
                style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)" }}>
                Отмена
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input name="add_amount" type="number" min="100" step="100" placeholder="Сумма пополнения, ₽"
                value={addAmount} onChange={e => setAddAmount(e.target.value)} required
                className="flex-1 px-3 py-2 rounded-xl border outline-none text-sm"
                style={{ borderColor: "var(--brown-pale)", background: "#fdf8f0" }} />
              <button type="submit" disabled={loading}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: "var(--gradient-primary)", opacity: loading ? 0.7 : 1 }}>
                Пополнить
              </button>
              <button type="button" onClick={() => setRenewMode(false)}
                className="px-3 py-2 rounded-xl text-sm border"
                style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)" }}>
                Отмена
              </button>
            </div>
          )}
          {impliedAmount !== null && renewByLessons && (
            <p className="text-xs" style={{ color: "var(--brown-light)" }}>
              ≈ {impliedAmount.toLocaleString("ru")} ₽ по текущей цене занятия
            </p>
          )}
        </form>
      )}

      {/* Кнопки */}
      {!renewMode && (
        <div className="space-y-2 pt-1">
          <div className="flex gap-2">
            <button onClick={() => setRenewMode(true)}
              className="flex-1 py-2 rounded-xl border text-sm font-medium hover:opacity-80 transition-all"
              style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)" }}>
              Продлить абонемент
            </button>
            <button onClick={handleCancel} disabled={cancelling}
              className="flex-1 py-2 rounded-xl border text-sm font-medium hover:opacity-80 transition-all"
              style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)", opacity: cancelling ? 0.5 : 1 }}>
              Перевести на разовую оплату
            </button>
          </div>
          <button onClick={handleDelete} disabled={cancelling}
            className="w-full text-xs text-center hover:underline"
            style={{ color: "#c0392b", opacity: cancelling ? 0.5 : 1 }}>
            Удалить абонемент насовсем (если создан по ошибке)
          </button>
        </div>
      )}
    </div>
  );
}

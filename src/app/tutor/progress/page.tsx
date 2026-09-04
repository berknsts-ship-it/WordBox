import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProgressTable, { type ProgressRow } from "@/components/tutor/ProgressTable";

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const tutorId = user!.id;

  const { data: students } = await supabase
    .from("students")
    .select("id, name, last_seen_at")
    .eq("tutor_id", tutorId)
    .order("name");

  const studentIds = (students ?? []).map(s => s.id);

  const [
    { data: activity },
    { data: grammarAssignments },
    { data: trainerProgress },
    { data: tests },
    { data: lessons },
    { data: subscriptions },
  ] = await Promise.all([
    supabase.from("activity_log")
      .select("student_id, event_type")
      .eq("tutor_id", tutorId)
      .in("event_type", ["trainer_completed", "grammar_completed"]),
    studentIds.length
      ? supabase.from("grammar_assignments").select("student_id, status, score, max_score").in("student_id", studentIds)
      : Promise.resolve({ data: [] }),
    studentIds.length
      ? supabase.from("trainer_progress").select("student_id, status").in("student_id", studentIds)
      : Promise.resolve({ data: [] }),
    supabase.from("tests")
      .select("student_id, status, stars")
      .eq("tutor_id", tutorId),
    supabase.from("lessons")
      .select("student_id, subscription_id, deducted_amount")
      .eq("tutor_id", tutorId),
    supabase.from("student_subscriptions")
      .select("id, student_id, lesson_count, status")
      .eq("tutor_id", tutorId)
      .eq("status", "active"),
  ]);

  // Наборы лексики — только по логу активности (нет отдельной таблицы
  // "набор пройден", см. миграцию activity_log).
  const lexiconDoneMap: Record<string, number> = {};
  const grammarDoneFromLogMap: Record<string, number> = {};
  for (const a of activity ?? []) {
    if (a.event_type === "trainer_completed") lexiconDoneMap[a.student_id] = (lexiconDoneMap[a.student_id] ?? 0) + 1;
    if (a.event_type === "grammar_completed") grammarDoneFromLogMap[a.student_id] = (grammarDoneFromLogMap[a.student_id] ?? 0) + 1;
  }

  // Грамматика — источник правды это сами assignments (status), не лог:
  // одно назначение = один результат, тогда как в лог могла бы попасть
  // повторная отправка.
  const grammarDoneMap: Record<string, number> = {};
  const grammarScoreMap: Record<string, { scoreSum: number; maxSum: number }> = {};
  for (const g of grammarAssignments ?? []) {
    if (g.status !== "completed") continue;
    grammarDoneMap[g.student_id] = (grammarDoneMap[g.student_id] ?? 0) + 1;
    // score/max_score only exist going forward from migration_grammar_score.sql
    // (plus a one-off backfill for whatever completed before it) — older rows
    // that somehow still lack it just don't contribute to the percentage.
    if (g.score != null && g.max_score) {
      const m = grammarScoreMap[g.student_id] ?? { scoreSum: 0, maxSum: 0 };
      m.scoreSum += g.score;
      m.maxSum += g.max_score;
      grammarScoreMap[g.student_id] = m;
    }
  }

  // % освоенных слов в тренажёре — по всем словам, с которыми ученик
  // вообще взаимодействовал (не только по последнему набору).
  const masteryMap: Record<string, { mastered: number; total: number }> = {};
  for (const p of trainerProgress ?? []) {
    const m = masteryMap[p.student_id] ?? { mastered: 0, total: 0 };
    m.total += 1;
    if (p.status === "mastered") m.mastered += 1;
    masteryMap[p.student_id] = m;
  }

  // Тесты — среднее по звёздам (1-5, уже посчитано при сдаче), не проценты:
  // проценты потребовали бы отдельного запроса суммы баллов по каждому
  // тесту.
  const testsMap: Record<string, { done: number; starsSum: number; starsCount: number }> = {};
  for (const t of tests ?? []) {
    if (t.status !== "graded") continue;
    const m = testsMap[t.student_id] ?? { done: 0, starsSum: 0, starsCount: 0 };
    m.done += 1;
    if (t.stars) { m.starsSum += t.stars; m.starsCount += 1; }
    testsMap[t.student_id] = m;
  }

  // Абонемент: сколько занятий осталось у активного абонемента, той же
  // логикой, что и на странице ученика (SubscriptionCard) — занятие
  // считается "проведённым" когда с него списано (deducted_amount).
  const doneCountBySub: Record<string, number> = {};
  for (const l of lessons ?? []) {
    if (l.subscription_id && l.deducted_amount) {
      doneCountBySub[l.subscription_id] = (doneCountBySub[l.subscription_id] ?? 0) + 1;
    }
  }
  const subscriptionMap: Record<string, { left: number | null }> = {};
  for (const s of subscriptions ?? []) {
    if (s.lesson_count == null) { subscriptionMap[s.student_id] = { left: null }; continue; }
    const done = doneCountBySub[s.id] ?? 0;
    subscriptionMap[s.student_id] = { left: s.lesson_count - done };
  }

  const rows: ProgressRow[] = (students ?? []).map(s => ({
    id: s.id,
    name: s.name,
    lastSeen: s.last_seen_at,
    lexiconDone: lexiconDoneMap[s.id] ?? 0,
    lexiconMasteryPct: masteryMap[s.id] && masteryMap[s.id].total > 0
      ? Math.round((masteryMap[s.id].mastered / masteryMap[s.id].total) * 100)
      : null,
    grammarDone: grammarDoneMap[s.id] ?? grammarDoneFromLogMap[s.id] ?? 0,
    grammarAvgPct: grammarScoreMap[s.id] && grammarScoreMap[s.id].maxSum > 0
      ? Math.round((grammarScoreMap[s.id].scoreSum / grammarScoreMap[s.id].maxSum) * 100)
      : null,
    testsDone: testsMap[s.id]?.done ?? 0,
    testsAvgStars: testsMap[s.id] && testsMap[s.id].starsCount > 0
      ? testsMap[s.id].starsSum / testsMap[s.id].starsCount
      : null,
    lessonsLeft: subscriptionMap[s.id]?.left ?? null,
  }));

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold" style={{ color: "var(--brown-dark)" }}>Прогресс</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--brown-light)" }}>
          Сводка по всем ученикам — кто активен, у кого просели результаты, кому пора написать.
        </p>
      </div>
      <ProgressTable rows={rows} />
    </div>
  );
}

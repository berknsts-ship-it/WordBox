import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, BookOpen, PenSquare, GraduationCap, AlertTriangle } from "lucide-react";
import BarChart, { type BarDatum } from "@/components/tutor/BarChart";
import { formatLastSeen } from "@/lib/relativeTime";
import { STATUS_COLORS, statusFromPct, statusFromStars, type Status } from "@/lib/scoreStatus";

const card = { background: "white", borderColor: "var(--brown-pale)" };

function StatusDot({ status }: { status: Status }) {
  return <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_COLORS[status] }} />;
}

export default async function StudentProgressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const tutorId = user!.id;
  const db = createAdminClient();

  const { data: student } = await db.from("students")
    .select("id, name, last_seen_at")
    .eq("id", id).eq("tutor_id", tutorId).single();
  if (!student) redirect("/tutor/progress");

  const [
    { data: grammarAssignments },
    { data: tests },
    { data: trainerProgress },
    { data: activity },
  ] = await Promise.all([
    db.from("grammar_assignments")
      .select("id, status, score, max_score, updated_at, grammar_sets(title)")
      .eq("student_id", id),
    db.from("tests")
      .select("id, title, status, stars, submitted_at")
      .eq("student_id", id).eq("tutor_id", tutorId),
    db.from("trainer_progress").select("status").eq("student_id", id),
    db.from("activity_log")
      .select("event_type, reference, created_at")
      .eq("student_id", id)
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  const seen = formatLastSeen(student.last_seen_at);

  // ── Лексика ──────────────────────────────────────────────────────────────
  const mastered = (trainerProgress ?? []).filter(p => p.status === "mastered").length;
  const totalWords = (trainerProgress ?? []).length;
  const masteryPct = totalWords > 0 ? Math.round((mastered / totalWords) * 100) : null;
  const lexiconSessions = (activity ?? []).filter(a => a.event_type === "trainer_completed");

  // ── Грамматика ───────────────────────────────────────────────────────────
  type GrammarRow = { id: string; status: string; score: number | null; max_score: number | null; updated_at: string; grammar_sets: { title: string } | { title: string }[] | null };
  const grammarDone = ((grammarAssignments ?? []) as GrammarRow[]).filter(g => g.status === "completed");
  const grammarWithPct = grammarDone.map(g => {
    const gs = Array.isArray(g.grammar_sets) ? g.grammar_sets[0] : g.grammar_sets;
    const pct = g.score != null && g.max_score ? Math.round((g.score / g.max_score) * 100) : null;
    return { id: g.id, title: gs?.title ?? "Набор грамматики", date: g.updated_at, pct };
  });
  const grammarAvgPct = grammarWithPct.some(g => g.pct !== null)
    ? Math.round(grammarWithPct.reduce((sum, g) => sum + (g.pct ?? 0), 0) / grammarWithPct.filter(g => g.pct !== null).length)
    : null;

  // ── Тесты ────────────────────────────────────────────────────────────────
  const testsGraded = (tests ?? []).filter(t => t.status === "graded" && t.submitted_at)
    .sort((a, b) => a.submitted_at.localeCompare(b.submitted_at));
  const avgStars = testsGraded.length > 0 && testsGraded.some(t => t.stars)
    ? testsGraded.reduce((sum, t) => sum + (t.stars ?? 0), 0) / testsGraded.filter(t => t.stars).length
    : null;

  // ── Слабые места ─────────────────────────────────────────────────────────
  const weakGrammar = grammarWithPct.filter(g => g.pct !== null && g.pct < 60);
  const weakTests = testsGraded.filter(t => t.stars !== null && t.stars <= 2);

  // ── График: результаты тестов по времени ────────────────────────────────
  const testBars: BarDatum[] = testsGraded.slice(-20).map(t => {
    const status = statusFromStars(t.stars ?? 0);
    const date = new Date(t.submitted_at).toLocaleDateString("ru", { day: "numeric", month: "short" });
    return { label: date, value: t.stars ?? 0, color: STATUS_COLORS[status], tooltip: `${t.title} — ${date}: ★ ${t.stars ?? "—"}/5` };
  });

  // ── График: активность по дням (последние 30 дней) ──────────────────────
  const days: BarDatum[] = [];
  const countByDay: Record<string, number> = {};
  for (const a of activity ?? []) {
    const day = a.created_at.slice(0, 10);
    countByDay[day] = (countByDay[day] ?? 0) + 1;
  }
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("ru", { day: "numeric", month: "short" });
    const count = countByDay[key] ?? 0;
    days.push({ label, value: count, color: "#74070E", tooltip: `${label}: ${count} ${count === 1 ? "событие" : "событий"}` });
  }

  // ── Хронология ───────────────────────────────────────────────────────────
  type TimelineItem = { type: "grammar" | "test" | "trainer"; title: string; date: string; result: string | null; status: Status | null };
  const timeline: TimelineItem[] = [
    ...grammarWithPct.map(g => ({ type: "grammar" as const, title: g.title, date: g.date, result: g.pct !== null ? `${g.pct}%` : null, status: g.pct !== null ? statusFromPct(g.pct) : null })),
    ...testsGraded.map(t => ({ type: "test" as const, title: t.title, date: t.submitted_at, result: t.stars ? `★ ${t.stars}/5` : null, status: t.stars ? statusFromStars(t.stars) : null })),
    ...lexiconSessions.map(a => ({ type: "trainer" as const, title: a.reference ?? "Тренажёр лексики", date: a.created_at, result: null, status: null })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 25);

  const TYPE_ICON = { grammar: PenSquare, test: GraduationCap, trainer: BookOpen };
  const TYPE_LABEL = { grammar: "Грамматика", test: "Тест", trainer: "Лексика" };

  return (
    <div className="max-w-4xl space-y-5">
      <Link href="/tutor/progress" className="flex items-center gap-1 text-sm hover:opacity-70 transition-all" style={{ color: "var(--brown-mid)" }}>
        <ChevronLeft size={16} /> Прогресс
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--brown-dark)" }}>{student.name}</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--brown-light)" }}>Был(а) на сайте: {seen.label}</p>
        </div>
        <Link href={`/tutor/students/${id}`} className="text-sm font-medium hover:underline" style={{ color: "var(--brown-mid)" }}>
          Карточка ученика →
        </Link>
      </div>

      {/* Разбивка по разделам */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border p-4" style={card}>
          <div className="flex items-center gap-2 mb-1.5"><BookOpen size={15} style={{ color: "var(--brown-mid)" }} /><span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--brown-light)" }}>Лексика</span></div>
          <p className="text-2xl font-bold" style={{ color: "var(--brown-dark)" }}>{lexiconSessions.length}</p>
          <p className="text-xs" style={{ color: "var(--brown-light)" }}>наборов пройдено{masteryPct !== null ? ` · ${masteryPct}% освоено` : ""}</p>
        </div>
        <div className="rounded-2xl border p-4" style={card}>
          <div className="flex items-center gap-2 mb-1.5"><PenSquare size={15} style={{ color: "var(--brown-mid)" }} /><span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--brown-light)" }}>Грамматика</span></div>
          <p className="text-2xl font-bold" style={{ color: "var(--brown-dark)" }}>{grammarDone.length}</p>
          <p className="text-xs" style={{ color: "var(--brown-light)" }}>наборов пройдено{grammarAvgPct !== null ? ` · ${grammarAvgPct}% средний` : ""}</p>
        </div>
        <div className="rounded-2xl border p-4" style={card}>
          <div className="flex items-center gap-2 mb-1.5"><GraduationCap size={15} style={{ color: "var(--brown-mid)" }} /><span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--brown-light)" }}>Тесты</span></div>
          <p className="text-2xl font-bold" style={{ color: "var(--brown-dark)" }}>{testsGraded.length}</p>
          <p className="text-xs" style={{ color: "var(--brown-light)" }}>сдано{avgStars !== null ? ` · ★ ${avgStars.toFixed(1)} средний` : ""}</p>
        </div>
      </div>

      {/* Слабые места */}
      {(weakGrammar.length > 0 || weakTests.length > 0) && (
        <div className="rounded-2xl border-2 p-4" style={{ borderColor: "#f5c9a8", background: "#fff8f2" }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} style={{ color: "#c05a1a" }} />
            <p className="text-sm font-semibold" style={{ color: "#c05a1a" }}>Слабые места — над чем поработать</p>
          </div>
          <div className="space-y-1">
            {weakGrammar.map(g => (
              <div key={g.id} className="flex items-center gap-2 text-sm">
                <StatusDot status={statusFromPct(g.pct!)} /> <span style={{ color: "var(--brown-dark)" }}>{g.title}</span>
                <span style={{ color: "var(--brown-light)" }}>— {g.pct}%</span>
              </div>
            ))}
            {weakTests.map(t => (
              <div key={t.id} className="flex items-center gap-2 text-sm">
                <StatusDot status={statusFromStars(t.stars!)} /> <span style={{ color: "var(--brown-dark)" }}>{t.title}</span>
                <span style={{ color: "var(--brown-light)" }}>— ★ {t.stars}/5</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Графики */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border p-4" style={card}>
          <p className="text-sm font-semibold mb-3" style={{ color: "var(--brown-dark)" }}>Результаты тестов по времени</p>
          <BarChart data={testBars} />
          {testBars.length > 0 && (
            <div className="flex items-center gap-3 mt-3 text-xs" style={{ color: "var(--brown-light)" }}>
              <span className="flex items-center gap-1"><StatusDot status="good" /> хорошо</span>
              <span className="flex items-center gap-1"><StatusDot status="warning" /> средне</span>
              <span className="flex items-center gap-1"><StatusDot status="critical" /> низко</span>
            </div>
          )}
        </div>
        <div className="rounded-2xl border p-4" style={card}>
          <p className="text-sm font-semibold mb-3" style={{ color: "var(--brown-dark)" }}>Активность за 30 дней</p>
          <BarChart data={days} />
        </div>
      </div>

      {/* Хронология */}
      <div className="rounded-2xl border p-4" style={card}>
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--brown-dark)" }}>Что пройдено</p>
        {timeline.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--brown-light)" }}>Пока ничего не пройдено.</p>
        ) : (
          <div className="space-y-1.5">
            {timeline.map((item, i) => {
              const Icon = TYPE_ICON[item.type];
              return (
                <div key={i} className="flex items-center gap-3 text-sm px-3 py-2 rounded-lg" style={{ background: "#fdf8f0" }}>
                  <Icon size={14} style={{ color: "var(--brown-mid)" }} className="shrink-0" />
                  <span className="text-xs uppercase tracking-wide shrink-0" style={{ color: "var(--brown-light)", minWidth: 72 }}>{TYPE_LABEL[item.type]}</span>
                  <span className="flex-1 truncate" style={{ color: "var(--brown-dark)" }}>{item.title}</span>
                  {item.result && item.status && (
                    <span className="flex items-center gap-1.5 shrink-0 text-xs font-semibold" style={{ color: STATUS_COLORS[item.status] }}>
                      <StatusDot status={item.status} /> {item.result}
                    </span>
                  )}
                  <span className="text-xs shrink-0" style={{ color: "var(--brown-light)" }}>
                    {new Date(item.date).toLocaleDateString("ru", { day: "numeric", month: "short" })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

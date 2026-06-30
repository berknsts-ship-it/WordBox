import { createClient } from "@/lib/supabase/server";
import {
  Users, CalendarDays, ClipboardList, CircleDollarSign,
  UserPlus, CalendarPlus, ClipboardPlus, FolderPlus,
  ArrowRight,
} from "lucide-react";
import WBLogo from "@/components/WBLogo";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [
    { count: studentsCount },
    { count: homeworkCount },
    { count: lessonsCount },
    { data: unpaidLessons },
  ] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }).eq("tutor_id", user!.id),
    supabase.from("homework").select("*", { count: "exact", head: true }).eq("tutor_id", user!.id).eq("status", "pending"),
    supabase.from("lessons").select("*", { count: "exact", head: true }).eq("tutor_id", user!.id).eq("status", "scheduled").gte("date", new Date().toISOString()),
    supabase.from("lessons").select("price_rub").eq("tutor_id", user!.id).eq("payment_status", "unpaid").neq("status", "cancelled"),
  ]);

  const totalDebt = (unpaidLessons ?? []).reduce((s, l) => s + (l.price_rub ?? 0), 0);

  return (
    <div>
      {/* ── Люкс-баннер ── */}
      <div
        className="relative overflow-hidden rounded-2xl mb-8"
        style={{
          background: "linear-gradient(135deg, #1c0a0b 0%, #2d1012 50%, #3a1416 100%)",
          padding: "clamp(24px, 4vw, 40px) clamp(24px, 5vw, 48px)",
          boxShadow: "0 8px 48px rgba(28,10,11,0.22), inset 0 0 0 1px rgba(156,122,69,0.30)",
        }}
      >
        {/* Угловые скобки */}
        {(["tl","tr","bl","br"] as const).map(pos => (
          <div
            key={pos}
            className="absolute w-6 h-6"
            style={{
              top:    pos.startsWith("t") ? 12 : "auto",
              bottom: pos.startsWith("b") ? 12 : "auto",
              left:   pos.endsWith("l") ? 12 : "auto",
              right:  pos.endsWith("r") ? 12 : "auto",
              borderTop:    pos.startsWith("t") ? "1px solid #9C7A45" : "none",
              borderBottom: pos.startsWith("b") ? "1px solid #9C7A45" : "none",
              borderLeft:   pos.endsWith("l") ? "1px solid #9C7A45" : "none",
              borderRight:  pos.endsWith("r") ? "1px solid #9C7A45" : "none",
              opacity: 0.55,
            }}
          />
        ))}

        {/* Декоративный WBLogo faint */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none select-none hidden sm:block">
          <WBLogo size={160} ringColor="#9C7A45" textColor="#9C7A45" />
        </div>

        <div className="relative z-10 flex items-center justify-between gap-6 flex-wrap sm:flex-nowrap">
          {/* Левая часть: приветствие */}
          <div>
            <p
              className="text-xs tracking-[0.22em] mb-3"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontWeight: 500,
                color: "rgba(196,164,104,0.75)",
              }}
            >
              ЛИЧНЫЙ КАБИНЕТ
            </p>
            <h1
              className="leading-none mb-4"
              style={{
                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                fontWeight: 600,
                fontStyle: "italic",
                fontSize: "clamp(2rem, 5vw, 3rem)",
                color: "#EDE0CC",
                letterSpacing: "-0.01em",
              }}
            >
              Добро пожаловать
            </h1>

            {/* Золотой разделитель */}
            <div
              className="mb-4"
              style={{ height: "1px", width: "120px", background: "linear-gradient(90deg, #9C7A45, rgba(0,0,0,0) 100%)", opacity: 0.6 }}
            />

            {/* Статистика колонками */}
            <div className="flex items-stretch gap-0">
              {[
                { label: "УЧЕНИКИ",  value: studentsCount  ?? 0 },
                { label: "УРОКИ",    value: lessonsCount   ?? 0 },
                { label: "ЗАДАНИЯ",  value: homeworkCount  ?? 0 },
              ].map((stat, i, arr) => (
                <div key={stat.label} className="flex items-stretch">
                  <div className="pr-5 sm:pr-7">
                    <p
                      className="text-xs tracking-[0.18em] mb-0.5"
                      style={{
                        fontFamily: "var(--font-cormorant), Georgia, serif",
                        fontWeight: 500,
                        color: "rgba(196,164,104,0.70)",
                      }}
                    >
                      {stat.label}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-cormorant), Georgia, serif",
                        fontWeight: 600,
                        fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                        color: "#EDE0CC",
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                    </p>
                  </div>
                  {i < arr.length - 1 && (
                    <div
                      className="self-stretch mr-5 sm:mr-7"
                      style={{ width: "1px", background: "rgba(156,122,69,0.35)" }}
                    />
                  )}
                </div>
              ))}

              {totalDebt > 0 && (
                <>
                  <div className="self-stretch mr-5 sm:mr-7" style={{ width: "1px", background: "rgba(156,122,69,0.35)" }} />
                  <div className="pr-5 sm:pr-7">
                    <p className="text-xs tracking-[0.18em] mb-0.5"
                      style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 500, color: "rgba(196,164,104,0.70)" }}>
                      ДОЛГ
                    </p>
                    <p style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 600, fontSize: "clamp(1.6rem, 4vw, 2.2rem)", color: "#EDE0CC", lineHeight: 1 }}>
                      {totalDebt.toLocaleString("ru")} ₽
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Метрические карточки ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Учеников"
          value={studentsCount ?? 0}
          gradient="linear-gradient(135deg, #f5efe8 0%, #ede0cc 100%)"
          iconBg="var(--metric-students-bg)"
          href="/tutor/students"
        />
        <StatCard
          icon={CalendarDays}
          label="Ближайших уроков"
          value={lessonsCount ?? 0}
          gradient="linear-gradient(135deg, #eef4f0 0%, #d8ece0 100%)"
          iconBg="var(--metric-lessons-bg)"
          href="/tutor/schedule"
        />
        <StatCard
          icon={ClipboardList}
          label="Непроверенных заданий"
          value={homeworkCount ?? 0}
          gradient="linear-gradient(135deg, #f5f0e8 0%, #ece0ca 100%)"
          iconBg="var(--metric-homework-bg)"
          href="/tutor/homework"
        />
        <StatCard
          icon={CircleDollarSign}
          label="Не оплачено"
          value={totalDebt}
          displayValue={totalDebt > 0 ? `${totalDebt.toLocaleString("ru")} ₽` : "—"}
          gradient={totalDebt > 0
            ? "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)"
            : "linear-gradient(135deg, #f5f5f5 0%, #e5e5e5 100%)"}
          iconBg={totalDebt > 0 ? "var(--tutor-accent)" : "var(--metric-payments-bg)"}
          href="/tutor/students"
        />
      </div>

      {/* ── Быстрые действия ── */}
      <div
        className="relative rounded-2xl p-6"
        style={{
          background: "rgba(253,248,242,0.85)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 2px 16px rgba(28,10,11,0.06), inset 0 0 0 1px rgba(156,122,69,0.18)",
        }}
      >
        <p
          className="text-xs tracking-[0.20em] mb-5 uppercase"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontWeight: 500,
            color: "#9C7A45",
          }}
        >
          Быстрые действия
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction icon={UserPlus}    label="Добавить ученика"    href="/tutor/students/new" />
          <QuickAction icon={CalendarPlus} label="Запланировать урок" href="/tutor/schedule" />
          <QuickAction icon={ClipboardPlus} label="Дать задание"      href="/tutor/homework/new" />
          <QuickAction icon={FolderPlus}  label="Добавить материал"   href="/tutor/materials/new" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, displayValue, gradient, iconBg, href }: {
  icon: React.ElementType;
  label: string;
  value: number;
  displayValue?: string;
  gradient: string;
  iconBg: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="relative overflow-hidden rounded-2xl p-5 group transition-all"
      style={{
        background: gradient,
        boxShadow: "0 2px 12px rgba(28,10,11,0.07), inset 0 0 0 1px rgba(156,122,69,0.18)",
      }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: iconBg }}>
        <Icon size={16} className="text-white" />
      </div>
      <p
        className="leading-none mb-1"
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontWeight: 600,
          fontSize: "2rem",
          color: "var(--brown-dark)",
        }}
      >
        {displayValue ?? value}
      </p>
      <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--brown-mid)", opacity: 0.7 }}>{label}</p>
      <ArrowRight
        size={14}
        className="absolute bottom-4 right-4 opacity-25 group-hover:opacity-60 group-hover:translate-x-0.5 transition-all"
        style={{ color: "var(--brown-mid)" }}
      />
    </a>
  );
}

function QuickAction({ icon: Icon, label, href }: {
  icon: React.ElementType;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="quick-action flex flex-col items-center gap-2.5 p-4 rounded-2xl transition-all text-center"
      style={{
        border: "1px solid rgba(156,122,69,0.20)",
        background: "rgba(255,255,255,0.60)",
        boxShadow: "0 1px 4px rgba(59,42,26,0.04)",
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #74070E 0%, #9a0f17 100%)", boxShadow: "0 3px 10px rgba(116,7,14,0.32)" }}
      >
        <Icon size={18} className="text-white" />
      </div>
      <span
        className="text-xs font-semibold tracking-wide"
        style={{ color: "var(--brown-mid)" }}
      >
        {label}
      </span>
    </a>
  );
}

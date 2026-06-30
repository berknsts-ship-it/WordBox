import { createClient } from "@/lib/supabase/server";
import {
  Users, CalendarDays, ClipboardList, CircleDollarSign,
  UserPlus, CalendarPlus, ClipboardPlus, FolderPlus,
} from "lucide-react";
import WBLogo from "@/components/WBLogo";
import Link from "next/link";

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
      {/* ══════════════════════ LUXURY BANNER ══════════════════════ */}
      <div
        className="relative overflow-hidden rounded-2xl mb-8"
        style={{
          background: "linear-gradient(145deg, #3d0a0e 0%, #5a0e14 45%, #3a0a0d 100%)",
          padding: "clamp(28px, 4vw, 48px) clamp(28px, 5vw, 56px)",
          boxShadow: "0 12px 60px rgba(28,10,11,0.28), inset 0 0 0 1px rgba(196,164,104,0.25)",
        }}
      >
        {/* Corner brackets */}
        {(["tl","tr","bl","br"] as const).map(pos => (
          <div key={pos} className="absolute w-7 h-7" style={{
            top:    pos.startsWith("t") ? 14 : "auto",
            bottom: pos.startsWith("b") ? 14 : "auto",
            left:   pos.endsWith("l")   ? 14 : "auto",
            right:  pos.endsWith("r")   ? 14 : "auto",
            borderTop:    pos.startsWith("t") ? "1.5px solid rgba(196,164,104,0.60)" : "none",
            borderBottom: pos.startsWith("b") ? "1.5px solid rgba(196,164,104,0.60)" : "none",
            borderLeft:   pos.endsWith("l")   ? "1.5px solid rgba(196,164,104,0.60)" : "none",
            borderRight:  pos.endsWith("r")   ? "1.5px solid rgba(196,164,104,0.60)" : "none",
          }} />
        ))}

        {/* Watermark WBLogo */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.07] hidden sm:block">
          <WBLogo size={180} ringColor="#C4A468" textColor="#C4A468" />
        </div>

        {/* Top gold strip */}
        <div className="absolute top-0 left-16 right-16 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(196,164,104,0.50), transparent)" }} />

        <div className="relative z-10">
          <p className="text-xs tracking-[0.28em] mb-4" style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontWeight: 500,
            color: "rgba(196,164,104,0.65)",
          }}>
            ЛИЧНЫЙ КАБИНЕТ · РЕПЕТИТОР
          </p>

          <h1 style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontWeight: 600,
            fontStyle: "italic",
            fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
            color: "#EDE0CC",
            letterSpacing: "-0.01em",
            lineHeight: 1.05,
            marginBottom: "clamp(16px, 3vw, 28px)",
          }}>
            Добро пожаловать
          </h1>

          {/* Gold divider with ornament */}
          <div className="flex items-center gap-3 mb-5" style={{ maxWidth: 280 }}>
            <div className="flex-1 h-px" style={{ background: "rgba(196,164,104,0.40)" }} />
            <div className="w-1 h-1 rounded-full" style={{ background: "rgba(196,164,104,0.60)" }} />
            <div className="flex-1 h-px" style={{ background: "rgba(196,164,104,0.40)" }} />
          </div>

          {/* Stats row */}
          <div className="flex items-stretch gap-0 flex-wrap">
            {[
              { label: "УЧЕНИКИ",  value: studentsCount  ?? 0 },
              { label: "УРОКИ",    value: lessonsCount   ?? 0 },
              { label: "ЗАДАНИЯ",  value: homeworkCount  ?? 0 },
              ...(totalDebt > 0 ? [{ label: "ДОЛГ ₽", value: totalDebt.toLocaleString("ru") }] : []),
            ].map((stat, i, arr) => (
              <div key={stat.label} className="flex items-stretch">
                <div className="pr-5 sm:pr-8">
                  <p className="text-xs tracking-[0.18em] mb-1" style={{
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontWeight: 500,
                    color: "rgba(196,164,104,0.65)",
                  }}>
                    {stat.label}
                  </p>
                  <p style={{
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontWeight: 600,
                    fontSize: "clamp(1.8rem, 4.5vw, 2.6rem)",
                    color: "#EDE0CC",
                    lineHeight: 1,
                  }}>
                    {stat.value}
                  </p>
                </div>
                {i < arr.length - 1 && (
                  <div className="self-stretch mr-5 sm:mr-8" style={{ width: "1px", background: "rgba(196,164,104,0.22)" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════ STAT CARDS ══════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <DarkStatCard
          icon={Users}
          label="Учеников"
          value={studentsCount ?? 0}
          bg="var(--stat-students)"
          iconColor="#c4875a"
          href="/tutor/students"
        />
        <DarkStatCard
          icon={CalendarDays}
          label="Ближайших уроков"
          value={lessonsCount ?? 0}
          bg="var(--stat-lessons)"
          iconColor="#6ea882"
          href="/tutor/schedule"
        />
        <DarkStatCard
          icon={ClipboardList}
          label="Непроверенных заданий"
          value={homeworkCount ?? 0}
          bg="var(--stat-homework)"
          iconColor="#c4a468"
          href="/tutor/homework"
        />
        <DarkStatCard
          icon={CircleDollarSign}
          label={totalDebt > 0 ? "Не оплачено" : "Долгов нет"}
          value={totalDebt}
          displayValue={totalDebt > 0 ? `${totalDebt.toLocaleString("ru")} ₽` : "✓"}
          bg={totalDebt > 0 ? "var(--stat-debt)" : "var(--stat-payments)"}
          iconColor={totalDebt > 0 ? "#e07a5f" : "#8b8499"}
          href="/tutor/students"
        />
      </div>

      {/* ══════════════════════ QUICK ACTIONS ══════════════════════ */}
      <div
        className="relative rounded-2xl p-6"
        style={{
          background: "rgba(253,248,242,0.85)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 28px rgba(28,10,11,0.07), inset 0 0 0 1px rgba(156,122,69,0.22)",
        }}
      >
        <div className="flex items-center gap-3 mb-5">
          <p className="luxury-section-label">Быстрые действия</p>
          <div className="flex-1 h-px" style={{ background: "rgba(156,122,69,0.18)" }} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction icon={UserPlus}     label="Добавить ученика"    href="/tutor/students/new" />
          <QuickAction icon={CalendarPlus} label="Запланировать урок"  href="/tutor/schedule" />
          <QuickAction icon={ClipboardPlus} label="Дать задание"       href="/tutor/homework/new" />
          <QuickAction icon={FolderPlus}   label="Добавить материал"   href="/tutor/materials/new" />
        </div>
      </div>
    </div>
  );
}

function DarkStatCard({ icon: Icon, label, value, displayValue, bg, iconColor, href }: {
  icon: React.ElementType;
  label: string;
  value: number;
  displayValue?: string;
  bg: string;
  iconColor: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="relative overflow-hidden rounded-2xl p-5 block transition-all hover:scale-[1.02] group"
      style={{
        background: bg,
        boxShadow: "0 6px 24px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(196,164,104,0.22)",
      }}
    >
      {/* Top gold strip */}
      <div className="absolute top-0 left-6 right-6 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(196,164,104,0.45), transparent)" }} />

      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.08)" }}>
        <Icon size={16} style={{ color: iconColor }} />
      </div>

      <p
        className="leading-none mb-2"
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontWeight: 600,
          fontSize: "2.4rem",
          color: "#EDE0CC",
        }}
      >
        {displayValue ?? value}
      </p>

      <p
        className="text-xs tracking-[0.14em] uppercase"
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontWeight: 500,
          color: "rgba(196,164,104,0.65)",
        }}
      >
        {label}
      </p>

      {/* Bottom right arrow */}
      <div
        className="absolute bottom-4 right-4 opacity-20 group-hover:opacity-50 transition-all text-xs"
        style={{ color: "#C4A468", fontFamily: "Georgia, serif" }}
      >
        →
      </div>
    </Link>
  );
}

function QuickAction({ icon: Icon, label, href }: {
  icon: React.ElementType;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-3 p-5 rounded-xl transition-all text-center group"
      style={{
        border: "1px solid rgba(156,122,69,0.22)",
        background: "transparent",
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center transition-all group-hover:scale-105"
        style={{
          background: "linear-gradient(145deg, #5e1018 0%, #74070E 100%)",
          boxShadow: "0 4px 14px rgba(116,7,14,0.32), inset 0 0 0 1px rgba(196,164,104,0.20)",
        }}
      >
        <Icon size={18} style={{ color: "#C4A468" }} />
      </div>
      <span
        className="text-xs font-medium leading-tight"
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "0.85rem",
          fontWeight: 600,
          color: "var(--luxury-dark-1)",
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </span>
    </Link>
  );
}

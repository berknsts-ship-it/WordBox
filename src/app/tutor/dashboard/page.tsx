import { createClient } from "@/lib/supabase/server";
import {
  Users, CalendarDays, ClipboardList,
  UserPlus, CalendarPlus, ClipboardPlus, FolderPlus,
  ArrowRight,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ count: studentsCount }, { count: homeworkCount }, { count: lessonsCount }] =
    await Promise.all([
      supabase.from("students").select("*", { count: "exact", head: true }).eq("tutor_id", user!.id),
      supabase.from("homework").select("*", { count: "exact", head: true }).eq("tutor_id", user!.id).eq("status", "pending"),
      supabase.from("lessons").select("*", { count: "exact", head: true }).eq("tutor_id", user!.id).eq("status", "scheduled").gte("date", new Date().toISOString()),
    ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--brown-dark)" }}>
          Добро пожаловать!
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--brown-light)" }}>
          Вот что происходит сегодня
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Учеников"
          value={studentsCount ?? 0}
          gradient="linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)"
          iconBg="#7c3aed"
          href="/tutor/students"
        />
        <StatCard
          icon={CalendarDays}
          label="Ближайших уроков"
          value={lessonsCount ?? 0}
          gradient="linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)"
          iconBg="#2563eb"
          href="/tutor/schedule"
        />
        <StatCard
          icon={ClipboardList}
          label="Непроверенных заданий"
          value={homeworkCount ?? 0}
          gradient="linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
          iconBg="#d97706"
          href="/tutor/homework"
        />
      </div>

      <div
        className="bg-white/80 rounded-3xl border p-6"
        style={{ borderColor: "var(--brown-pale)", boxShadow: "var(--shadow-card)" }}
      >
        <h2 className="font-semibold mb-4 text-sm uppercase tracking-wide" style={{ color: "var(--brown-light)" }}>
          Быстрые действия
        </h2>
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

function StatCard({ icon: Icon, label, value, gradient, iconBg, href }: {
  icon: React.ElementType;
  label: string;
  value: number;
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
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ background: iconBg }}
      >
        <Icon size={18} className="text-white" />
      </div>
      <p className="text-3xl font-bold" style={{ color: "var(--brown-dark)" }}>{value}</p>
      <p className="text-sm mt-0.5" style={{ color: "var(--brown-mid)" }}>{label}</p>
      <ArrowRight
        size={16}
        className="absolute bottom-4 right-4 opacity-30 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all"
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
      className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all text-center group hover:scale-[1.02]"
      style={{
        borderColor: "var(--brown-pale)",
        boxShadow: "0 1px 4px rgba(59,42,26,0.04)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--brown-light)";
        (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #fdf8f0 0%, #f5e6ca 100%)";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--brown-pale)";
        (e.currentTarget as HTMLElement).style.background = "";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(59,42,26,0.04)";
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
        style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-button)" }}
      >
        <Icon size={18} className="text-white" />
      </div>
      <span className="text-xs font-semibold" style={{ color: "var(--brown-mid)" }}>{label}</span>
    </a>
  );
}

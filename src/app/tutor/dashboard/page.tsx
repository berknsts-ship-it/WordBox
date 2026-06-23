import { createClient } from "@/lib/supabase/server";

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
        <h1 className="text-2xl font-bold text-stone-900">Добро пожаловать! 👋</h1>
        <p className="text-stone-400 mt-1">Вот что происходит сегодня</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon="👩‍🎓" label="Учеников" value={studentsCount ?? 0} color="bg-violet-50" href="/tutor/students" />
        <StatCard icon="📅" label="Ближайших уроков" value={lessonsCount ?? 0} color="bg-blue-50" href="/tutor/schedule" />
        <StatCard icon="📝" label="Непроверенных заданий" value={homeworkCount ?? 0} color="bg-amber-50" href="/tutor/homework" />
      </div>

      <div className="bg-white rounded-3xl border border-stone-100 p-6">
        <h2 className="font-semibold text-stone-700 mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction icon="➕" label="Добавить ученика" href="/tutor/students/new" />
          <QuickAction icon="📅" label="Запланировать урок" href="/tutor/schedule" />
          <QuickAction icon="📝" label="Дать задание" href="/tutor/homework/new" />
          <QuickAction icon="📂" label="Добавить материал" href="/tutor/materials/new" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, href }: {
  icon: string; label: string; value: number; color: string; href: string;
}) {
  return (
    <a href={href} className={`${color} rounded-2xl p-5 hover:opacity-80 transition-opacity`}>
      <span className="text-2xl">{icon}</span>
      <p className="text-3xl font-bold text-stone-900 mt-2">{value}</p>
      <p className="text-sm text-stone-500 mt-0.5">{label}</p>
    </a>
  );
}

function QuickAction({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <a
      href={href}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-stone-100 hover:border-violet-200 hover:bg-violet-50 transition-all text-center"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium text-stone-600">{label}</span>
    </a>
  );
}

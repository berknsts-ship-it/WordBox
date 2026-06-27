import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: students }, { data: unpaidLessons }] = await Promise.all([
    supabase
      .from("students")
      .select("id, name, email, access_code, created_at")
      .eq("tutor_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("lessons")
      .select("student_id, price_rub")
      .eq("tutor_id", user!.id)
      .eq("payment_status", "unpaid")
      .neq("status", "cancelled"),
  ]);

  // Долг по каждому ученику
  const debtMap = new Map<string, number>();
  for (const l of unpaidLessons ?? []) {
    if (l.price_rub) {
      debtMap.set(l.student_id, (debtMap.get(l.student_id) ?? 0) + l.price_rub);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl">Ученики</h1>
          <p className="text-sm mt-1" style={{ color: "var(--brown-light)" }}>
            {students?.length ?? 0} учеников
          </p>
        </div>
        <Link
          href="/tutor/students/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white font-semibold text-sm transition-opacity hover:opacity-80"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-button)" }}
        >
          <span>+</span> Добавить ученика
        </Link>
      </div>

      {!students || students.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">👩‍🎓</p>
          <p className="font-semibold text-lg" style={{ color: "var(--brown-dark)" }}>Пока нет учеников</p>
          <p className="text-sm mt-1 mb-6" style={{ color: "var(--brown-light)" }}>
            Добавь первого ученика — он получит код доступа
          </p>
          <Link
            href="/tutor/students/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white font-semibold text-sm"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-button)" }}
          >
            Добавить ученика
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => {
            const debt = debtMap.get(student.id) ?? 0;
            return (
              <Link
                key={student.id}
                href={`/tutor/students/${student.id}`}
                className="bg-white/80 rounded-2xl border p-5 hover:shadow-md transition-all group"
                style={{ borderColor: "var(--brown-pale)" }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                    style={{ background: "var(--brown-pale)", color: "var(--brown-mid)" }}>
                    {student.name[0].toUpperCase()}
                  </div>
                  <div className="flex items-center gap-2">
                    {debt > 0 && (
                      <span className="text-xs font-bold px-2 py-1 rounded-lg"
                        style={{ background: "#fff7ed", color: "#9a3412" }}>
                        Долг: {debt.toLocaleString("ru")} ₽
                      </span>
                    )}
                    <span className="text-xs font-bold tracking-widest px-2.5 py-1 rounded-lg"
                      style={{ background: "var(--brown-pale)", color: "var(--brown-mid)" }}>
                      {student.access_code}
                    </span>
                  </div>
                </div>
                <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>{student.name}</p>
                {student.email && (
                  <p className="text-sm mt-0.5" style={{ color: "var(--brown-light)" }}>{student.email}</p>
                )}
                <p className="text-xs mt-3 font-semibold group-hover:underline" style={{ color: "var(--brown-light)" }}>
                  Открыть кабинет →
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

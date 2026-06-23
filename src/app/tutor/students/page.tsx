import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: students } = await supabase
    .from("students")
    .select("id, name, email, access_code, created_at")
    .eq("tutor_id", user!.id)
    .order("created_at", { ascending: false });

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
          style={{ background: "var(--brown-mid)" }}
        >
          <span>+</span> Добавить ученика
        </Link>
      </div>

      {!students || students.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">👩‍🎓</p>
          <p className="font-semibold text-lg" style={{ color: "var(--brown-dark)" }}>
            Пока нет учеников
          </p>
          <p className="text-sm mt-1 mb-6" style={{ color: "var(--brown-light)" }}>
            Добавь первого ученика — он получит код доступа
          </p>
          <Link
            href="/tutor/students/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white font-semibold text-sm"
            style={{ background: "var(--brown-mid)" }}
          >
            Добавить ученика
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
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
                <span
                  className="text-xs font-bold tracking-widest px-2.5 py-1 rounded-lg"
                  style={{ background: "var(--brown-pale)", color: "var(--brown-mid)" }}
                >
                  {student.access_code}
                </span>
              </div>
              <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>
                {student.name}
              </p>
              {student.email && (
                <p className="text-sm mt-0.5" style={{ color: "var(--brown-light)" }}>
                  {student.email}
                </p>
              )}
              <p className="text-xs mt-3 font-semibold group-hover:underline"
                style={{ color: "var(--brown-light)" }}>
                Открыть кабинет →
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

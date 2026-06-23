import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import TutorLessonsTab from "@/components/tutor/tabs/LessonsTab";
import TutorHomeworkTab from "@/components/tutor/tabs/HomeworkTab";
import TutorMaterialsTab from "@/components/tutor/tabs/MaterialsTab";
import TutorVocabularyTab from "@/components/tutor/tabs/VocabularyTab";

type Tab = "lessons" | "homework" | "materials" | "vocabulary";

const TABS = [
  { id: "lessons",    label: "📅 Уроки" },
  { id: "homework",   label: "📝 Домашние задания" },
  { id: "materials",  label: "📂 Материалы" },
  { id: "vocabulary", label: "📚 Словари" },
];

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; set?: string }>;
}) {
  const { id } = await params;
  const { tab = "lessons", set } = await searchParams;
  const activeTab = (["lessons", "homework", "materials", "vocabulary"].includes(tab) ? tab : "lessons") as Tab;

  const supabase = await createClient();
  const { data: student } = await supabase
    .from("students")
    .select("id, name, email, access_code, notes")
    .eq("id", id)
    .single();

  if (!student) notFound();

  return (
    <div>
      {/* Шапка */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <Link href="/tutor/students" className="text-sm hover:underline mb-2 inline-block"
            style={{ color: "var(--brown-light)" }}>
            ← Все ученики
          </Link>
          <h1 className="text-2xl">{student.name}</h1>
          {student.email && (
            <p className="text-sm mt-0.5" style={{ color: "var(--brown-light)" }}>{student.email}</p>
          )}
        </div>

        <div className="text-center rounded-2xl px-5 py-3 shrink-0"
          style={{ background: "var(--brown-pale)" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--brown-light)" }}>
            Код доступа
          </p>
          <p className="text-xl font-bold tracking-widest" style={{ color: "var(--brown-dark)" }}>
            {student.access_code}
          </p>
        </div>
      </div>

      {student.notes && (
        <div className="rounded-2xl px-4 py-3 text-sm mb-6"
          style={{ background: "var(--brown-pale)", color: "var(--brown-mid)" }}>
          📋 {student.notes}
        </div>
      )}

      {/* Вкладки */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/tutor/students/${id}?tab=${t.id}`}
            className="px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all"
            style={
              activeTab === t.id
                ? { background: "var(--brown-mid)", color: "#fff" }
                : { background: "rgba(255,255,255,0.7)", color: "var(--brown-light)", border: "1.5px solid var(--brown-pale)" }
            }
          >
            {t.label}
          </Link>
        ))}
      </div>

      {activeTab === "lessons"    && <TutorLessonsTab    studentId={id} />}
      {activeTab === "homework"   && <TutorHomeworkTab   studentId={id} />}
      {activeTab === "materials"  && <TutorMaterialsTab  studentId={id} />}
      {activeTab === "vocabulary" && <TutorVocabularyTab studentId={id} activeSetId={set} />}
    </div>
  );
}

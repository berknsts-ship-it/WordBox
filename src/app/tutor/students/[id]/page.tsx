import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { updateCanvasUrl, updateTextbook } from "@/app/actions/students";
import CopyLinkButton from "@/components/tutor/CopyLinkButton";
import DeleteStudentButton from "@/components/tutor/DeleteStudentButton";
import TutorLessonsTab from "@/components/tutor/tabs/LessonsTab";
import TutorHomeworkTab from "@/components/tutor/tabs/HomeworkTab";
import TutorVocabularyTab from "@/components/tutor/tabs/VocabularyTab";

type Tab = "lessons" | "homework" | "vocabulary";

const TABS = [
  { id: "lessons",    label: "📅 Уроки" },
  { id: "homework",   label: "📝 Домашние задания" },
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
  const activeTab = (["lessons", "homework", "vocabulary"].includes(tab) ? tab : "lessons") as Tab;

  const supabase = await createClient();
  const { data: student } = await supabase
    .from("students")
    .select("id, name, email, access_code, notes, canvas_url, textbook")
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
          <CopyLinkButton code={student.access_code} />
        </div>
      </div>

      <div className="flex justify-end mb-2">
        <DeleteStudentButton studentId={id} studentName={student.name} />
      </div>

      {student.notes && (
        <div className="rounded-2xl px-4 py-3 text-sm mb-6"
          style={{ background: "var(--brown-pale)", color: "var(--brown-mid)" }}>
          📋 {student.notes}
        </div>
      )}

      {/* Учебник */}
      <div className="bg-white/80 rounded-2xl border px-4 py-3 mb-3 flex items-center gap-3"
        style={{ borderColor: "var(--brown-pale)" }}>
        <span className="text-lg shrink-0">📚</span>
        <form action={updateTextbook.bind(null, id)} className="flex gap-2 flex-1 min-w-0">
          <select
            name="textbook"
            defaultValue={student.textbook ?? ""}
            className="flex-1 min-w-0 rounded-xl px-3 py-2 text-sm focus:outline-none"
            style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
          >
            <option value="">Учебник не выбран</option>
            <option value="english_file_elementary">English File Elementary</option>
            <option value="solutions_elementary">Solutions 3rd Ed. Elementary</option>
          </select>
          <button type="submit"
            className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold text-white hover:opacity-80 transition-opacity"
            style={{ background: "var(--brown-mid)" }}>
            Сохранить
          </button>
        </form>
      </div>

      {/* Доска */}
      <div className="bg-white/80 rounded-2xl border px-4 py-3 mb-6 flex items-center gap-3"
        style={{ borderColor: "var(--brown-pale)" }}>
        <span className="text-lg shrink-0">🖊️</span>
        <form action={updateCanvasUrl.bind(null, id)} className="flex gap-2 flex-1 min-w-0">
          <input
            name="canvas_url"
            type="url"
            defaultValue={student.canvas_url ?? ""}
            placeholder="Ссылка на доску (Miro, Figma, Notion...)"
            className="flex-1 min-w-0 rounded-xl px-3 py-2 text-sm focus:outline-none"
            style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
          />
          <button type="submit"
            className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold text-white hover:opacity-80 transition-opacity"
            style={{ background: "var(--brown-mid)" }}>
            Сохранить
          </button>
        </form>
      </div>

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
      {activeTab === "vocabulary" && <TutorVocabularyTab studentId={id} activeSetId={set} />}
    </div>
  );
}

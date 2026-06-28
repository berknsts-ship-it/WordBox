import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSnapshots } from "@/app/actions/board";
import { updateCanvasUrl, updateTextbook } from "@/app/actions/students";
import CopyLinkButton from "@/components/tutor/CopyLinkButton";
import DeleteStudentButton from "@/components/tutor/DeleteStudentButton";
import TutorLessonsTab from "@/components/tutor/tabs/LessonsTab";
import TutorHomeworkTab from "@/components/tutor/tabs/HomeworkTab";
import TutorVocabularyTab from "@/components/tutor/tabs/VocabularyTab";
import ScheduleTab from "@/components/student/tabs/ScheduleTab";
import StudentHomeworkTab from "@/components/student/tabs/HomeworkTab";
import JournalTab from "@/components/student/tabs/JournalTab";
import TrainerTab from "@/components/student/tabs/TrainerTab";
import BoardTab from "@/components/student/tabs/BoardTab";
import GrammarTab from "@/components/student/tabs/GrammarTab";
import {
  CalendarDays, ClipboardList, PenLine,
  NotebookText, Brain, BookText, Star,
} from "lucide-react";

type TutorTab = "lessons" | "homework" | "vocabulary";
type StudentTab = "schedule" | "homework" | "board" | "journal" | "trainer" | "grammar";

const TUTOR_TABS = [
  { id: "lessons",    label: "📅 Уроки" },
  { id: "homework",   label: "📝 Домашние задания" },
  { id: "vocabulary", label: "📚 Словари" },
];

const STUDENT_TABS = [
  { id: "schedule", label: "Расписание", icon: CalendarDays },
  { id: "homework", label: "Задания",    icon: ClipboardList },
  { id: "board",    label: "Доска",      icon: PenLine },
  { id: "journal",  label: "Журнал",     icon: NotebookText },
  { id: "trainer",  label: "Тренажёр",   icon: Brain },
  { id: "grammar",  label: "Грамматика", icon: BookText },
];

function getWordForm(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return forms[2];
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
}

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; set?: string; view?: string }>;
}) {
  const { id } = await params;
  const { tab, set, view } = await searchParams;
  const isStudentView = view === "student";

  const tutorActiveTab = (["lessons", "homework", "vocabulary"].includes(tab ?? "") ? tab : "lessons") as TutorTab;
  const studentActiveTab = (["schedule", "homework", "board", "journal", "trainer", "grammar"].includes(tab ?? "") ? tab : "schedule") as StudentTab;

  const supabase = await createClient();
  const { data: student } = await supabase
    .from("students")
    .select("id, name, email, access_code, notes, canvas_url, textbook")
    .eq("id", id)
    .single();

  if (!student) notFound();

  const boardSnapshots = studentActiveTab === "board" ? await getSnapshots(id) : [];

  let pendingCount = 0, lessonsCount = 0, checkedCount = 0;
  if (isStudentView) {
    const [p, l, c] = await Promise.all([
      supabase.from("homework").select("id", { count: "exact", head: true })
        .eq("student_id", id).eq("status", "pending"),
      supabase.from("lessons").select("id", { count: "exact", head: true })
        .eq("student_id", id).eq("status", "scheduled")
        .gte("date", new Date().toISOString()),
      supabase.from("homework").select("id", { count: "exact", head: true })
        .eq("student_id", id).eq("status", "checked"),
    ]);
    pendingCount = p.count ?? 0;
    lessonsCount = l.count ?? 0;
    checkedCount = c.count ?? 0;
  }

  return (
    <div>
      {/* ── Переключатель вида ── */}
      <div className="flex items-center justify-between mb-5 gap-4">
        <Link href="/tutor/students" className="text-sm hover:underline shrink-0"
          style={{ color: "var(--brown-light)" }}>
          ← Все ученики
        </Link>

        <div className="flex items-center gap-1 rounded-2xl p-1" style={{ background: "var(--brown-pale)" }}>
          <Link
            href={`/tutor/students/${id}?tab=lessons`}
            className="px-4 py-1.5 rounded-xl text-sm font-semibold transition-all"
            style={
              !isStudentView
                ? { background: "var(--brown-mid)", color: "#fff", boxShadow: "var(--shadow-button)" }
                : { color: "var(--brown-light)" }
            }
          >
            ⚙️ Репетитор
          </Link>
          <Link
            href={`/tutor/students/${id}?view=student&tab=schedule`}
            className="px-4 py-1.5 rounded-xl text-sm font-semibold transition-all"
            style={
              isStudentView
                ? { background: "var(--brown-mid)", color: "#fff", boxShadow: "var(--shadow-button)" }
                : { color: "var(--brown-light)" }
            }
          >
            👁 Ученик
          </Link>
        </div>
      </div>

      {isStudentView ? (
        /* ═══════════════════════════════ ВИД УЧЕНИКА ═══════════════════════════════ */
        <div>
          {/* Приветственный баннер */}
          <div
            className="relative overflow-hidden rounded-3xl p-6 mb-6"
            style={{
              background: "linear-gradient(135deg, #74070E 0%, #8f0e14 50%, #a01018 100%)",
              boxShadow: "0 4px 24px rgba(59,42,26,0.22)",
            }}
          >
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full"
              style={{ background: "rgba(255,255,255,0.07)" }} />
            <div className="absolute -right-2 top-12 w-24 h-24 rounded-full"
              style={{ background: "rgba(255,255,255,0.05)" }} />
            <div className="absolute right-16 -bottom-6 w-32 h-32 rounded-full"
              style={{ background: "rgba(255,255,255,0.05)" }} />
            <div className="absolute right-6 top-4 opacity-15 select-none pointer-events-none"
              style={{ fontFamily: "Georgia, serif", fontSize: "72px", fontStyle: "italic", color: "#fff", lineHeight: 1 }}>
              A
            </div>

            <div className="relative z-10">
              <p className="text-sm font-medium mb-1" style={{ color: "rgba(255,255,255,0.65)" }}>
                Привет,
              </p>
              <h1 className="text-3xl font-bold mb-4"
                style={{ fontFamily: "var(--font-lora)", color: "#fdf3e3", textShadow: "0 1px 8px rgba(59,42,26,0.25)" }}>
                {student.name}!
              </h1>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
                  <ClipboardList size={14} className="text-white opacity-80" />
                  <span className="text-sm font-semibold text-white">
                    {pendingCount} {getWordForm(pendingCount, ["задание", "задания", "заданий"])}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
                  <CalendarDays size={14} className="text-white opacity-80" />
                  <span className="text-sm font-semibold text-white">
                    {lessonsCount} {getWordForm(lessonsCount, ["урок", "урока", "уроков"])}
                  </span>
                </div>
                {checkedCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
                    <Star size={14} className="text-white opacity-80" />
                    <span className="text-sm font-semibold text-white">{checkedCount} проверено</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Таб-навигация (ссылки на tutor URL с view=student) */}
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2 mb-5">
            {STUDENT_TABS.map((t) => {
              const Icon = t.icon;
              const isActive = studentActiveTab === t.id;
              const showBadge = t.id === "homework" && pendingCount > 0;
              return (
                <Link
                  key={t.id}
                  href={`/tutor/students/${id}?view=student&tab=${t.id}`}
                  className="relative flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl sm:rounded-2xl transition-all"
                  style={
                    isActive
                      ? { background: "var(--gradient-primary)", color: "#fff", boxShadow: "var(--shadow-button)" }
                      : { background: "rgba(255,255,255,0.75)", color: "var(--brown-light)", border: "1.5px solid var(--brown-pale)" }
                  }
                >
                  <Icon size={18} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:block text-xs font-semibold text-center leading-tight px-1">
                    {t.label}
                  </span>
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full text-white font-bold"
                      style={{ background: "#e85d4a", fontSize: "10px" }}>
                      {pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {studentActiveTab === "schedule"  && <ScheduleTab        studentId={id} />}
          {studentActiveTab === "homework"  && <StudentHomeworkTab  studentId={id} />}
          {studentActiveTab === "board"     && <BoardTab            studentId={id} role="tutor" boardUrl={student.canvas_url ?? null} snapshots={boardSnapshots as unknown as Parameters<typeof BoardTab>[0]["snapshots"]} />}
          {studentActiveTab === "journal"   && <JournalTab          studentId={id} />}
          {studentActiveTab === "trainer"   && <TrainerTab          studentId={id} code={student.access_code} activeSetId={set} />}
          {studentActiveTab === "grammar"   && <GrammarTab          textbook={student.textbook ?? null} />}
        </div>
      ) : (
        /* ═══════════════════════════════ ВИД РЕПЕТИТОРА ════════════════════════════ */
        <div>
          {/* Шапка профиля */}
          <div className="relative overflow-hidden rounded-3xl p-6 mb-5"
            style={{ background: "var(--gradient-primary)", boxShadow: "0 4px 24px rgba(116,7,14,0.22)" }}>

            {/* Декор */}
            <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }} />
            <div className="absolute -right-2 top-14 w-28 h-28 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }} />
            <div className="absolute left-1/2 -bottom-12 w-52 h-52 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }} />

            {/* Word Box watermark */}
            <div className="absolute right-6 bottom-4 select-none pointer-events-none"
              style={{ fontFamily: "var(--font-lora)", fontSize: "30px", fontStyle: "italic", color: "rgba(255,255,255,0.13)", letterSpacing: "0.02em" }}>
              Word Box
            </div>

            <div className="relative z-10 flex items-center gap-5 flex-wrap sm:flex-nowrap">
              {/* Аватар */}
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl font-bold"
                style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", color: "#fdf3e3", fontFamily: "var(--font-lora)" }}>
                {student.name[0].toUpperCase()}
              </div>

              {/* Имя и мета */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold tracking-widest uppercase mb-1.5"
                  style={{ color: "rgba(255,255,255,0.50)" }}>
                  Word Box · Кабинет ученика
                </p>
                <h1 className="text-3xl font-bold leading-tight"
                  style={{ fontFamily: "var(--font-lora)", color: "#fdf3e3", textShadow: "0 1px 8px rgba(59,42,26,0.3)" }}>
                  {student.name}
                </h1>
                {student.email && (
                  <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.60)" }}>{student.email}</p>
                )}
                {student.textbook && (
                  <p className="text-xs mt-1 font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {student.textbook === "english_file_elementary" ? "English File Elementary" : "Solutions 3rd Ed. Elementary"}
                  </p>
                )}
              </div>

              {/* Код доступа */}
              <div className="text-center rounded-2xl px-5 py-3 flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
                <p className="text-xs font-semibold mb-1" style={{ color: "rgba(255,255,255,0.65)" }}>Код доступа</p>
                <p className="text-2xl font-bold tracking-widest" style={{ color: "#fff" }}>
                  {student.access_code}
                </p>
                <CopyLinkButton code={student.access_code} />
              </div>
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
              <select name="textbook" defaultValue={student.textbook ?? ""}
                className="flex-1 min-w-0 rounded-xl px-3 py-2 text-sm focus:outline-none"
                style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}>
                <option value="">Учебник не выбран</option>
                <option value="english_file_elementary">English File Elementary</option>
                <option value="solutions_elementary">Solutions 3rd Ed. Elementary</option>
              </select>
              <button type="submit"
                className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold text-white hover:opacity-80 transition-opacity"
                style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-button)" }}>
                Сохранить
              </button>
            </form>
          </div>

          {/* Доска */}
          <div className="bg-white/80 rounded-2xl border px-4 py-3 mb-6 flex items-center gap-3"
            style={{ borderColor: "var(--brown-pale)" }}>
            <span className="text-lg shrink-0">🖊️</span>
            <form action={updateCanvasUrl.bind(null, id)} className="flex gap-2 flex-1 min-w-0">
              <input name="canvas_url" type="url" defaultValue={student.canvas_url ?? ""}
                placeholder="Ссылка на доску (Miro, Figma, Notion...)"
                className="flex-1 min-w-0 rounded-xl px-3 py-2 text-sm focus:outline-none"
                style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
              />
              <button type="submit"
                className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold text-white hover:opacity-80 transition-opacity"
                style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-button)" }}>
                Сохранить
              </button>
            </form>
          </div>

          {/* Вкладки репетитора */}
          <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
            {TUTOR_TABS.map((t) => (
              <Link key={t.id} href={`/tutor/students/${id}?tab=${t.id}`}
                className="px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all"
                style={
                  tutorActiveTab === t.id
                    ? { background: "var(--brown-mid)", color: "#fff" }
                    : { background: "rgba(255,255,255,0.7)", color: "var(--brown-light)", border: "1.5px solid var(--brown-pale)" }
                }>
                {t.label}
              </Link>
            ))}
          </div>

          {tutorActiveTab === "lessons"    && <TutorLessonsTab    studentId={id} />}
          {tutorActiveTab === "homework"   && <TutorHomeworkTab   studentId={id} />}
          {tutorActiveTab === "vocabulary" && <TutorVocabularyTab studentId={id} activeSetId={set} />}
        </div>
      )}
    </div>
  );
}

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
      {/* ── Верхняя навигация ── */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <Link href="/tutor/students"
          className="text-xs font-medium tracking-widest uppercase hover:opacity-70 transition-opacity flex items-center gap-1.5"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "var(--tutor-brass)" }}>
          ← Все ученики
        </Link>

        <div className="flex items-center gap-1 rounded-xl p-1"
          style={{ background: "rgba(156,122,69,0.10)", border: "1px solid rgba(156,122,69,0.20)" }}>
          <Link
            href={`/tutor/students/${id}?tab=lessons`}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all tracking-wide"
            style={
              !isStudentView
                ? { background: "linear-gradient(135deg, #5e1018, #74070E)", color: "#EDE0CC", boxShadow: "0 2px 8px rgba(116,7,14,0.30)" }
                : { color: "var(--tutor-brass)" }
            }
          >
            ⚙️ Репетитор
          </Link>
          <Link
            href={`/tutor/students/${id}?view=student&tab=schedule`}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all tracking-wide"
            style={
              isStudentView
                ? { background: "linear-gradient(135deg, #5e1018, #74070E)", color: "#EDE0CC", boxShadow: "0 2px 8px rgba(116,7,14,0.30)" }
                : { color: "var(--tutor-brass)" }
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
          {/* ── Люкс-баннер ученика ── */}
          <div
            className="relative overflow-hidden rounded-2xl mb-5"
            style={{
              background: "linear-gradient(145deg, #3d0a0e 0%, #5a0e14 50%, #3a0a0d 100%)",
              padding: "clamp(20px, 3.5vw, 36px) clamp(20px, 4vw, 44px)",
              boxShadow: "0 8px 40px rgba(28,10,11,0.22), inset 0 0 0 1px rgba(196,164,104,0.22)",
            }}
          >
            {/* Corner brackets */}
            {(["tl","tr","bl","br"] as const).map(pos => (
              <div key={pos} className="absolute w-5 h-5" style={{
                top:    pos.startsWith("t") ? 10 : "auto",
                bottom: pos.startsWith("b") ? 10 : "auto",
                left:   pos.endsWith("l")   ? 10 : "auto",
                right:  pos.endsWith("r")   ? 10 : "auto",
                borderTop:    pos.startsWith("t") ? "1px solid rgba(196,164,104,0.55)" : "none",
                borderBottom: pos.startsWith("b") ? "1px solid rgba(196,164,104,0.55)" : "none",
                borderLeft:   pos.endsWith("l")   ? "1px solid rgba(196,164,104,0.55)" : "none",
                borderRight:  pos.endsWith("r")   ? "1px solid rgba(196,164,104,0.55)" : "none",
              }} />
            ))}

            {/* Top gold strip */}
            <div className="absolute top-0 left-12 right-12 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(196,164,104,0.45), transparent)" }} />

            <div className="relative z-10 flex items-center gap-5 flex-wrap sm:flex-nowrap">
              {/* Аватар */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 font-bold"
                style={{
                  background: "rgba(196,164,104,0.15)",
                  border: "1px solid rgba(196,164,104,0.30)",
                  color: "#C4A468",
                  fontFamily: "var(--font-cormorant), Georgia, serif",
                  fontSize: "1.8rem",
                  fontStyle: "italic",
                }}
              >
                {student.name[0].toUpperCase()}
              </div>

              {/* Имя и мета */}
              <div className="flex-1 min-w-0">
                <p className="text-xs tracking-[0.22em] mb-2" style={{
                  fontFamily: "var(--font-cormorant), Georgia, serif",
                  fontWeight: 500,
                  color: "rgba(196,164,104,0.65)",
                }}>
                  WORD BOX · КАБИНЕТ УЧЕНИКА
                </p>
                <h1 style={{
                  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                  fontWeight: 600,
                  fontStyle: "italic",
                  fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                  color: "#EDE0CC",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.05,
                }}>
                  {student.name}
                </h1>
                {student.textbook && (
                  <p className="text-xs mt-1.5 tracking-wider" style={{ color: "rgba(196,164,104,0.55)" }}>
                    {student.textbook === "english_file_elementary" ? "English File Elementary" : "Solutions 3rd Ed. Elementary"}
                  </p>
                )}
              </div>

              {/* Код доступа */}
              <div
                className="text-center rounded-xl px-5 py-3 flex-shrink-0"
                style={{
                  background: "rgba(196,164,104,0.10)",
                  border: "1px solid rgba(196,164,104,0.28)",
                }}
              >
                <p className="text-xs tracking-[0.18em] mb-1.5" style={{
                  fontFamily: "var(--font-cormorant), Georgia, serif",
                  color: "rgba(196,164,104,0.65)",
                }}>
                  КОД ДОСТУПА
                </p>
                <p style={{
                  fontFamily: "var(--font-cormorant), Georgia, serif",
                  fontWeight: 600,
                  fontSize: "1.8rem",
                  letterSpacing: "0.15em",
                  color: "#EDE0CC",
                  lineHeight: 1,
                }}>
                  {student.access_code}
                </p>
                <CopyLinkButton code={student.access_code} />
              </div>
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <DeleteStudentButton studentId={id} studentName={student.name} />
          </div>

          {student.notes && (
            <div className="rounded-xl px-4 py-3 text-sm mb-5"
              style={{ background: "rgba(156,122,69,0.08)", border: "1px solid rgba(156,122,69,0.20)", color: "var(--tutor-brass)" }}>
              📋 {student.notes}
            </div>
          )}

          {/* Учебник + доска */}
          <div className="space-y-2 mb-6">
            <div className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{ background: "rgba(253,248,242,0.85)", boxShadow: "inset 0 0 0 1px rgba(156,122,69,0.20)" }}>
              <span className="text-base shrink-0 opacity-70">📚</span>
              <form action={updateTextbook.bind(null, id)} className="flex gap-2 flex-1 min-w-0">
                <select name="textbook" defaultValue={student.textbook ?? ""}
                  className="flex-1 min-w-0 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  style={{ background: "transparent", border: "none", color: "var(--brown-dark)" }}>
                  <option value="">Учебник не выбран</option>
                  <option value="english_file_elementary">English File Elementary</option>
                  <option value="solutions_elementary">Solutions 3rd Ed. Elementary</option>
                </select>
                <button type="submit"
                  className="shrink-0 rounded-lg px-4 py-1.5 text-xs font-semibold tracking-wide uppercase hover:opacity-80 transition-opacity"
                  style={{ background: "linear-gradient(135deg, #5e1018, #74070E)", color: "#EDE0CC", boxShadow: "0 2px 8px rgba(116,7,14,0.28)" }}>
                  Сохранить
                </button>
              </form>
            </div>

            <div className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{ background: "rgba(253,248,242,0.85)", boxShadow: "inset 0 0 0 1px rgba(156,122,69,0.20)" }}>
              <span className="text-base shrink-0 opacity-70">🖊️</span>
              <form action={updateCanvasUrl.bind(null, id)} className="flex gap-2 flex-1 min-w-0">
                <input name="canvas_url" type="url" defaultValue={student.canvas_url ?? ""}
                  placeholder="Ссылка на доску (Miro, Figma, Notion...)"
                  className="flex-1 min-w-0 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  style={{ background: "transparent", border: "none", color: "var(--brown-dark)" }}
                />
                <button type="submit"
                  className="shrink-0 rounded-lg px-4 py-1.5 text-xs font-semibold tracking-wide uppercase hover:opacity-80 transition-opacity"
                  style={{ background: "linear-gradient(135deg, #5e1018, #74070E)", color: "#EDE0CC", boxShadow: "0 2px 8px rgba(116,7,14,0.28)" }}>
                  Сохранить
                </button>
              </form>
            </div>
          </div>

          {/* Вкладки репетитора */}
          <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
            {TUTOR_TABS.map((t) => (
              <Link key={t.id} href={`/tutor/students/${id}?tab=${t.id}`}
                className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all"
                style={
                  tutorActiveTab === t.id
                    ? { background: "linear-gradient(135deg, #5e1018, #74070E)", color: "#EDE0CC", boxShadow: "0 3px 10px rgba(116,7,14,0.28)" }
                    : { background: "rgba(253,248,242,0.85)", color: "var(--tutor-brass)", border: "1px solid rgba(156,122,69,0.22)" }
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

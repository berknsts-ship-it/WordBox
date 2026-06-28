import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import TabNav from "@/components/student/TabNav";
import ScheduleTab from "@/components/student/tabs/ScheduleTab";
import HomeworkTab from "@/components/student/tabs/HomeworkTab";
import JournalTab from "@/components/student/tabs/JournalTab";
import TrainerTab from "@/components/student/tabs/TrainerTab";
import BoardTab from "@/components/student/tabs/BoardTab";
import GrammarTab from "@/components/student/tabs/GrammarTab";
import MaterialsTab from "@/components/student/tabs/MaterialsTab";
import SplashScreen from "@/components/student/SplashScreen";
import ThemeOnboardingGate from "@/components/student/ThemeOnboardingGate";
import { CalendarDays, ClipboardList, Star } from "lucide-react";

type Tab = "schedule" | "homework" | "materials" | "board" | "journal" | "trainer" | "grammar";
const VALID_TABS: Tab[] = ["schedule", "homework", "materials", "board", "journal", "trainer", "grammar"];

export default async function StudentCabinetPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ tab?: string; set?: string }>;
}) {
  const { code } = await params;
  const { tab = "schedule", set } = await searchParams;
  const activeTab = (VALID_TABS.includes(tab as Tab) ? tab : "schedule") as Tab;

  const supabase = await createClient();
  const { data: student } = await supabase
    .from("students")
    .select("id, name, canvas_url, textbook, theme")
    .eq("access_code", code)
    .single();

  if (!student) notFound();

  const [{ count: pendingCount }, { count: lessonsCount }, { count: checkedCount }] =
    await Promise.all([
      supabase.from("homework").select("id", { count: "exact", head: true })
        .eq("student_id", student.id).eq("status", "pending"),
      supabase.from("lessons").select("id", { count: "exact", head: true })
        .eq("student_id", student.id).eq("status", "scheduled")
        .gte("date", new Date().toISOString()),
      supabase.from("homework").select("id", { count: "exact", head: true })
        .eq("student_id", student.id).eq("status", "checked"),
    ]);

  return (
    <ThemeOnboardingGate needsOnboarding={student.theme === null}>
    <SplashScreen code={code}>
      <div>
        {/* Приветственный баннер */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 mb-6"
          style={{
            background: "linear-gradient(135deg, #74070E 0%, #8f0e14 50%, #a01018 100%)",
            boxShadow: "0 4px 24px rgba(59,42,26,0.22)",
          }}
        >
          {/* Декоративные круги */}
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full"
            style={{ background: "rgba(255,255,255,0.07)" }} />
          <div className="absolute -right-2 top-12 w-24 h-24 rounded-full"
            style={{ background: "rgba(255,255,255,0.05)" }} />
          <div className="absolute right-16 -bottom-6 w-32 h-32 rounded-full"
            style={{ background: "rgba(255,255,255,0.05)" }} />

          {/* Декоративная буква */}
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

            {/* Мини-статистика */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
                <ClipboardList size={14} className="text-white opacity-80" />
                <span className="text-sm font-semibold text-white">
                  {pendingCount ?? 0} {getWordForm(pendingCount ?? 0, ["задание", "задания", "заданий"])}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
                <CalendarDays size={14} className="text-white opacity-80" />
                <span className="text-sm font-semibold text-white">
                  {lessonsCount ?? 0} {getWordForm(lessonsCount ?? 0, ["урок", "урока", "уроков"])}
                </span>
              </div>
              {(checkedCount ?? 0) > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
                  <Star size={14} className="text-white opacity-80" />
                  <span className="text-sm font-semibold text-white">
                    {checkedCount} проверено
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <TabNav code={code} activeTab={activeTab} pendingHomework={pendingCount ?? 0} />

        <div className="mt-5">
          {activeTab === "schedule"  && <ScheduleTab  studentId={student.id} />}
          {activeTab === "homework"  && <HomeworkTab  studentId={student.id} />}
          {activeTab === "materials" && <MaterialsTab studentId={student.id} />}
          {activeTab === "board"     && <BoardTab     studentId={student.id} role="student" />}
          {activeTab === "journal"   && <JournalTab   studentId={student.id} />}
          {activeTab === "trainer"   && (
            <TrainerTab studentId={student.id} code={code} activeSetId={set} />
          )}
          {activeTab === "grammar"   && <GrammarTab textbook={student.textbook ?? null} />}
        </div>
      </div>
    </SplashScreen>
    </ThemeOnboardingGate>
  );
}

function getWordForm(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return forms[2];
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
}

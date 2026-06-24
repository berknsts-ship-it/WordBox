import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import TabNav from "@/components/student/TabNav";
import ScheduleTab from "@/components/student/tabs/ScheduleTab";
import HomeworkTab from "@/components/student/tabs/HomeworkTab";
import JournalTab from "@/components/student/tabs/JournalTab";
import TrainerTab from "@/components/student/tabs/TrainerTab";
import BoardTab from "@/components/student/tabs/BoardTab";
import GrammarTab from "@/components/student/tabs/GrammarTab";
import SplashScreen from "@/components/student/SplashScreen";

type Tab = "schedule" | "homework" | "board" | "journal" | "trainer" | "grammar";
const VALID_TABS: Tab[] = ["schedule", "homework", "board", "journal", "trainer", "grammar"];

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
    .select("id, name, canvas_url")
    .eq("access_code", code)
    .single();

  if (!student) notFound();

  const { count: pendingCount } = await supabase
    .from("homework")
    .select("id", { count: "exact", head: true })
    .eq("student_id", student.id)
    .eq("status", "pending");

  return (
    <SplashScreen code={code}>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl">Привет, {student.name}! 👋</h1>
          <p className="text-sm mt-1" style={{ color: "var(--brown-light)" }}>
            Твой личный кабинет
          </p>
        </div>

        <TabNav code={code} activeTab={activeTab} pendingHomework={pendingCount ?? 0} />

        <div className="mt-6">
          {activeTab === "schedule"  && <ScheduleTab  studentId={student.id} />}
          {activeTab === "homework"  && <HomeworkTab  studentId={student.id} />}
          {activeTab === "board"     && <BoardTab     boardUrl={student.canvas_url ?? null} />}
          {activeTab === "journal"   && <JournalTab   studentId={student.id} />}
          {activeTab === "trainer"   && (
            <TrainerTab studentId={student.id} code={code} activeSetId={set} />
          )}
          {activeTab === "grammar"   && <GrammarTab />}
        </div>
      </div>
    </SplashScreen>
  );
}

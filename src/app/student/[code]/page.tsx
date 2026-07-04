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
import TestsTab from "@/components/student/tabs/TestsTab";
import SplashScreen from "@/components/student/SplashScreen";
import ThemeOnboardingGate from "@/components/student/ThemeOnboardingGate";
import StudentBanner from "@/components/student/StudentBanner";
import NotificationBanner from "@/components/student/NotificationBanner";
import PushSubscribeButton from "@/components/student/PushSubscribeButton";

type Tab = "schedule" | "homework" | "materials" | "board" | "journal" | "trainer" | "grammar" | "tests";
const VALID_TABS: Tab[] = ["schedule", "homework", "materials", "board", "journal", "trainer", "grammar", "tests"];

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
    .select("id, name, canvas_url, textbook, theme, tutor_id")
    .eq("access_code", code)
    .single();

  if (!student) notFound();

  const [
    { count: pendingCount },
    { count: lessonsCount },
    { count: checkedCount },
    { data: recipientRows },
    { data: readRows },
  ] = await Promise.all([
    supabase.from("homework").select("id", { count: "exact", head: true })
      .eq("student_id", student.id).eq("status", "pending"),
    supabase.from("lessons").select("id", { count: "exact", head: true })
      .eq("student_id", student.id).eq("status", "scheduled")
      .gte("date", new Date().toISOString()),
    supabase.from("homework").select("id", { count: "exact", head: true })
      .eq("student_id", student.id).eq("status", "checked"),
    supabase.from("notification_recipients").select("notification_id")
      .eq("student_id", student.id),
    supabase.from("notification_reads").select("notification_id")
      .eq("student_id", student.id),
  ]);

  // Resolve unread notifications
  const recipientIds = new Set((recipientRows ?? []).map(r => r.notification_id));
  const readIds = new Set((readRows ?? []).map(r => r.notification_id));
  const pendingIds = [...recipientIds].filter(id => !readIds.has(id));
  let unreadNotifications: { id: string; title: string; body: string }[] = [];
  if (pendingIds.length > 0 && student.tutor_id) {
    const { data } = await supabase.from("notifications")
      .select("id, title, body, sent_at")
      .in("id", pendingIds)
      .not("sent_at", "is", null)
      .eq("tutor_id", student.tutor_id)
      .order("sent_at", { ascending: false });
    unreadNotifications = (data ?? []).map(n => ({ id: n.id, title: n.title, body: n.body }));
  }

  const isBoard = activeTab === "board";

  return (
    <ThemeOnboardingGate needsOnboarding={student.theme === null}>
    <SplashScreen code={code}>
      {isBoard ? (
        /* Board tab: fixed overlay from below header — same pattern as tutor board */
        <div className="fixed inset-x-0 bottom-0 z-10 flex flex-col" style={{ top: "56px" }}>
          <div className="shrink-0 max-w-6xl w-full mx-auto px-4 sm:px-8 pt-4 sm:pt-5 pb-2">
            <TabNav code={code} activeTab={activeTab} pendingHomework={pendingCount ?? 0} themeId={student.theme} />
          </div>
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <BoardTab studentId={student.id} role="student" />
          </div>
        </div>
      ) : (
        <div>
          <NotificationBanner studentId={student.id} notifications={unreadNotifications} />
          <PushSubscribeButton studentId={student.id} />
          <StudentBanner
            name={student.name}
            pendingCount={pendingCount ?? 0}
            lessonsCount={lessonsCount ?? 0}
            checkedCount={checkedCount ?? 0}
          />
          <TabNav code={code} activeTab={activeTab} pendingHomework={pendingCount ?? 0} themeId={student.theme} />
          <div className="mt-5">
            {activeTab === "schedule"  && <ScheduleTab  studentId={student.id} />}
            {activeTab === "homework"  && <HomeworkTab  studentId={student.id} />}
            {activeTab === "materials" && <MaterialsTab studentId={student.id} />}
            {activeTab === "journal"   && <JournalTab   studentId={student.id} />}
            {activeTab === "trainer"   && (
              <TrainerTab studentId={student.id} code={code} activeSetId={set} />
            )}
            {activeTab === "grammar"   && <GrammarTab textbook={student.textbook ?? null} />}
            {activeTab === "tests"     && <TestsTab studentId={student.id} accessCode={code} />}
          </div>
        </div>
      )}
    </SplashScreen>
    </ThemeOnboardingGate>
  );
}

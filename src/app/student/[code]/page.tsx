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
import StudentBanner from "@/components/student/StudentBanner";
import NotificationBanner from "@/components/student/NotificationBanner";
import PushSubscribeButton from "@/components/student/PushSubscribeButton";

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
      <div>
        <NotificationBanner studentId={student.id} notifications={unreadNotifications} />
        <PushSubscribeButton studentId={student.id} />
        {!isBoard && (
          <StudentBanner
            name={student.name}
            pendingCount={pendingCount ?? 0}
            lessonsCount={lessonsCount ?? 0}
            checkedCount={checkedCount ?? 0}
          />
        )}

        <TabNav code={code} activeTab={activeTab} pendingHomework={pendingCount ?? 0} themeId={student.theme} />

        {activeTab === "board" ? (
          <div className="-mx-4 sm:mx-0 flex flex-col" style={{ height: "calc(100dvh - 140px)", minHeight: 320, marginBottom: "-1.25rem" }}>
            <BoardTab studentId={student.id} role="student" />
          </div>
        ) : (
          <div className="mt-5">
            {activeTab === "schedule"  && <ScheduleTab  studentId={student.id} />}
            {activeTab === "homework"  && <HomeworkTab  studentId={student.id} />}
            {activeTab === "materials" && <MaterialsTab studentId={student.id} />}
            {activeTab === "journal"   && <JournalTab   studentId={student.id} />}
            {activeTab === "trainer"   && (
              <TrainerTab studentId={student.id} code={code} activeSetId={set} />
            )}
            {activeTab === "grammar"   && <GrammarTab textbook={student.textbook ?? null} />}
          </div>
        )}
      </div>
    </SplashScreen>
    </ThemeOnboardingGate>
  );
}


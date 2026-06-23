import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import TabNav from "@/components/student/TabNav";
import ScheduleTab from "@/components/student/tabs/ScheduleTab";
import HomeworkTab from "@/components/student/tabs/HomeworkTab";
import JournalTab from "@/components/student/tabs/JournalTab";
import MaterialsTab from "@/components/student/tabs/MaterialsTab";
import TrainerTab from "@/components/student/tabs/TrainerTab";

type Tab = "schedule" | "homework" | "journal" | "materials" | "trainer";
const VALID_TABS: Tab[] = ["schedule", "homework", "journal", "materials", "trainer"];

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
    .select("id, name")
    .eq("access_code", code)
    .single();

  if (!student) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl">Привет, {student.name}! 👋</h1>
        <p className="text-sm mt-1" style={{ color: "var(--brown-light)" }}>
          Твой личный кабинет
        </p>
      </div>

      <TabNav code={code} activeTab={activeTab} />

      <div className="mt-6">
        {activeTab === "schedule"  && <ScheduleTab  studentId={student.id} />}
        {activeTab === "homework"  && <HomeworkTab  studentId={student.id} />}
        {activeTab === "journal"   && <JournalTab   studentId={student.id} />}
        {activeTab === "materials" && <MaterialsTab studentId={student.id} />}
        {activeTab === "trainer"   && (
          <TrainerTab studentId={student.id} code={code} activeSetId={set} />
        )}
      </div>
    </div>
  );
}

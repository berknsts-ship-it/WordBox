import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

const BoardTab = dynamic(
  () => import("@/components/student/tabs/BoardTab"),
  { ssr: false, loading: () => <div className="flex-1 animate-pulse" style={{ background: "#e8e8e8" }} /> }
);

export default async function StudentBoardPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = await createClient();
  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("access_code", code)
    .single();

  if (!student) notFound();

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#e8e8e8" }}>
      <BoardTab studentId={student.id} role="student" />
    </div>
  );
}

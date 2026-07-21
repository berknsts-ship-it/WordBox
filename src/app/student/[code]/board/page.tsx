import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import BoardPageClient from "./BoardPageClient";

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

  return <BoardPageClient studentId={student.id} />;
}

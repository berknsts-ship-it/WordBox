import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import TopicEditor from "./TopicEditor";

export default async function SetDetailPage({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: set }, { data: words }, { data: students }, { data: assignments }] = await Promise.all([
    supabase
      .from("vocabulary_sets")
      .select("id, name")
      .eq("id", setId)
      .eq("tutor_id", user.id)
      .single(),
    supabase
      .from("vocabulary_words")
      .select("id, english, russian, example, example_sentence")
      .eq("set_id", setId)
      .order("created_at", { ascending: true }),
    supabase
      .from("students")
      .select("id, name")
      .eq("tutor_id", user.id)
      .order("name"),
    supabase
      .from("set_assignments")
      .select("student_id")
      .eq("set_id", setId),
  ]);

  if (!set) redirect("/tutor/vocabulary");

  const assignedIds = (assignments ?? []).map((a) => a.student_id);

  return (
    <div className="max-w-2xl">
      <Link
        href="/tutor/vocabulary"
        className="flex items-center gap-1 text-sm mb-5 hover:opacity-70 transition-all"
        style={{ color: "var(--brown-mid)" }}
      >
        <ChevronLeft size={15} /> Все словари
      </Link>

      <h1 className="text-xl font-bold mb-6" style={{ color: "var(--brown-dark)" }}>
        {set.name}
      </h1>

      <TopicEditor
        setId={setId}
        initialName={set.name}
        initialWords={words ?? []}
        allStudents={students ?? []}
        assignedIds={assignedIds}
      />
    </div>
  );
}

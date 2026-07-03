import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NewTopicForm from "./NewTopicForm";

export default async function NewTopicPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: students } = await supabase
    .from("students")
    .select("id, name")
    .eq("tutor_id", user.id)
    .order("name");

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--brown-dark)" }}>
        Новая тема
      </h1>
      <NewTopicForm students={students ?? []} />
    </div>
  );
}

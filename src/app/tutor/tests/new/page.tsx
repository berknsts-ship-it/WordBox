import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import TestBuilder from "./TestBuilder";

export default async function NewTestPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: students } = await supabase
    .from("students")
    .select("id, name")
    .eq("tutor_id", user.id)
    .order("name");

  return (
    <div>
      <Link href="/tutor/tests"
        className="flex items-center gap-1 text-sm mb-5 hover:opacity-70 transition-all"
        style={{ color: "var(--brown-mid)" }}>
        <ChevronLeft size={16} /> Контрольные работы
      </Link>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--brown-dark)" }}>
        Новая контрольная работа
      </h1>
      <TestBuilder students={students ?? []} />
    </div>
  );
}

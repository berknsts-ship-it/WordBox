import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import HomeworkBlocksEditor from "../HomeworkBlocksEditor";

export default async function NewInteractiveHomeworkPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: students } = await supabase.from("students").select("id, name").eq("tutor_id", user!.id).order("name");

  return (
    <div>
      <Link href="/tutor/homework/new" className="flex items-center gap-1 text-sm mb-5 hover:opacity-70 transition-all" style={{ color: "var(--brown-mid)" }}>
        <ChevronLeft size={16} /> Обычное задание
      </Link>
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--brown-dark)" }}>Интерактивное задание</h1>
      <p className="text-sm mb-6" style={{ color: "var(--brown-light)" }}>
        Ученик выполняет прямо в кабинете (без доски) и сдаёт на проверку — картинки со своими полями ответов, банк слов, вопросы с автопроверкой и свободные вопросы можно сочетать в любом порядке.
      </p>
      <HomeworkBlocksEditor students={students ?? []} />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Plus, Pencil, Copy, Trash2 } from "lucide-react";
import { deleteGrammarSet, duplicateGrammarSet } from "@/app/actions/grammar";

export default async function GrammarLibraryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const db = createAdminClient();

  const { data: sets } = await db
    .from("grammar_sets")
    .select("id, title, description, created_at")
    .eq("tutor_id", user!.id)
    .order("created_at", { ascending: false });

  const allSets = sets ?? [];
  const setIds = allSets.map(s => s.id);

  const exerciseCountBySet: Record<string, number> = {};
  if (setIds.length > 0) {
    const { data: exercises } = await db.from("grammar_exercises").select("id, set_id").in("set_id", setIds);
    for (const ex of exercises ?? []) {
      exerciseCountBySet[ex.set_id] = (exerciseCountBySet[ex.set_id] ?? 0) + 1;
    }
  }

  const card = { background: "white", borderColor: "var(--brown-pale)" };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--brown-dark)" }}>Библиотека грамматики</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--brown-light)" }}>
            {allSets.length} {allSets.length === 1 ? "набор" : allSets.length < 5 ? "набора" : "наборов"}
          </p>
        </div>
        <Link
          href="/tutor/grammar/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-80 transition-all"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-button)" }}
        >
          <Plus size={16} /> Создать набор
        </Link>
      </div>

      {allSets.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">📐</p>
          <p className="font-semibold mb-2" style={{ color: "var(--brown-dark)" }}>Пока нет ни одного набора</p>
          <Link
            href="/tutor/grammar/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80 transition-all"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus size={14} /> Создать первый набор
          </Link>
        </div>
      ) : (
        <div className="space-y-2 mt-5">
          {allSets.map(set => {
            const count = exerciseCountBySet[set.id] ?? 0;
            return (
              <div key={set.id} className="rounded-2xl border p-3.5 flex items-center gap-3" style={card}>
                <div className="flex-1 min-w-0">
                  <Link href={`/tutor/grammar/${set.id}`} className="font-semibold text-sm hover:underline" style={{ color: "var(--brown-dark)" }}>
                    {set.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs" style={{ color: "var(--brown-light)" }}>
                      {count} {count === 1 ? "упражнение" : count < 5 ? "упражнения" : "упражнений"}
                    </span>
                    {set.description && (
                      <span className="text-xs truncate" style={{ color: "var(--brown-mid)" }}>· {set.description}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    href={`/tutor/grammar/${set.id}`}
                    className="p-2 rounded-xl hover:opacity-70 transition-all"
                    style={{ color: "var(--brown-mid)" }}
                    title="Редактировать"
                  >
                    <Pencil size={15} />
                  </Link>
                  <form action={async () => { "use server"; await duplicateGrammarSet(set.id); }}>
                    <button type="submit" className="p-2 rounded-xl hover:opacity-70 transition-all" style={{ color: "var(--brown-mid)" }} title="Дублировать">
                      <Copy size={15} />
                    </button>
                  </form>
                  <form action={async () => { "use server"; await deleteGrammarSet(set.id); }}>
                    <button type="submit" className="p-2 rounded-xl hover:bg-red-50 transition-colors" style={{ color: "var(--brown-light)" }} title="Удалить набор">
                      <Trash2 size={15} />
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

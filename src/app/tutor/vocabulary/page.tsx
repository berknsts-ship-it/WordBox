import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Plus } from "lucide-react";
import { deleteVocabularySet } from "@/app/actions/vocabulary";
import SetAssignPanel from "@/components/tutor/SetAssignPanel";

export default async function VocabularyPage() {
  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: sets }, { data: students }, { data: allAssignments }] = await Promise.all([
    supabase
      .from("vocabulary_sets")
      .select("id, name")
      .eq("tutor_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("students")
      .select("id, name")
      .eq("tutor_id", user!.id)
      .order("name"),
    admin.from("set_assignments").select("set_id, student_id"),
  ]);

  // Word counts per set
  const setIds = (sets ?? []).map((s) => s.id);
  const wordCountBySet: Record<string, number> = {};
  if (setIds.length > 0) {
    const { data: words } = await supabase
      .from("vocabulary_words")
      .select("id, set_id")
      .in("set_id", setIds);
    for (const w of words ?? []) {
      wordCountBySet[w.set_id] = (wordCountBySet[w.set_id] ?? 0) + 1;
    }
  }

  // Assignment map: setId → assigned studentIds
  const assignmentMap = new Map<string, string[]>();
  for (const a of allAssignments ?? []) {
    if (!assignmentMap.has(a.set_id)) assignmentMap.set(a.set_id, []);
    assignmentMap.get(a.set_id)!.push(a.student_id);
  }

  const allStudents = students ?? [];
  const studentNameMap = new Map(allStudents.map((s) => [s.id, s.name]));
  const totalWords = Object.values(wordCountBySet).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--brown-dark)" }}>Словари</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--brown-light)" }}>
            {sets?.length ?? 0} наборов · {totalWords} слов
          </p>
        </div>
        <Link
          href="/tutor/vocabulary/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-80 transition-all"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-button)" }}
        >
          <Plus size={16} /> Новая тема
        </Link>
      </div>

      {!sets || sets.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">📚</p>
          <p className="font-semibold mb-2" style={{ color: "var(--brown-dark)" }}>
            Пока нет ни одного набора
          </p>
          <Link
            href="/tutor/vocabulary/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80 transition-all"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus size={14} /> Создать первый набор
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {sets.map((set) => {
            const count = wordCountBySet[set.id] ?? 0;
            const assigned = assignmentMap.get(set.id) ?? [];

            return (
              <div
                key={set.id}
                className="rounded-2xl border p-4 flex items-center gap-3"
                style={{ background: "white", borderColor: "var(--brown-pale)" }}
              >
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/tutor/vocabulary/${set.id}`}
                    className="font-semibold text-sm hover:underline"
                    style={{ color: "var(--brown-dark)" }}
                  >
                    {set.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs" style={{ color: "var(--brown-light)" }}>
                      {count} {count === 1 ? "слово" : count < 5 ? "слова" : "слов"}
                    </span>
                    {assigned.length > 0 && (
                      <span className="text-xs" style={{ color: "var(--brown-mid)" }}>
                        ·{" "}
                        {assigned
                          .map((sid) => studentNameMap.get(sid))
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <SetAssignPanel
                    setId={set.id}
                    allStudents={allStudents}
                    assignedIds={assigned}
                  />
                  <form action={deleteVocabularySet.bind(null, set.id)}>
                    <button
                      type="submit"
                      className="p-2 rounded-xl hover:bg-red-50 transition-colors"
                      style={{ color: "var(--brown-light)" }}
                      title="Удалить набор"
                    >
                      ✕
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

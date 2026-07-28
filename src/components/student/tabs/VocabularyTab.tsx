import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import VocabularyList, { type VocabWord, type VocabSet } from "@/components/student/VocabularyList";

export default async function VocabularyTab({ studentId }: { studentId: string }) {
  const supabase = await createClient();

  const { data: assignments } = await supabase
    .from("set_assignments")
    .select("vocabulary_sets(id, name)")
    .eq("student_id", studentId);

  type SetRow = { id: string; name: string };
  const sets: VocabSet[] = (assignments ?? [])
    .map((a) => {
      const vs = a.vocabulary_sets;
      if (!vs || Array.isArray(vs)) return null;
      const s = vs as SetRow;
      return { id: s.id, name: s.name };
    })
    .filter((s): s is VocabSet => s !== null);

  if (sets.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-5xl mb-3">📖</p>
        <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>
          Словарь пока пуст
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--brown-light)" }}>
          Репетитор добавит слова, или добавь свои — кнопка ниже появится, как только будет хотя бы одна тема
        </p>
      </div>
    );
  }

  const setNameById = new Map(sets.map((s) => [s.id, s.name]));
  const setIds = sets.map((s) => s.id);

  const { data: words } = await supabase
    .from("vocabulary_words")
    .select("id, english, russian, set_id, added_by, added_by_id")
    .in("set_id", setIds)
    .order("created_at", { ascending: true });

  const wordRows = words ?? [];
  const wordIds = wordRows.map((w) => w.id);

  let progressByWord = new Map<string, "queue" | "learning" | "mastered">();
  if (wordIds.length > 0) {
    try {
      const db = createAdminClient();
      const { data: progress } = await db
        .from("trainer_progress")
        .select("word_id, status")
        .eq("student_id", studentId)
        .in("word_id", wordIds);
      progressByWord = new Map((progress ?? []).map((p) => [p.word_id, p.status as "queue" | "learning" | "mastered"]));
    } catch {
      // trainer_progress table may not exist yet
    }
  }

  const vocabWords: VocabWord[] = wordRows.map((w) => ({
    id: w.id,
    english: w.english,
    russian: w.russian,
    setId: w.set_id,
    setName: setNameById.get(w.set_id) ?? "—",
    status: progressByWord.get(w.id) ?? "queue",
    isOwn: w.added_by === "student" && w.added_by_id === studentId,
  }));

  return <VocabularyList studentId={studentId} words={vocabWords} sets={sets} />;
}

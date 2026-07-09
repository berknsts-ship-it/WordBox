import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { deleteVocabularySet } from "@/app/actions/vocabulary";
import SetAssignPanel from "@/components/tutor/SetAssignPanel";
import SetFolderPicker from "@/components/tutor/SetFolderPicker";
import FolderCreateButton from "@/components/tutor/FolderCreateButton";
import FolderRenameInput from "@/components/tutor/FolderRenameInput";

export default async function VocabularyPage() {
  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [
    { data: folders },
    { data: sets },
    { data: students },
    { data: allAssignments },
  ] = await Promise.all([
    supabase
      .from("vocabulary_folders")
      .select("id, name, sort_order")
      .eq("tutor_id", user!.id)
      .order("sort_order")
      .order("created_at"),
    supabase
      .from("vocabulary_sets")
      .select("id, name, folder_id")
      .eq("tutor_id", user!.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("students")
      .select("id, name")
      .eq("tutor_id", user!.id)
      .order("name"),
    admin.from("set_assignments").select("set_id, student_id"),
  ]);

  const allSets = sets ?? [];
  const allFolders = folders ?? [];
  const allStudents = students ?? [];

  // Word counts per set
  const setIds = allSets.map(s => s.id);
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

  // Assignment map
  const assignmentMap = new Map<string, string[]>();
  for (const a of allAssignments ?? []) {
    if (!assignmentMap.has(a.set_id)) assignmentMap.set(a.set_id, []);
    assignmentMap.get(a.set_id)!.push(a.student_id);
  }

  const studentNameMap = new Map(allStudents.map(s => [s.id, s.name]));
  const totalWords = Object.values(wordCountBySet).reduce((a, b) => a + b, 0);

  // Group sets by folder
  const byFolder = new Map<string | null, typeof allSets>();
  byFolder.set(null, []);
  for (const f of allFolders) byFolder.set(f.id, []);
  for (const s of allSets) {
    const key = s.folder_id ?? null;
    if (!byFolder.has(key)) byFolder.set(key, []);
    byFolder.get(key)!.push(s);
  }

  const renderSet = (set: { id: string; name: string; folder_id: string | null }) => {
    const count = wordCountBySet[set.id] ?? 0;
    const assigned = assignmentMap.get(set.id) ?? [];
    return (
      <div
        key={set.id}
        className="rounded-2xl border p-3.5 flex items-center gap-3"
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
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs" style={{ color: "var(--brown-light)" }}>
              {count} {count === 1 ? "слово" : count < 5 ? "слова" : "слов"}
            </span>
            {assigned.length > 0 && (
              <span className="text-xs" style={{ color: "var(--brown-mid)" }}>
                · {assigned.map(sid => studentNameMap.get(sid)).filter(Boolean).join(", ")}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <SetFolderPicker setId={set.id} currentFolderId={set.folder_id} folders={allFolders} />
          <SetAssignPanel setId={set.id} allStudents={allStudents} assignedIds={assigned} />
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
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--brown-dark)" }}>Словари</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--brown-light)" }}>
            {allSets.length} наборов · {totalWords} слов
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FolderCreateButton />
          <Link
            href="/tutor/vocabulary/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-80 transition-all"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-button)" }}
          >
            <Plus size={16} /> Новая тема
          </Link>
        </div>
      </div>

      {allSets.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">📚</p>
          <p className="font-semibold mb-2" style={{ color: "var(--brown-dark)" }}>Пока нет ни одного набора</p>
          <Link
            href="/tutor/vocabulary/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80 transition-all"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus size={14} /> Создать первый набор
          </Link>
        </div>
      ) : (
        <div className="space-y-4 mt-5">
          {/* Folders */}
          {allFolders.map(folder => {
            const folderSets = byFolder.get(folder.id) ?? [];
            return (
              <details key={folder.id} open className="group/details">
                <summary
                  className="flex items-center gap-2 cursor-pointer select-none list-none py-2 px-1 rounded-xl hover:opacity-80"
                  style={{ color: "var(--brown-dark)" }}
                >
                  <BookOpen size={16} style={{ color: "var(--brown-mid)" }} />
                  <span className="font-semibold text-sm flex-1">{folder.name}</span>
                  <span className="text-xs mr-1" style={{ color: "var(--brown-light)" }}>
                    {folderSets.length} {folderSets.length === 1 ? "набор" : folderSets.length < 5 ? "набора" : "наборов"}
                  </span>
                  <FolderRenameInput folderId={folder.id} initialName={folder.name} isEmpty={folderSets.length === 0} />
                  <svg className="w-4 h-4 transition-transform group-open/details:rotate-90 shrink-0" style={{ color: "var(--brown-light)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </summary>
                <div className="mt-2 space-y-2 pl-1">
                  {folderSets.length === 0 ? (
                    <p className="text-xs px-2 py-3 text-center" style={{ color: "var(--brown-light)" }}>
                      Нет наборов — перенеси сюда через кнопку «Без папки» на карточке
                    </p>
                  ) : (
                    folderSets.map(renderSet)
                  )}
                </div>
              </details>
            );
          })}

          {/* Sets without folder */}
          {(byFolder.get(null) ?? []).length > 0 && (
            <details open className="group/details">
              <summary
                className="flex items-center gap-2 cursor-pointer select-none list-none py-2 px-1 rounded-xl hover:opacity-80"
                style={{ color: "var(--brown-dark)" }}
              >
                <BookOpen size={16} style={{ color: "var(--brown-pale)" }} />
                <span className="font-semibold text-sm flex-1" style={{ color: "var(--brown-light)" }}>Без учебника</span>
                <span className="text-xs mr-5" style={{ color: "var(--brown-light)" }}>
                  {(byFolder.get(null) ?? []).length} наборов
                </span>
                <svg className="w-4 h-4 transition-transform group-open/details:rotate-90 shrink-0" style={{ color: "var(--brown-light)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </summary>
              <div className="mt-2 space-y-2 pl-1">
                {(byFolder.get(null) ?? []).map(renderSet)}
              </div>
            </details>
          )}

          {/* No folders yet — flat list */}
          {allFolders.length === 0 && (byFolder.get(null) ?? []).map(renderSet)}
        </div>
      )}
    </div>
  );
}

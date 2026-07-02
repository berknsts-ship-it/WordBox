import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FolderPlus, Trash2, Users, FileText, Link2, Monitor } from "lucide-react";
import { deleteMaterial } from "@/app/actions/materials";

export default async function MaterialsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: materials } = await supabase
    .from("materials")
    .select("id, title, content, url, file_name, is_iframe, student_id, created_at")
    .eq("tutor_id", user.id)
    .order("created_at", { ascending: false });

  const materialIds = (materials ?? []).map(m => m.id);

  // Count junction-table assignments per material
  const assignmentCounts: Record<string, number> = {};
  if (materialIds.length > 0) {
    const { data: assignments } = await supabase
      .from("material_assignments")
      .select("material_id")
      .in("material_id", materialIds);
    for (const a of assignments ?? []) {
      assignmentCounts[a.material_id] = (assignmentCounts[a.material_id] ?? 0) + 1;
    }
  }

  // Resolve direct student names
  const directStudentIds = [...new Set((materials ?? []).filter(m => m.student_id).map(m => m.student_id as string))];
  const studentNames: Record<string, string> = {};
  if (directStudentIds.length > 0) {
    const { data: students } = await supabase
      .from("students").select("id, name").in("id", directStudentIds);
    for (const s of students ?? []) studentNames[s.id] = s.name;
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--brown-dark)" }}>Материалы</h1>
        <Link
          href="/tutor/materials/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--gradient-primary)" }}
        >
          <FolderPlus size={15} /> Добавить
        </Link>
      </div>

      {!materials?.length ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-3">📂</p>
          <p className="font-semibold text-lg" style={{ color: "var(--brown-dark)" }}>Материалов пока нет</p>
          <p className="text-sm mt-1" style={{ color: "var(--brown-light)" }}>
            <Link href="/tutor/materials/new" className="underline">Добавь первый</Link>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {materials.map(m => {
            const isPdf = m.file_name?.toLowerCase().endsWith(".pdf") || (!m.file_name && m.url?.toLowerCase().includes(".pdf"));
            const assignedCount = (assignmentCounts[m.id] ?? 0) + (m.student_id ? 1 : 0);

            const typeIcon = m.is_iframe
              ? <Monitor size={13} />
              : m.file_name
              ? <FileText size={13} />
              : m.url
              ? <Link2 size={13} />
              : <FileText size={13} />;

            const typeLabel = m.is_iframe ? "Фрейм" : isPdf ? "PDF" : m.file_name ? "Файл" : m.url ? "Ссылка" : "Текст";

            const deleteAction = deleteMaterial.bind(null, m.id, m.student_id ?? "");

            return (
              <div
                key={m.id}
                className="rounded-2xl border p-4"
                style={{ background: "white", borderColor: "var(--brown-pale)" }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-snug" style={{ color: "var(--brown-dark)" }}>
                      {m.title}
                    </p>
                    {m.content && (
                      <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--brown-mid)" }}>
                        {m.content}
                      </p>
                    )}
                    <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                      <span className="text-xs" style={{ color: "var(--brown-light)" }}>
                        {new Date(m.created_at).toLocaleDateString("ru", { day: "numeric", month: "long" })}
                      </span>
                      <span
                        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "var(--cream)", color: "var(--brown-mid)" }}
                      >
                        {typeIcon} {typeLabel}
                      </span>
                      {assignedCount > 0 && (
                        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--brown-mid)" }}>
                          <Users size={11} /> {assignedCount}
                        </span>
                      )}
                    </div>
                  </div>

                  <form action={deleteAction}>
                    <button
                      type="submit"
                      className="p-2 rounded-xl transition-colors hover:bg-red-50 shrink-0"
                      style={{ color: "var(--brown-light)" }}
                      title="Удалить"
                    >
                      <Trash2 size={16} />
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

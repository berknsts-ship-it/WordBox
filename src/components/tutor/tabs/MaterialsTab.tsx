import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import StudentLibraryPanel from "@/components/tutor/StudentLibraryPanel";
import { Monitor, BookOpen, FileText, Link2, ExternalLink } from "lucide-react";

type Material = {
  id: string;
  title: string;
  url: string | null;
  file_name: string | null;
  is_iframe: boolean;
  created_at: string;
};

function materialIcon(m: Material) {
  if (m.is_iframe) return <Monitor size={14} />;
  const isPdf = m.file_name?.toLowerCase().endsWith(".pdf") || (!m.file_name && m.url?.toLowerCase().includes(".pdf"));
  if (isPdf) return <BookOpen size={14} />;
  if (m.file_name) return <FileText size={14} />;
  if (m.url) return <Link2 size={14} />;
  return <FileText size={14} />;
}

export default async function TutorMaterialsTab({ studentId }: { studentId: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [
    { data: libraryMaterials },
    { data: assignedRows },
  ] = await Promise.all([
    supabase.from("materials")
      .select("id, title, url, file_name, is_iframe, created_at")
      .eq("tutor_id", user!.id)
      .is("student_id", null)
      .order("title"),
    supabase.from("material_assignments")
      .select("material_id")
      .eq("student_id", studentId),
  ]);

  const assignedIds = new Set((assignedRows ?? []).map(r => r.material_id));
  const assignedMaterials = (libraryMaterials ?? []).filter(m => assignedIds.has(m.id));
  const assignedMaterialIdList = (assignedRows ?? []).map(r => r.material_id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: "var(--brown-mid)" }}>
          Материалы из библиотеки
        </p>
        <StudentLibraryPanel
          studentId={studentId}
          allMaterials={libraryMaterials ?? []}
          assignedMaterialIds={assignedMaterialIdList}
        />
      </div>

      {assignedMaterials.length === 0 ? (
        <div className="rounded-2xl border p-6 text-center"
          style={{ borderColor: "var(--brown-pale)", background: "var(--cream)" }}>
          <p className="text-sm" style={{ color: "var(--brown-light)" }}>Материалы не назначены</p>
          <p className="text-xs mt-1" style={{ color: "var(--brown-light)" }}>
            Нажми «Из библиотеки», чтобы выбрать
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {assignedMaterials.map(m => (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-xl border p-3"
              style={{ background: "white", borderColor: "var(--brown-pale)" }}
            >
              <span style={{ color: "var(--brown-mid)" }}>{materialIcon(m)}</span>
              <span className="flex-1 text-sm font-medium truncate" style={{ color: "var(--brown-dark)" }}>
                {m.title}
              </span>
              {m.url && (
                <a href={m.url} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 p-1 rounded-lg hover:opacity-70"
                  style={{ color: "var(--brown-light)" }}>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="pt-2 border-t" style={{ borderColor: "var(--brown-pale)" }}>
        <Link
          href="/tutor/materials/new"
          className="text-xs hover:opacity-70 transition-opacity"
          style={{ color: "var(--brown-light)" }}
        >
          + Загрузить новый материал в библиотеку →
        </Link>
      </div>
    </div>
  );
}

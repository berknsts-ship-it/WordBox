import { createClient } from "@/lib/supabase/server";
import { PdfReader } from "@/components/student/PdfReader";
import { FileText, Link2, Monitor, BookOpen, FileQuestion } from "lucide-react";

type Material = {
  id: string;
  title: string;
  content: string | null;
  url: string | null;
  file_name: string | null;
  is_iframe: boolean;
  created_at: string;
};

function isPdf(fileName: string | null, url: string | null) {
  return (
    fileName?.toLowerCase().endsWith(".pdf") ||
    (!fileName && !!url?.toLowerCase().includes(".pdf"))
  );
}

type MaterialKind = "iframe" | "pdf" | "file" | "link" | "text";

function classify(m: Material): MaterialKind {
  if (m.is_iframe) return "iframe";
  if (isPdf(m.file_name, m.url)) return "pdf";
  if (m.file_name) return "file";
  if (m.url) return "link";
  return "text";
}

const KIND_META: Record<MaterialKind, { icon: React.ReactNode; label: string; color: string }> = {
  iframe:  { icon: <Monitor  size={15}/>, label: "Видео / фрейм", color: "#6A48D0" },
  pdf:     { icon: <BookOpen size={15}/>, label: "PDF",            color: "#C05010" },
  file:    { icon: <FileText size={15}/>, label: "Файл",           color: "#307A50" },
  link:    { icon: <Link2    size={15}/>, label: "Ссылка",         color: "#1864AB" },
  text:    { icon: <FileQuestion size={15}/>, label: "Текст",     color: "#888" },
};

function MaterialCard({ m }: { m: Material }) {
  const kind = classify(m);
  const meta = KIND_META[kind];

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: "var(--theme-card-bg)", borderColor: "var(--theme-card-border)" }}
    >
      {/* Embedded iframe (video / external site) */}
      {kind === "iframe" && m.url && (
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={m.url}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            style={{ border: "none" }}
          />
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* Kind badge */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <span style={{ color: meta.color, opacity: 0.85 }}>{meta.icon}</span>
          <span className="text-xs font-semibold tracking-wide uppercase"
            style={{ color: meta.color, opacity: 0.80 }}>
            {meta.label}
          </span>
        </div>

        {/* Title */}
        <p className="font-bold text-base leading-snug mb-1"
          style={{ color: "var(--brown-dark)", fontFamily: "var(--theme-font, inherit)" }}>
          {m.title}
        </p>

        {/* Description */}
        {m.content && (
          <p className="text-sm leading-relaxed mt-1 mb-3"
            style={{ color: "var(--brown-mid)" }}>
            {m.content}
          </p>
        )}

        <p className="text-xs mt-1 mb-3" style={{ color: "var(--brown-light)" }}>
          {new Date(m.created_at).toLocaleDateString("ru", { day: "numeric", month: "long" })}
        </p>

        {/* PDF reader */}
        {kind === "pdf" && m.url && (
          <PdfReader url={m.url} title={m.title} />
        )}

        {/* Regular file / link */}
        {(kind === "file" || kind === "link") && m.url && (
          <a
            href={m.url}
            target="_blank"
            rel="noopener noreferrer"
            download={kind === "file" ? (m.file_name ?? true) : undefined}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: "var(--theme-accent)", color: "#fff" }}
          >
            {kind === "file" ? "Скачать ↓" : "Открыть →"}
          </a>
        )}

        {/* Text-only: nothing to open */}
        {kind === "text" && (
          <p className="text-xs italic" style={{ color: "var(--brown-light)" }}>
            Файл или ссылка не добавлены
          </p>
        )}
      </div>
    </div>
  );
}

export default async function MaterialsTab({ studentId }: { studentId: string }) {
  const supabase = await createClient();

  const [{ data: directMaterials }, { data: assignedRows }] = await Promise.all([
    supabase.from("materials")
      .select("id, title, content, url, file_name, is_iframe, created_at")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false }),
    supabase.from("material_assignments")
      .select("material_id")
      .eq("student_id", studentId),
  ]);

  const directIds = new Set((directMaterials ?? []).map(m => m.id));
  const junctionIds = (assignedRows ?? []).map(r => r.material_id).filter(id => !directIds.has(id));

  let junctionMaterials: Material[] = [];
  if (junctionIds.length > 0) {
    const { data } = await supabase.from("materials")
      .select("id, title, content, url, file_name, is_iframe, created_at")
      .in("id", junctionIds);
    junctionMaterials = (data ?? []) as Material[];
  }

  const materials: Material[] = [
    ...((directMaterials ?? []) as Material[]),
    ...junctionMaterials,
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (materials.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-3">📂</div>
        <p className="font-semibold text-base" style={{ color: "var(--brown-dark)" }}>
          Материалов пока нет
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--brown-light)" }}>
          Здесь появятся учебники, видео и ссылки от репетитора
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {materials.map(m => <MaterialCard key={m.id} m={m} />)}
    </div>
  );
}

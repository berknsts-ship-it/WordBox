import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PdfReader } from "@/components/student/PdfReader";
import { FileText, Link2, Monitor, BookOpen, ImageIcon, ArrowLeft } from "lucide-react";

function isPdf(fileName: string | null, url: string | null) {
  const s = (fileName ?? url ?? "").toLowerCase();
  return s.endsWith(".pdf") || s.includes(".pdf?");
}

function isImage(fileName: string | null, url: string | null) {
  const s = (fileName ?? url ?? "").toLowerCase();
  return /\.(jpe?g|png|gif|webp|svg)(\?|$)/.test(s);
}

export default async function MaterialViewPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) redirect("/tutor/materials");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: m } = await supabase
    .from("materials")
    .select("id, title, content, url, file_name, is_iframe, created_at")
    .eq("id", id)
    .eq("tutor_id", user.id)
    .single();

  if (!m) redirect("/tutor/materials");

  const kind = m.is_iframe
    ? "iframe"
    : isPdf(m.file_name, m.url)
    ? "pdf"
    : isImage(m.file_name, m.url)
    ? "image"
    : m.file_name
    ? "file"
    : m.url
    ? "link"
    : "text";

  const kindMeta = {
    iframe: { icon: <Monitor size={14} />, label: "Видео / фрейм" },
    pdf:    { icon: <BookOpen size={14} />, label: "PDF" },
    image:  { icon: <ImageIcon size={14} />, label: "Картинка" },
    file:   { icon: <FileText size={14} />, label: "Файл" },
    link:   { icon: <Link2 size={14} />, label: "Ссылка" },
    text:   { icon: <FileText size={14} />, label: "Текст" },
  }[kind];

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/tutor/materials"
          className="flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity"
          style={{ color: "var(--brown-light)" }}
        >
          <ArrowLeft size={14} /> Библиотека
        </Link>
      </div>

      <div
        className="rounded-3xl border overflow-hidden"
        style={{ background: "white", borderColor: "var(--brown-pale)" }}
      >
        {/* Inline iframe */}
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

        {/* Inline image */}
        {kind === "image" && m.url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.url}
            alt={m.title}
            className="w-full"
            style={{ display: "block", maxHeight: "80vh", objectFit: "contain", background: "#f5f5f5" }}
          />
        )}

        <div className="p-5 sm:p-7">
          <div className="flex items-center gap-1.5 mb-2">
            <span style={{ color: "var(--brown-light)" }}>{kindMeta.icon}</span>
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--brown-light)" }}>
              {kindMeta.label}
            </span>
          </div>

          <h1 className="text-xl font-bold leading-snug mb-1" style={{ color: "var(--brown-dark)" }}>
            {m.title}
          </h1>

          {m.content && (
            <p className="text-sm mt-1 mb-4" style={{ color: "var(--brown-mid)" }}>{m.content}</p>
          )}

          <p className="text-xs mb-4" style={{ color: "var(--brown-light)" }}>
            {new Date(m.created_at).toLocaleDateString("ru", { day: "numeric", month: "long", year: "numeric" })}
          </p>

          {/* PDF reader */}
          {kind === "pdf" && m.url && (
            <PdfReader url={m.url} title={m.title} />
          )}

          {/* Download link for regular files */}
          {kind === "file" && m.url && (
            <a
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
              download={m.file_name ?? true}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: "var(--gradient-primary)", color: "#fff" }}
            >
              Скачать ↓
            </a>
          )}

          {/* External link */}
          {kind === "link" && m.url && (
            <a
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: "var(--gradient-primary)", color: "#fff" }}
            >
              Открыть →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

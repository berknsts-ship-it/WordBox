import { createClient } from "@/lib/supabase/server";
import { PdfReader } from "@/components/student/PdfReader";

function isPdf(fileName: string | null, url: string | null) {
  return (
    fileName?.toLowerCase().endsWith(".pdf") ||
    (!fileName && url?.toLowerCase().includes(".pdf"))
  );
}

export default async function MaterialsTab({ studentId }: { studentId: string }) {
  const supabase = await createClient();
  const { data: materials } = await supabase
    .from("materials")
    .select("id, title, content, url, file_name, is_iframe, created_at")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (!materials || materials.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {materials.map((m) => {
        const pdf = isPdf(m.file_name, m.url);
        const icon = m.is_iframe ? "🖥️" : pdf ? "📚" : m.file_name ? "📎" : m.url ? "🔗" : "📄";

        return (
          <div key={m.id} className="rounded-2xl border overflow-hidden"
            style={{ background: "var(--theme-card-bg)", borderColor: "var(--theme-card-border)" }}>

            {/* Встроенный фрейм (видео/сайт) */}
            {m.is_iframe && m.url && (
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

            <div className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5 shrink-0">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-snug" style={{ color: "var(--brown-dark)" }}>
                    {m.title}
                  </p>
                  {m.content && (
                    <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--brown-mid)" }}>
                      {m.content}
                    </p>
                  )}
                  <p className="text-xs mt-1.5" style={{ color: "var(--brown-light)" }}>
                    {new Date(m.created_at).toLocaleDateString("ru", { day: "numeric", month: "long" })}
                  </p>

                  {/* PDF — кнопка «Читать» */}
                  {pdf && m.url && (
                    <div className="mt-3">
                      <PdfReader url={m.url} title={m.title} />
                    </div>
                  )}

                  {/* Не-PDF файл или ссылка — кнопка открыть/скачать */}
                  {!pdf && !m.is_iframe && m.url && (
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={m.file_name || undefined}
                      className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold px-3 py-1.5 rounded-xl transition-colors hover:opacity-80"
                      style={{ background: "var(--brown-pale)", color: "var(--brown-mid)" }}
                    >
                      {m.file_name ? "Скачать ↓" : "Открыть →"}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <p className="text-5xl mb-3">📂</p>
      <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>Материалов пока нет</p>
      <p className="text-sm mt-1" style={{ color: "var(--brown-light)" }}>
        Репетитор добавит сюда файлы, ссылки и видео
      </p>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";

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
      {materials.map((m) => (
        <div key={m.id} className="bg-white/80 rounded-2xl border overflow-hidden"
          style={{ borderColor: "var(--brown-pale)" }}>

          {/* Встроенный фрейм */}
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

          {/* Текст и ссылка */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3 items-start">
                <span className="text-lg mt-0.5">
                  {m.is_iframe ? "🖥️" : m.file_name ? "📎" : m.url ? "🔗" : "📄"}
                </span>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--brown-dark)" }}>{m.title}</p>
                  {m.content && (
                    <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--brown-mid)" }}>
                      {m.content}
                    </p>
                  )}
                  {m.file_name && (
                    <p className="text-xs mt-1" style={{ color: "var(--brown-light)" }}>
                      {m.file_name}
                    </p>
                  )}
                  <p className="text-xs mt-1.5" style={{ color: "var(--brown-light)" }}>
                    {new Date(m.created_at).toLocaleDateString("ru", { day: "numeric", month: "long" })}
                  </p>
                </div>
              </div>
              {m.url && !m.is_iframe && (
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={m.file_name || undefined}
                  className="shrink-0 text-sm font-semibold px-3 py-1.5 rounded-xl transition-colors hover:opacity-80"
                  style={{ background: "var(--brown-pale)", color: "var(--brown-mid)" }}
                >
                  {m.file_name ? "Скачать ↓" : "Открыть →"}
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
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

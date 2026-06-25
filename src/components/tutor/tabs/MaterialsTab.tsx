import { createClient } from "@/lib/supabase/server";
import { addMaterial, deleteMaterial } from "@/app/actions/materials";
import { FileUploadField } from "@/components/tutor/FileUploadField";

export default async function TutorMaterialsTab({ studentId }: { studentId: string }) {
  const supabase = await createClient();
  const { data: materials } = await supabase
    .from("materials")
    .select("id, title, content, url, file_name, is_iframe, created_at")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      {/* Форма */}
      <div className="bg-white/80 rounded-3xl border p-6" style={{ borderColor: "var(--brown-pale)" }}>
        <h2 className="text-base font-semibold mb-4" style={{ color: "var(--brown-dark)" }}>
          Добавить материал
        </h2>
        <form action={addMaterial} className="space-y-4">
          <input type="hidden" name="student_id" value={studentId} />

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
              Название *
            </label>
            <input
              name="title"
              required
              placeholder="Например: Видео — Present Perfect"
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
              Описание / текст
            </label>
            <textarea
              name="content"
              rows={2}
              placeholder="Пояснение к материалу..."
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
              style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
              Ссылка
            </label>
            <input
              name="url"
              type="url"
              placeholder="https://..."
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "var(--brown-pale)" }} />
            <span className="text-xs" style={{ color: "var(--brown-light)" }}>или</span>
            <div className="flex-1 h-px" style={{ background: "var(--brown-pale)" }} />
          </div>

          <FileUploadField
            folder="materials"
            urlFieldName="uploaded_url"
            fileNameFieldName="uploaded_file_name"
          />

          {/* Чекбокс iframe */}
          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:opacity-80 transition-opacity"
            style={{ background: "var(--brown-pale)" }}>
            <input
              type="checkbox"
              name="is_iframe"
              className="mt-0.5 w-4 h-4 accent-amber-700 cursor-pointer"
            />
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--brown-dark)" }}>
                Встроить как фрейм
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--brown-mid)" }}>
                Видео или сайт откроется прямо на странице ученика.
                Для YouTube используй ссылку вида{" "}
                <span className="font-mono">youtube.com/embed/ID</span>
              </p>
            </div>
          </label>

          <button type="submit"
            className="w-full rounded-xl px-4 py-2.5 text-white text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-button)" }}>
            Добавить материал
          </button>
        </form>
      </div>

      {/* Список */}
      {materials && materials.length > 0 && (
        <div className="space-y-3">
          {materials.map((m) => (
            <div key={m.id} className="bg-white/80 rounded-2xl border p-4"
              style={{ borderColor: "var(--brown-pale)" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 items-start flex-1 min-w-0">
                  <span className="text-lg mt-0.5 shrink-0">
                    {m.is_iframe ? "🖥️" : m.file_name ? "📎" : m.url ? "🔗" : "📄"}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm" style={{ color: "var(--brown-dark)" }}>{m.title}</p>
                    {m.content && <p className="text-xs mt-0.5" style={{ color: "var(--brown-light)" }}>{m.content}</p>}
                    {m.file_name && (
                      <p className="text-xs mt-1 truncate" style={{ color: "var(--brown-light)" }}>
                        Файл: {m.file_name}
                      </p>
                    )}
                    {m.url && !m.file_name && (
                      <p className="text-xs mt-1 truncate" style={{ color: "var(--brown-light)" }}>
                        {m.is_iframe ? "Фрейм: " : ""}{m.url}
                      </p>
                    )}
                  </div>
                </div>
                <form action={deleteMaterial.bind(null, m.id, studentId)}>
                  <button type="submit" className="text-xs text-red-400 hover:text-red-600 px-2 py-1 shrink-0">✕</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

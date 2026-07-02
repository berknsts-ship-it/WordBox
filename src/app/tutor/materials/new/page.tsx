import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileUploadField } from "@/components/tutor/FileUploadField";
import { addMaterial } from "@/app/actions/materials";

export default async function NewMaterialPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/tutor/materials" className="text-sm hover:opacity-70 transition-opacity"
          style={{ color: "var(--brown-light)" }}>
          ← Назад
        </Link>
      </div>

      <h1 className="text-2xl mb-2" style={{ color: "var(--brown-dark)" }}>Добавить в библиотеку</h1>
      <p className="text-sm mb-6" style={{ color: "var(--brown-light)" }}>
        Материал попадёт в общую библиотеку. Назначить его ученикам можно оттуда.
      </p>

      <div className="bg-white/80 rounded-3xl border p-6" style={{ borderColor: "var(--brown-pale)" }}>
        <form action={addMaterial} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
              Название *
            </label>
            <input
              name="title"
              required
              placeholder="Например: Учебник Spotlight 7"
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
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

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
              Описание / текст
            </label>
            <textarea
              name="content"
              rows={3}
              placeholder="Заметки, пояснение к материалу..."
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
              style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
            />
          </div>

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

          <button
            type="submit"
            className="w-full rounded-xl px-4 py-2.5 text-white text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-button)" }}
          >
            Добавить в библиотеку
          </button>
        </form>
      </div>
    </div>
  );
}

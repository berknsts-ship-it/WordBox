import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

async function addMaterial(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const student_id = formData.get("student_id") as string;

  let url: string | null = (formData.get("url") as string) || null;
  let file_name: string | null = null;

  const file = formData.get("file") as File | null;
  if (file && file.size > 0) {
    const ext = file.name.split(".").pop();
    const path = `materials/${user.id}/${Date.now()}.${ext}`;
    const { data: uploadData } = await supabase.storage
      .from("wordbox")
      .upload(path, file);

    if (uploadData) {
      const { data: urlData } = supabase.storage
        .from("wordbox")
        .getPublicUrl(uploadData.path);
      url = urlData.publicUrl;
      file_name = file.name;
    }
  }

  await supabase.from("materials").insert({
    student_id,
    tutor_id: user.id,
    title: formData.get("title") as string,
    content: (formData.get("content") as string) || null,
    url,
    file_name,
    is_iframe: formData.get("is_iframe") === "on",
  });

  redirect(`/tutor/students/${student_id}`);
}

export default async function NewMaterialPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: students } = await supabase
    .from("students")
    .select("id, name")
    .eq("tutor_id", user!.id)
    .order("name");

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/tutor/dashboard" className="text-sm hover:opacity-70 transition-opacity"
          style={{ color: "var(--brown-light)" }}>
          ← Назад
        </Link>
      </div>

      <h1 className="text-2xl mb-6">Добавить материал</h1>

      <div className="bg-white/80 rounded-3xl border p-6" style={{ borderColor: "var(--brown-pale)" }}>
        <form action={addMaterial} encType="multipart/form-data" className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
              Ученик *
            </label>
            <select
              name="student_id"
              required
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
            >
              <option value="">Выбери ученика</option>
              {students?.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
              Название *
            </label>
            <input
              name="title"
              required
              placeholder="Статья про Present Perfect..."
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

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
              Загрузить файл с компьютера
            </label>
            <input
              name="file"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp3,.mp4,.txt"
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none
                file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0
                file:text-xs file:font-semibold file:cursor-pointer"
              style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
            />
            <p className="text-xs mt-1" style={{ color: "var(--brown-light)" }}>
              PDF, Word, картинки, аудио — до 10 МБ
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
              Текст / описание
            </label>
            <textarea
              name="content"
              rows={4}
              placeholder="Заметки, текст упражнения..."
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
              style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
            />
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--brown-mid)" }}>
            <input type="checkbox" name="is_iframe" className="rounded" />
            Встроить ссылку (iframe)
          </label>

          <button
            type="submit"
            className="w-full rounded-xl px-4 py-2.5 text-white text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ background: "var(--brown-mid)" }}
          >
            Добавить материал
          </button>
        </form>
      </div>
    </div>
  );
}

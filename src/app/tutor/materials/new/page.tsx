"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, Link as LinkIcon } from "lucide-react";

export default function NewMaterialPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [isIframe, setIsIframe] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isUploading = progress !== null && progress < 100;
  const hasContent = uploadedUrl || urlInput.trim();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setUploadedUrl(null);
    setUploadedName(null);
    setUploadError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", f);
    formData.append("folder", "materials");

    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 90));
      };
      xhr.onload = async () => {
        if (xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          setUploadedUrl(data.url);
          setUploadedName(data.name);
          setProgress(100);
        } else {
          setUploadError("Ошибка загрузки файла. Попробуй снова.");
          setProgress(null);
        }
        resolve();
      };
      xhr.onerror = () => {
        setUploadError("Ошибка сети при загрузке.");
        setProgress(null);
        resolve();
      };
      xhr.send(formData);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setSubmitError("Укажи название"); return; }
    if (isUploading) { setSubmitError("Подожди, файл ещё загружается..."); return; }
    if (!hasContent) { setSubmitError("Прикрепи файл или введи ссылку"); return; }
    setSubmitError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/materials/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim() || null,
          url: uploadedUrl || urlInput.trim() || null,
          file_name: uploadedName || null,
          is_iframe: isIframe,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Ошибка сохранения");
      router.push("/tutor/materials");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Ошибка");
      setSaving(false);
    }
  }

  function clearFile() {
    setFile(null);
    setUploadedUrl(null);
    setUploadedName(null);
    setProgress(null);
    setUploadError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.push("/tutor/materials")}
          className="text-sm hover:opacity-70 transition-opacity"
          style={{ color: "var(--brown-light)" }}>
          ← Назад
        </button>
      </div>

      <h1 className="text-2xl mb-2" style={{ color: "var(--brown-dark)" }}>Добавить в библиотеку</h1>
      <p className="text-sm mb-6" style={{ color: "var(--brown-light)" }}>
        Материал попадёт в общую библиотеку. Назначить его ученикам можно оттуда.
      </p>

      <div className="bg-white/80 rounded-3xl border p-6" style={{ borderColor: "var(--brown-pale)" }}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Название */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
              Название *
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="Например: Учебник Spotlight 7"
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
            />
          </div>

          {/* Файл */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
              Загрузить файл (PDF, картинка, документ — до 4 МБ)
            </label>
            {file ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                style={{ borderColor: "var(--brown-pale)", background: "var(--cream)" }}>
                <FileText size={18} style={{ color: "var(--brown-light)", flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: "var(--brown-dark)" }}>{file.name}</p>
                  <p className="text-xs" style={{ color: "var(--brown-light)" }}>
                    {(file.size / 1024 / 1024).toFixed(1)} МБ
                  </p>
                </div>
                {!isUploading && (
                  <button type="button" onClick={clearFile} className="shrink-0">
                    <X size={16} style={{ color: "var(--brown-light)" }} />
                  </button>
                )}
              </div>
            ) : (
              <label
                className="flex flex-col items-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:opacity-70"
                style={{ borderColor: "var(--brown-pale)", color: "var(--brown-light)" }}
              >
                <Upload size={24} />
                <span className="text-sm">Нажми или перетащи файл</span>
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.mp3,.mp4,.txt"
                  onChange={handleFileChange}
                />
              </label>
            )}

            {/* Прогресс */}
            {isUploading && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs" style={{ color: "var(--brown-mid)" }}>
                  <span>Загружаем файл...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full rounded-full overflow-hidden" style={{ height: 5, background: "var(--brown-pale)" }}>
                  <div className="h-full rounded-full transition-all duration-200"
                    style={{ width: `${progress}%`, background: "var(--gradient-primary)" }} />
                </div>
              </div>
            )}
            {progress === 100 && !uploadError && (
              <p className="text-xs mt-1 font-medium" style={{ color: "#4a7a5e" }}>✓ Файл загружен</p>
            )}
            {uploadError && <p className="text-xs mt-1 text-red-500">{uploadError}</p>}
          </div>

          {/* Разделитель */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "var(--brown-pale)" }} />
            <span className="text-xs" style={{ color: "var(--brown-light)" }}>или</span>
            <div className="flex-1 h-px" style={{ background: "var(--brown-pale)" }} />
          </div>

          {/* Ссылка */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
              Ссылка
            </label>
            <div className="relative">
              <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--brown-light)" }} />
              <input
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                type="url"
                placeholder="https://..."
                className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none"
                style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
              />
            </div>
          </div>

          {/* Описание */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
              Описание (необязательно)
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={2}
              placeholder="Заметки, пояснение к материалу..."
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
              style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
            />
          </div>

          {/* Iframe */}
          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:opacity-80 transition-opacity"
            style={{ background: "var(--brown-pale)" }}>
            <input
              type="checkbox"
              checked={isIframe}
              onChange={e => setIsIframe(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-amber-700 cursor-pointer"
            />
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--brown-dark)" }}>Встроить как фрейм</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--brown-mid)" }}>
                Видео или сайт откроется прямо на странице ученика.
                Для YouTube используй ссылку{" "}
                <span className="font-mono">youtube.com/embed/ID</span>
              </p>
            </div>
          </label>

          {submitError && <p className="text-sm text-red-600">{submitError}</p>}

          <button
            type="submit"
            disabled={isUploading || saving}
            className="w-full rounded-xl px-4 py-2.5 text-white text-sm font-semibold transition-opacity disabled:opacity-50 hover:opacity-80 flex items-center justify-center gap-2"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-button)" }}
          >
            <Upload size={15} />
            {saving ? "Сохраняем..." : isUploading ? `Загрузка ${progress}%...` : "Добавить в библиотеку"}
          </button>
        </form>
      </div>
    </div>
  );
}

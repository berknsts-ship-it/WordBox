"use client";

import { useState } from "react";

interface Props {
  folder: string;
  urlFieldName: string;
  fileNameFieldName: string;
}

export function FileUploadField({ folder, urlFieldName, fileNameFieldName }: Props) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [uploadedName, setUploadedName] = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("[upload] ошибка:", res.status, err);
        setStatus("error");
        return;
      }

      const data = await res.json();
      setUploadedUrl(data.url);
      setUploadedName(data.name);
      setStatus("done");
    } catch (err) {
      console.error("[upload] исключение:", err);
      setStatus("error");
    }
  }

  return (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: "var(--brown-mid)" }}>
        Загрузить файл с компьютера
      </label>

      <input
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp3,.mp4,.txt"
        onChange={handleChange}
        className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none
          file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0
          file:text-xs file:font-semibold file:cursor-pointer"
        style={{ background: "var(--cream)", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}
      />

      {status === "uploading" && (
        <p className="text-xs mt-1" style={{ color: "var(--brown-light)" }}>Загружаю...</p>
      )}
      {status === "done" && (
        <p className="text-xs mt-1 font-semibold" style={{ color: "var(--brown-mid)" }}>✓ {uploadedName}</p>
      )}
      {status === "error" && (
        <p className="text-xs mt-1 text-red-500">Ошибка загрузки. Попробуй ещё раз.</p>
      )}
      {status === "idle" && (
        <p className="text-xs mt-1" style={{ color: "var(--brown-light)" }}>PDF, Word, картинки, аудио — до 4 МБ</p>
      )}

      <input type="hidden" name={urlFieldName} value={uploadedUrl} />
      <input type="hidden" name={fileNameFieldName} value={uploadedName} />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { createVocabularySetImport, type VocabularySetInput } from "@/app/actions/vocabulary";
import { parseVocabularySetImport } from "./parseImport";

const inputStyle = { borderColor: "var(--brown-pale)", background: "#fdf8f0", color: "var(--brown-dark)" };
const card = { background: "white", borderColor: "var(--brown-pale)" };

const EXAMPLE = `{
  "title": "Урок 1: буквы s a t",
  "words": [
    { "english": "Ss", "russian": "[s] — звук с", "example": "sat" },
    { "english": "at", "russian": "э-т → at", "example_sentence": "The cat is ___ home." }
  ]
}`;

export default function ImportVocabularySet() {
  const router = useRouter();
  const [raw, setRaw] = useState("");
  const [preview, setPreview] = useState<VocabularySetInput | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function handlePreview() {
    setSaveError(null);
    if (!raw.trim()) { setParseError("Вставьте JSON набора"); setPreview(null); return; }
    const result = parseVocabularySetImport(raw);
    if (!result.ok) { setParseError(result.error); setPreview(null); return; }
    setParseError(null);
    setPreview(result.data);
  }

  async function handleSave() {
    if (!preview) return;
    setSaving(true);
    setSaveError(null);
    const result = await createVocabularySetImport(preview);
    setSaving(false);
    if (result.error) { setSaveError(result.error); return; }
    router.push(`/tutor/vocabulary/${result.id}`);
    router.refresh();
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="rounded-2xl border p-5 space-y-3" style={card}>
        <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: "var(--brown-mid)" }}>
          JSON набора
        </label>
        <textarea
          value={raw}
          onChange={e => { setRaw(e.target.value); setPreview(null); setParseError(null); }}
          placeholder={EXAMPLE}
          rows={14}
          className="w-full px-3 py-2.5 rounded-xl border outline-none text-xs font-mono"
          style={inputStyle}
        />
        <button
          type="button" onClick={handlePreview}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
          style={{ background: "var(--gradient-primary)" }}
        >
          Показать превью
        </button>
        {parseError && (
          <div className="rounded-xl border-2 p-3 flex items-start gap-2" style={{ borderColor: "#e05030", background: "#fff3f0" }}>
            <AlertTriangle size={16} className="shrink-0 mt-0.5" style={{ color: "#c04020" }} />
            <p className="text-sm" style={{ color: "#a03020" }}>{parseError}</p>
          </div>
        )}
      </div>

      {preview && (
        <div className="space-y-4">
          <div className="rounded-xl border-2 p-3 flex items-center gap-2" style={{ borderColor: "#8fbf8f", background: "#f2faf2" }}>
            <CheckCircle2 size={16} style={{ color: "#2a7a3a" }} />
            <p className="text-sm font-semibold" style={{ color: "#2a7a3a" }}>
              JSON разобран корректно — проверьте превью перед сохранением
            </p>
          </div>

          <div className="rounded-2xl border p-5" style={card}>
            <p className="font-bold text-lg" style={{ color: "var(--brown-dark)" }}>{preview.title}</p>
            <p className="text-sm mt-1" style={{ color: "var(--brown-light)" }}>{preview.words.length} слов</p>
          </div>

          <div className="rounded-2xl border p-4 space-y-1.5" style={card}>
            {preview.words.map((w, i) => (
              <div key={i} className="text-sm px-3 py-2 rounded-lg" style={{ background: "#fefcf8" }}>
                <span className="font-semibold" style={{ color: "var(--brown-dark)" }}>{i + 1}. {w.english}</span>
                <span className="ml-2" style={{ color: "#2a7a3a" }}>→ {w.russian}</span>
                {w.example && (
                  <span className="ml-2 text-xs" style={{ color: "var(--brown-light)" }}>[{w.example}]</span>
                )}
                {w.example_sentence && (
                  <div className="text-xs mt-0.5" style={{ color: "var(--brown-light)" }}>{w.example_sentence}</div>
                )}
              </div>
            ))}
          </div>

          {saveError && <p className="text-sm text-red-600">{saveError}</p>}

          <button
            type="button" onClick={handleSave} disabled={saving}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90 transition-all"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-button)" }}
          >
            {saving ? "Сохраняю…" : "Сохранить набор"}
          </button>
        </div>
      )}
    </div>
  );
}

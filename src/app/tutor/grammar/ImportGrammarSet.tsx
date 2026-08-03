"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { createGrammarSet, type SetInput } from "@/app/actions/grammar";
import { parseGrammarSetImport } from "./parseImport";

const TYPE_LABELS: Record<string, string> = {
  bracket: "Раскрыть скобки",
  mcq: "Выбор варианта",
  true_false: "Верно / неверно",
  fix_error: "Исправить ошибку",
  gap_fill: "Пропуск",
  word_order: "Порядок слов",
};

const inputStyle = { borderColor: "var(--brown-pale)", background: "#fdf8f0", color: "var(--brown-dark)" };
const card = { background: "white", borderColor: "var(--brown-pale)" };

const EXAMPLE = `{
  "title": "Present Perfect — практика",
  "description": "10 упражнений на времена",
  "exercises": [
    {
      "type": "bracket",
      "instruction": "Раскрой скобки, поставь глагол в Present Perfect",
      "items": [
        { "question": "I ___ (never/be) to Paris", "correct_answer": "have never been", "points": 1 },
        { "question": "She ___ (already/finish) her homework", "correct_answer": "has already finished|has finished already", "points": 1 }
      ]
    },
    {
      "type": "mcq",
      "instruction": "Выбери правильный вариант",
      "items": [
        { "question": "She ___ to work every day.", "options": ["go", "goes", "gone", "going"], "correct_answer": "B", "points": 1 }
      ]
    },
    {
      "type": "word_order",
      "instruction": "Собери предложение из слов",
      "items": [
        { "question": "She has never been to London", "correct_answer": "She has never been to London", "points": 1 }
      ]
    }
  ]
}`;

export default function ImportGrammarSet() {
  const router = useRouter();
  const [raw, setRaw] = useState("");
  const [preview, setPreview] = useState<SetInput | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function handlePreview() {
    setSaveError(null);
    if (!raw.trim()) { setParseError("Вставьте JSON набора"); setPreview(null); return; }
    const result = parseGrammarSetImport(raw);
    if (!result.ok) { setParseError(result.error); setPreview(null); return; }
    setParseError(null);
    setPreview(result.data);
  }

  async function handleSave() {
    if (!preview) return;
    setSaving(true);
    setSaveError(null);
    const result = await createGrammarSet(preview);
    setSaving(false);
    if (result.error) { setSaveError(result.error); return; }
    router.push("/tutor/grammar");
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
            {preview.description && (
              <p className="text-sm mt-1" style={{ color: "var(--brown-light)" }}>{preview.description}</p>
            )}
          </div>

          {preview.exercises.map((block, i) => (
            <div key={i} className="rounded-2xl border p-4" style={card}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-bold" style={{ color: "var(--brown-mid)" }}>Упражнение {i + 1}</span>
                <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: "var(--brown-pale)", color: "var(--brown-dark)" }}>
                  {TYPE_LABELS[block.type] ?? block.type}
                </span>
              </div>
              {block.instruction && (
                <p className="text-sm mb-3 italic" style={{ color: "var(--brown-mid)" }}>{block.instruction}</p>
              )}
              <div className="space-y-1.5">
                {block.items.map((item, j) => (
                  <div key={j} className="text-sm px-3 py-2 rounded-lg" style={{ background: "#fefcf8" }}>
                    <span style={{ color: "var(--brown-dark)" }}>{j + 1}. {item.question}</span>
                    <span className="ml-2 font-semibold" style={{ color: "#2a7a3a" }}>→ {item.correct_answer}</span>
                    {item.options && (
                      <span className="ml-2 text-xs" style={{ color: "var(--brown-light)" }}>
                        [{item.options.join(" / ")}]
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

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

"use client";

import { useState } from "react";
import { Plus, X, Volume2 } from "lucide-react";
import { createTopic } from "@/app/actions/vocabulary";

interface Student { id: string; name: string; }

interface WordRow {
  english: string;
  russian: string;
  example: string;
  sentence: string;
}

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

const EMPTY_ROW: WordRow = { english: "", russian: "", example: "", sentence: "" };

export default function NewTopicForm({ students }: { students: Student[] }) {
  const [rows, setRows] = useState<WordRow[]>([{ ...EMPTY_ROW }, { ...EMPTY_ROW }, { ...EMPTY_ROW }]);
  const [submitting, setSubmitting] = useState(false);

  const input = {
    background: "var(--cream)",
    border: "1.5px solid var(--brown-pale)",
    color: "var(--brown-dark)",
  };

  function updateRow(i: number, field: keyof WordRow, value: string) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }

  function addRow() {
    setRows((r) => [...r, { ...EMPTY_ROW }]);
  }

  function removeRow(i: number) {
    setRows((r) => r.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    rows.forEach((row, i) => {
      fd.set(`english_${i}`, row.english);
      fd.set(`russian_${i}`, row.russian);
      fd.set(`example_${i}`, row.example);
      fd.set(`sentence_${i}`, row.sentence);
    });
    await createTopic(fd);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Название + ученик */}
      <div className="rounded-2xl border p-5 space-y-4" style={{ background: "white", borderColor: "var(--brown-pale)" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "var(--brown-mid)" }}>
              Название темы *
            </label>
            <input
              name="name"
              required
              placeholder="Например: Irregular verbs"
              className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm"
              style={input}
            />
          </div>
          {students.length > 0 && (
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: "var(--brown-mid)" }}>
                Ученик
              </label>
              <select
                name="student_id"
                className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm"
                style={input}
              >
                <option value="">Без назначения</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Строки со словами */}
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div
            key={i}
            className="rounded-2xl border p-4 space-y-2.5"
            style={{ background: "white", borderColor: "var(--brown-pale)" }}
          >
            {/* Слово + перевод */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex gap-1.5">
                <input
                  value={row.english}
                  onChange={(e) => updateRow(i, "english", e.target.value)}
                  placeholder="Слово / фраза"
                  className="flex-1 px-3 py-2 rounded-xl border outline-none text-sm"
                  style={input}
                />
                <button
                  type="button"
                  onClick={() => row.english && speak(row.english)}
                  disabled={!row.english}
                  className="px-2.5 rounded-xl border hover:opacity-80 disabled:opacity-30 transition-all shrink-0"
                  style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)" }}
                  title="Произнести"
                >
                  <Volume2 size={14} />
                </button>
              </div>
              <input
                value={row.russian}
                onChange={(e) => updateRow(i, "russian", e.target.value)}
                placeholder="Перевод"
                className="px-3 py-2 rounded-xl border outline-none text-sm"
                style={input}
              />
            </div>

            {/* Пример */}
            <input
              value={row.example}
              onChange={(e) => updateRow(i, "example", e.target.value)}
              placeholder="Пример предложения (необязательно)"
              className="w-full px-3 py-2 rounded-xl border outline-none text-sm"
              style={input}
            />

            {/* Предложение с ___ */}
            <input
              value={row.sentence}
              onChange={(e) => updateRow(i, "sentence", e.target.value)}
              placeholder="Предложение с ___ (для задания «вставь слово»)"
              className="w-full px-3 py-2 rounded-xl border outline-none text-sm"
              style={input}
            />

            {rows.length > 1 && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="flex items-center gap-1 text-xs hover:opacity-70 transition-all"
                  style={{ color: "var(--brown-light)" }}
                >
                  <X size={12} /> Удалить
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-all"
        style={{ color: "var(--brown-mid)" }}
      >
        <Plus size={16} /> Добавить карточку
      </button>

      <div className="flex gap-3 pt-2">
        <a
          href="/tutor/vocabulary"
          className="flex-1 py-2.5 rounded-xl border font-semibold text-sm text-center hover:opacity-80 transition-all"
          style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)" }}
        >
          Отмена
        </a>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white hover:opacity-80 disabled:opacity-60 transition-all"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-button)" }}
        >
          {submitting ? "Сохраняем…" : "Создать тему"}
        </button>
      </div>
    </form>
  );
}

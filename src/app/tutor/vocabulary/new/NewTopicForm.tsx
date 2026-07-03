"use client";

import { useState } from "react";
import { Plus, Sparkles, X, Volume2, ChevronDown, ChevronUp } from "lucide-react";
import { createTopic } from "@/app/actions/vocabulary";
import { generateVocabularySet, generateWordExample, generateFillBlank } from "@/app/actions/ai";

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

const AI_PROMPTS = [
  "Неправильные глаголы — топ 10",
  "Части тела на английском, 10 слов",
  "Еда и напитки, 8 слов",
  "Прилагательные для описания характера",
  "Фразовые глаголы с get, 8 штук",
];

export default function NewTopicForm({ students }: { students: Student[] }) {
  const [rows, setRows] = useState<WordRow[]>([{ ...EMPTY_ROW }, { ...EMPTY_ROW }, { ...EMPTY_ROW }]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAi, setShowAi] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [rowAiLoading, setRowAiLoading] = useState<Record<number, "example" | "sentence" | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  async function generateBulk() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setError("");
    const res = await generateVocabularySet(aiPrompt.trim());
    setAiLoading(false);
    if (res.error) { setError(res.error); return; }
    if (res.words) {
      setRows(res.words.map((w) => ({
        english: w.english,
        russian: w.russian,
        example: w.example,
        sentence: "",
      })));
      setShowAi(false);
      setAiPrompt("");
    }
  }

  async function getExample(i: number) {
    const { english, russian } = rows[i];
    if (!english) return;
    setRowAiLoading((r) => ({ ...r, [i]: "example" }));
    const res = await generateWordExample(english, russian);
    setRowAiLoading((r) => ({ ...r, [i]: null }));
    if (res.example) updateRow(i, "example", res.example);
  }

  async function getSentence(i: number) {
    const { english, russian } = rows[i];
    if (!english) return;
    setRowAiLoading((r) => ({ ...r, [i]: "sentence" }));
    const res = await generateFillBlank(english, russian);
    setRowAiLoading((r) => ({ ...r, [i]: null }));
    if (res.sentence) updateRow(i, "sentence", res.sentence);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    rows.forEach((row, i) => {
      fd.set(`english_${i}`, row.english);
      fd.set(`russian_${i}`, row.russian);
      fd.set(`example_${i}`, row.example);
      fd.set(`sentence_${i}`, row.sentence);
    });
    await createTopic(fd);
    // redirect happens inside createTopic
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

      {/* ИИ-генерация всего набора */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--brown-pale)" }}>
        <button
          type="button"
          onClick={() => setShowAi((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:opacity-80 transition-all"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={15} style={{ color: "var(--brown-mid)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--brown-dark)" }}>
              Сгенерировать слова с ИИ
            </span>
          </div>
          {showAi ? <ChevronUp size={15} style={{ color: "var(--brown-light)" }} /> : <ChevronDown size={15} style={{ color: "var(--brown-light)" }} />}
        </button>

        {showAi && (
          <div className="px-5 pb-5 border-t space-y-3" style={{ borderColor: "var(--brown-pale)" }}>
            <p className="text-xs pt-3" style={{ color: "var(--brown-light)" }}>
              Опиши тему — ИИ создаст карточки и заполнит таблицу ниже
            </p>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={2}
              placeholder="Например: «Неправильные глаголы, 10 штук» или «Профессии на английском для начинающих»"
              className="w-full px-3 py-2.5 rounded-xl border outline-none resize-none text-sm"
              style={input}
            />
            <div className="flex flex-wrap gap-1.5">
              {AI_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAiPrompt(p)}
                  className="text-xs px-2.5 py-1 rounded-full border hover:opacity-80 transition-all"
                  style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)", background: "white" }}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={generateBulk}
              disabled={aiLoading || !aiPrompt.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-80 disabled:opacity-50 transition-all"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles size={14} />
              {aiLoading ? "Генерирую…" : "Создать карточки"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm px-4 py-2 rounded-xl bg-red-50 text-red-600">{error}</p>
      )}

      {/* Строки со словами */}
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div
            key={i}
            className="rounded-2xl border p-4 space-y-2.5"
            style={{ background: "white", borderColor: "var(--brown-pale)" }}
          >
            {/* Строка 1: слово + перевод */}
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

            {/* Строка 2: пример + кнопка ИИ */}
            <div className="flex gap-2">
              <input
                value={row.example}
                onChange={(e) => updateRow(i, "example", e.target.value)}
                placeholder="Пример предложения (необязательно)"
                className="flex-1 px-3 py-2 rounded-xl border outline-none text-sm"
                style={input}
              />
              <button
                type="button"
                onClick={() => getExample(i)}
                disabled={rowAiLoading[i] === "example" || !row.english}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-white shrink-0 hover:opacity-80 disabled:opacity-40 transition-all"
                style={{ background: "var(--gradient-primary)" }}
                title="Сгенерировать пример"
              >
                <Sparkles size={12} />
                {rowAiLoading[i] === "example" ? "…" : "Пример"}
              </button>
            </div>

            {/* Строка 3: предложение с ___ + кнопка ИИ */}
            <div className="flex gap-2">
              <input
                value={row.sentence}
                onChange={(e) => updateRow(i, "sentence", e.target.value)}
                placeholder="Предложение с ___ (для задания «вставь слово»)"
                className="flex-1 px-3 py-2 rounded-xl border outline-none text-sm"
                style={input}
              />
              <button
                type="button"
                onClick={() => getSentence(i)}
                disabled={rowAiLoading[i] === "sentence" || !row.english}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 hover:opacity-80 disabled:opacity-40 transition-all border"
                style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)" }}
                title="Сгенерировать задание"
              >
                <Sparkles size={12} />
                {rowAiLoading[i] === "sentence" ? "…" : "Задание"}
              </button>
            </div>

            {/* Удалить строку */}
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

      {/* Кнопки */}
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

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { saveGrammarProgress, submitGrammarAttempt, type ExerciseType, type GrammarItemResult } from "@/app/actions/grammar";

type Item = { id: string; points: number; options: string[] | null };
type Block = { id: string; type: ExerciseType; instruction: string | null; items: Item[] };
type AnswerMap = Record<string, string>;
type ResultData = { score: number; maxScore: number; results: Record<string, GrammarItemResult> };

const TYPE_LABELS: Record<ExerciseType, string> = {
  bracket: "Раскрыть скобки",
  mcq: "Выбор варианта",
  true_false: "Верно / неверно",
  fix_error: "Исправить ошибку",
  gap_fill: "Пропуск",
  word_order: "Порядок слов",
};

function WordOrderPicker({ words, answer, onAnswer, disabled }: { words: string[]; answer: string; onAnswer: (a: string) => void; disabled?: boolean }) {
  const chosen = answer ? answer.split(/\s+/).filter(Boolean) : [];
  const remaining = [...words];
  for (const w of chosen) {
    const idx = remaining.indexOf(w);
    if (idx !== -1) remaining.splice(idx, 1);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[44px] p-2.5 rounded-xl border-2 border-dashed" style={{ borderColor: "var(--brown-pale)" }}>
        {chosen.length === 0 && <span className="text-xs self-center" style={{ color: "var(--brown-light)" }}>Собирайте предложение, нажимая на слова ниже</span>}
        {chosen.map((w, i) => (
          <button key={i} type="button" disabled={disabled}
            onClick={() => onAnswer(chosen.filter((_, j) => j !== i).join(" "))}
            className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-70"
            style={{ background: "var(--brown-dark)", color: "white" }}>
            {w}
          </button>
        ))}
      </div>
      {!disabled && (
        <div className="flex flex-wrap gap-2">
          {remaining.map((w, i) => (
            <button key={i} type="button"
              onClick={() => onAnswer([...chosen, w].join(" "))}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border hover:opacity-80 transition-all"
              style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)", background: "white" }}>
              {w}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ItemInput({ item, type, answer, onAnswer }: { item: Item; type: ExerciseType; answer: string; onAnswer: (a: string) => void }) {
  const inputStyle = { borderColor: "var(--brown-pale)", color: "var(--brown-dark)" };

  if (type === "mcq") {
    const opts = item.options ?? [];
    return (
      <div className="space-y-2">
        {opts.map((opt, i) => {
          const letter = ["A", "B", "C", "D"][i];
          const selected = answer === letter;
          return (
            <button key={letter} type="button" onClick={() => onAnswer(letter)}
              className="w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm"
              style={{
                borderColor: selected ? "var(--brown-dark)" : "var(--brown-pale)",
                background: selected ? "var(--brown-pale)" : "white",
                color: "var(--brown-dark)",
                fontWeight: selected ? 600 : 400,
              }}>
              <span className="font-bold mr-2" style={{ color: "var(--brown-mid)" }}>{letter}.</span>
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  if (type === "true_false") {
    return (
      <div className="flex gap-3">
        {(["true", "false"] as const).map(v => (
          <button key={v} type="button" onClick={() => onAnswer(v)}
            className="flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all"
            style={{
              borderColor: answer === v ? "var(--brown-dark)" : "var(--brown-pale)",
              background: answer === v ? "var(--brown-pale)" : "white",
              color: "var(--brown-dark)",
            }}>
            {v === "true" ? "Верно" : "Неверно"}
          </button>
        ))}
      </div>
    );
  }

  if (type === "word_order") {
    return <WordOrderPicker words={item.options ?? []} answer={answer} onAnswer={onAnswer} />;
  }

  // bracket, gap_fill, fix_error
  return (
    <input type="text" value={answer} onChange={e => onAnswer(e.target.value)}
      className="w-full px-4 py-2.5 rounded-xl border-2 outline-none text-sm" style={inputStyle}
      placeholder="Ваш ответ..." />
  );
}

export default function GrammarPractice({
  assignmentId, code, setTitle, setDescription, exercises, initialAnswers, initialResult,
}: {
  assignmentId: string;
  code: string;
  setTitle: string;
  setDescription: string | null;
  exercises: Block[];
  initialAnswers: AnswerMap;
  initialStatus: "not_started" | "in_progress" | "completed";
  initialResult: ResultData | null;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerMap>(initialAnswers);
  const [result, setResult] = useState<ResultData | null>(initialResult);
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const skipFirstSave = useRef(true);
  useEffect(() => {
    if (result) return; // уже сдано — не автосохранять
    if (skipFirstSave.current) { skipFirstSave.current = false; return; }
    setSaveStatus("saving");
    const t = setTimeout(async () => {
      const res = await saveGrammarProgress(assignmentId, answers);
      setSaveStatus(res?.error ? "idle" : "saved");
    }, 2500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers]);

  const setAnswer = (itemId: string, value: string) => setAnswers(prev => ({ ...prev, [itemId]: value }));

  async function handleSubmit() {
    if (submitting || result) return;
    setSubmitting(true);
    const res = await submitGrammarAttempt(assignmentId, answers);
    setSubmitting(false);
    if (res.error) return;
    setResult({ score: res.score!, maxScore: res.maxScore!, results: res.results! });
  }

  const totalItems = exercises.reduce((a, b) => a + b.items.length, 0);
  const answeredCount = exercises.reduce((a, b) => a + b.items.filter(it => (answers[it.id] ?? "").trim()).length, 0);

  // ── Результат ──
  if (result) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="rounded-2xl border p-6 text-center" style={{ background: "white", borderColor: "var(--brown-pale)" }}>
          <p className="text-4xl mb-3">{result.score >= result.maxScore * 0.7 ? "🎉" : "📝"}</p>
          <h2 className="text-xl font-bold mb-1" style={{ color: "var(--brown-dark)" }}>{setTitle}</h2>
          <p className="text-lg font-semibold" style={{ color: "var(--brown-mid)" }}>
            {result.score} / {result.maxScore} баллов
          </p>
        </div>

        {exercises.map((block, bi) => (
          <div key={block.id} className="rounded-2xl border p-4" style={{ background: "white", borderColor: "var(--brown-pale)" }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold" style={{ color: "var(--brown-mid)" }}>Упражнение {bi + 1}</span>
              <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: "var(--brown-pale)", color: "var(--brown-dark)" }}>
                {TYPE_LABELS[block.type]}
              </span>
            </div>
            {block.instruction && <p className="text-sm mb-3 italic" style={{ color: "var(--brown-mid)" }}>{block.instruction}</p>}
            <div className="space-y-2">
              {block.items.map((item, i) => {
                const r = result.results[item.id];
                return (
                  <div key={item.id} className="text-sm px-3 py-2.5 rounded-lg flex items-start gap-2"
                    style={{ background: r?.correct ? "#f2faf2" : "#fff3f0" }}>
                    {r?.correct ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" style={{ color: "#2a7a3a" }} /> : <XCircle size={16} className="shrink-0 mt-0.5" style={{ color: "#c04020" }} />}
                    <div className="flex-1 min-w-0">
                      <p style={{ color: "var(--brown-dark)" }}>
                        {i + 1}. Ваш ответ: <span className="font-medium">{answers[item.id] || "—"}</span>
                      </p>
                      {!r?.correct && (
                        <>
                          <p className="text-xs mt-0.5" style={{ color: "var(--brown-mid)" }}>
                            Правильно: <span className="font-medium">{r?.correct_answer}</span>
                          </p>
                          {r?.explanation && <p className="text-xs mt-1 italic" style={{ color: "var(--brown-light)" }}>{r.explanation}</p>}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <button onClick={() => router.push(`/student/${code}?tab=trainer&sub=exercises`)}
          className="w-full py-3 rounded-2xl font-semibold text-white"
          style={{ background: "var(--gradient-primary)" }}>
          К списку упражнений
        </button>
      </div>
    );
  }

  // ── Прохождение ──
  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 z-10 -mx-4 px-4 py-3 mb-5 flex items-center justify-between"
        style={{ background: "var(--theme-bg, #f8f4ee)" }}>
        <div className="min-w-0">
          <h1 className="font-bold text-base truncate" style={{ color: "var(--brown-dark)" }}>{setTitle}</h1>
          {setDescription && <p className="text-xs truncate" style={{ color: "var(--brown-light)" }}>{setDescription}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {saveStatus !== "idle" && (
            <span className="text-xs hidden sm:inline" style={{ color: saveStatus === "saving" ? "var(--brown-light)" : "#1a7a3a" }}>
              {saveStatus === "saving" ? "Сохраняем…" : "Черновик сохранён ✓"}
            </span>
          )}
          <span className="text-xs font-mono" style={{ color: "var(--brown-mid)" }}>{answeredCount}/{totalItems}</span>
          <button onClick={handleSubmit} disabled={submitting}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--gradient-primary)" }}>
            {submitting ? "Отправляю..." : "Сдать работу"}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {exercises.map((block, bi) => (
          <div key={block.id} className="rounded-2xl border p-5 space-y-4"
            style={{ background: "white", borderColor: "var(--brown-pale)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm" style={{ color: "var(--brown-dark)" }}>Упражнение {bi + 1}</p>
                <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: "var(--brown-pale)", color: "var(--brown-dark)" }}>
                  {TYPE_LABELS[block.type]}
                </span>
              </div>
              {block.instruction && <p className="text-sm mt-1" style={{ color: "var(--brown-mid)" }}>{block.instruction}</p>}
            </div>
            <div className="space-y-4">
              {block.items.map((item, i) => (
                <div key={item.id}>
                  <span className="text-xs font-semibold" style={{ color: "var(--brown-light)" }}>{i + 1} · {item.points} б.</span>
                  <div className="mt-1.5">
                    <ItemInput item={item} type={block.type} answer={answers[item.id] ?? ""} onAnswer={v => setAnswer(item.id, v)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <button onClick={handleSubmit} disabled={submitting}
          className="w-full py-3 rounded-2xl font-semibold text-white disabled:opacity-50"
          style={{ background: "var(--gradient-primary)" }}>
          {submitting ? "Отправляю..." : "Сдать работу"}
        </button>
      </div>
    </div>
  );
}

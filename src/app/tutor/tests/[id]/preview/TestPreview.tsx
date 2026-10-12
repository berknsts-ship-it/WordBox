"use client";

import { useState } from "react";
import {
  MCQQuestion, TFQuestion, FillInQuestion, MatchQuestion, GapFillQuestion, WritingQuestion,
  type Question,
} from "@/app/student/tests/[id]/TestTaker";

export type PreviewQuestion = Question & { correct_answer: Record<string, unknown> | null };
export type PreviewTask = { id: string; order_index: number; title: string | null; instruction: string | null; questionsSorted: PreviewQuestion[] };
export type PreviewSection = { id: string; type: string; media_type: string | null; media_url: string | null; tasksSorted: PreviewTask[] };

type AnswerMap = Record<string, Record<string, unknown>>;
type Result = { correct: boolean | null; earned: number; correctText: string };

const SECTION_LABEL: Record<string, string> = {
  listening: "Аудирование", reading: "Чтение", vocabulary: "Лексика и грамматика", writing: "Письмо",
};

function letterToChoiceText(q: PreviewQuestion, letter: string): string {
  const choices = (q.options?.choices as string[]) ?? [];
  const idx = ["A", "B", "C", "D"].indexOf(letter);
  return choices[idx] ?? letter;
}

// Mirrors submitTest's grading switch in src/app/actions/tests.ts exactly —
// kept local (not imported) since that one runs server-side against real
// submissions; this is a pure, no-persistence client-side echo of the same
// rules purely so a preview run grades itself the same way a real one would.
function scoreQuestion(q: PreviewQuestion, answer: Record<string, unknown> | undefined): Result {
  const ca = q.correct_answer;
  if (!ca) return { correct: null, earned: 0, correctText: "" };

  if (q.type === "mcq" || q.type === "true_false") {
    const correctLetter = String(ca.answer ?? "");
    const correct = String(answer?.answer ?? "").toLowerCase() === correctLetter.toLowerCase();
    const correctText = q.type === "mcq" ? letterToChoiceText(q, correctLetter) : (correctLetter === "true" ? "True" : "False");
    return { correct, earned: correct ? q.points : 0, correctText };
  }
  if (q.type === "fill_in") {
    const correctVal = String(ca.answer ?? "");
    const correct = String(answer?.answer ?? "").trim().toLowerCase() === correctVal.trim().toLowerCase();
    return { correct, earned: correct ? q.points : 0, correctText: correctVal };
  }
  if (q.type === "match") {
    const left = (q.options?.left as string[]) ?? [];
    const right = (q.options?.right as string[]) ?? [];
    const correctArr = (ca.matches as number[]) ?? [];
    const studentArr = (answer?.matches as number[]) ?? [];
    const ok = correctArr.filter((v, i) => v === studentArr[i]).length;
    const earned = correctArr.length > 0 ? Math.round((ok / correctArr.length) * q.points) : 0;
    const correctText = left.map((l, i) => `${l} → ${right[correctArr[i]] ?? "?"}`).join("; ");
    return { correct: ok === correctArr.length, earned, correctText };
  }
  if (q.type === "gap_fill") {
    const correctArr = (ca.gaps as string[]) ?? [];
    const studentArr = (answer?.gaps as string[]) ?? [];
    const ok = correctArr.filter((v, i) => v.trim().toLowerCase() === (studentArr[i] ?? "").trim().toLowerCase()).length;
    const earned = correctArr.length > 0 ? Math.round((ok / correctArr.length) * q.points) : 0;
    return { correct: ok === correctArr.length, earned, correctText: correctArr.join(", ") };
  }
  // writing — not auto-checkable, matches submitTest treating it the same way
  return { correct: null, earned: 0, correctText: "проверяется вручную" };
}

export default function TestPreview({ title, sections }: { title: string; sections: PreviewSection[] }) {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [results, setResults] = useState<Record<string, Result> | null>(null);

  const allQuestions = sections.flatMap(s => s.tasksSorted.flatMap(t => t.questionsSorted));
  const totalPoints = allQuestions.reduce((a, q) => a + q.points, 0);
  const earnedPoints = results ? Object.values(results).reduce((a, r) => a + r.earned, 0) : 0;
  const answeredCount = allQuestions.filter(q => answers[q.id] && Object.keys(answers[q.id]).length > 0).length;

  const setAnswer = (id: string, a: Record<string, unknown>) => {
    setAnswers(prev => ({ ...prev, [id]: a }));
    if (results) setResults(null); // editing after a check starts a fresh attempt
  };

  const handleCheck = () => {
    const next: Record<string, Result> = {};
    for (const q of allQuestions) next[q.id] = scoreQuestion(q, answers[q.id]);
    setResults(next);
  };

  const handleReset = () => { setAnswers({}); setResults(null); };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 z-10 -mx-4 px-4 py-3 mb-5 flex items-center justify-between flex-wrap gap-2"
        style={{ background: "var(--theme-bg, #f8f4ee)" }}>
        <div className="min-w-0">
          <h1 className="font-bold text-base truncate" style={{ color: "var(--brown-dark)" }}>{title}</h1>
          <p className="text-xs" style={{ color: "var(--brown-light)" }}>Предпросмотр репетитора</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {results ? (
            <>
              <span className="text-sm font-semibold" style={{ color: "var(--brown-dark)" }}>
                {earnedPoints} / {totalPoints} б.
              </span>
              <button onClick={handleReset}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: "white", border: "1.5px solid var(--brown-pale)", color: "var(--brown-dark)" }}>
                Пройти заново
              </button>
            </>
          ) : (
            <>
              <span className="text-xs font-mono" style={{ color: "var(--brown-mid)" }}>{answeredCount}/{allQuestions.length}</span>
              <button onClick={handleCheck}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: "var(--gradient-primary)" }}>
                Проверить
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {sections.map((section, si) => (
          <div key={section.id} className="space-y-4">
            {sections.length > 1 && (
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--brown-light)" }}>
                Раздел {si + 1} · {SECTION_LABEL[section.type] ?? section.type}
              </p>
            )}
            {section.media_url && (
              <a href={section.media_url} target="_blank" rel="noopener noreferrer"
                className="inline-block text-sm underline" style={{ color: "#2060d0" }}>
                Открыть материал раздела →
              </a>
            )}

            {section.tasksSorted.map((task) => (
              <div key={task.id} className="rounded-2xl border p-5 space-y-4"
                style={{ background: "white", borderColor: "var(--brown-pale)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                {(task.title || task.instruction) && (
                  <div>
                    {task.title && (
                      <p className="font-bold text-sm" style={{ color: "var(--brown-dark)" }}>
                        {task.title}
                      </p>
                    )}
                    {task.instruction && (
                      <p className="text-sm mt-1 whitespace-pre-wrap" style={{ color: "var(--brown-mid)" }}>{task.instruction}</p>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  {task.questionsSorted.map((q, qi) => {
                    const r = results?.[q.id];
                    return (
                      <div key={q.id} className="rounded-xl p-3"
                        style={r ? { background: r.correct === true ? "#f2faf2" : r.correct === false ? "#fff3f0" : "#fdf8f0" } : undefined}>
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-semibold" style={{ color: "var(--brown-light)" }}>
                              {qi + 1} · {q.points} б.
                            </span>
                            {Boolean(q.options?.image_url) && (
                              <img src={q.options!.image_url as string} alt=""
                                className="mt-2 rounded-xl border block"
                                style={{ borderColor: "var(--brown-pale)", maxWidth: 220, maxHeight: 160, objectFit: "cover" }} />
                            )}
                            {q.prompt && q.type !== "mcq" && q.type !== "fill_in" && q.type !== "writing" && (
                              <p className="mt-1 font-medium whitespace-pre-wrap" style={{ color: "var(--brown-dark)" }}>{q.prompt}</p>
                            )}
                          </div>
                          {r && r.correct !== null && (
                            <span className="text-xs font-bold shrink-0" style={{ color: r.correct ? "#2a7a3a" : "#c0392b" }}>
                              {r.correct ? "✓" : "✗"}
                            </span>
                          )}
                        </div>

                        {q.type === "mcq" && <MCQQuestion q={q} answer={answers[q.id]} onAnswer={a => setAnswer(q.id, a)} />}
                        {q.type === "true_false" && <TFQuestion q={q} answer={answers[q.id]} onAnswer={a => setAnswer(q.id, a)} />}
                        {q.type === "fill_in" && <FillInQuestion q={q} answer={answers[q.id]} onAnswer={a => setAnswer(q.id, a)} />}
                        {q.type === "match" && <MatchQuestion q={q} answer={answers[q.id]} onAnswer={a => setAnswer(q.id, a)} />}
                        {q.type === "gap_fill" && <GapFillQuestion q={q} answer={answers[q.id]} onAnswer={a => setAnswer(q.id, a)} />}
                        {q.type === "writing" && <WritingQuestion q={q} answer={answers[q.id]} onAnswer={a => setAnswer(q.id, a)} />}

                        {r && r.correct === false && r.correctText && (
                          <p className="text-xs mt-1.5" style={{ color: "#2a7a3a" }}>Правильно: {r.correctText}</p>
                        )}
                        {r && r.correct === null && (
                          <p className="text-xs mt-1.5" style={{ color: "var(--brown-light)" }}>{r.correctText}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}

        {!results && (
          <button onClick={handleCheck}
            className="w-full py-3 rounded-2xl font-semibold text-white"
            style={{ background: "var(--gradient-primary)" }}>
            Проверить
          </button>
        )}
      </div>
    </div>
  );
}

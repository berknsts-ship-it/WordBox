"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, XCircle } from "lucide-react";
import { saveHomeworkAttempt, submitHomeworkAttempt, type HomeworkBlockType, type AutoQuestionType } from "@/app/actions/homework-blocks";
import { ItemInput, type GrammarItem } from "@/components/shared/GrammarItemInput";

export type RunItem = { id: string; image_url: string | null; question: string | null; autoType: AutoQuestionType | null; options: string[] | null };
export type RunBlock = { id: string; type: HomeworkBlockType; instruction: string | null; words: string[] | null; items: RunItem[] };
export type ItemResult = { correct: boolean | null; correctAnswer?: string | null; comment?: string | null };
type AnswerMap = Record<string, string>;

const card = { background: "white", borderColor: "var(--brown-pale)" };

function ManualBadge() {
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#fff3cc", color: "#8a6200" }}>проверит репетитор</span>;
}
function AutoBadge() {
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#d8f5e0", color: "#1a7a3a" }}>автопроверка</span>;
}

function BlockView({ block, answers, setAnswer }: { block: RunBlock; answers: AnswerMap; setAnswer: (id: string, v: string) => void }) {
  if (block.type === "instruction") {
    return (
      <div className="rounded-2xl border p-4" style={{ background: "#f5ece3", borderColor: "var(--brown-pale)" }}>
        <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--brown-dark)" }}>{block.instruction}</p>
      </div>
    );
  }

  if (block.type === "word_bank") {
    return (
      <div className="rounded-2xl border p-4" style={{ ...card }}>
        <div className="flex flex-wrap gap-1.5">
          {(block.words ?? []).map((w, i) => (
            <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: "#f5ece3", color: "var(--brown-dark)" }}>{w}</span>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "image_answer") {
    return (
      <div className="rounded-2xl border p-4 space-y-3" style={{ ...card }}>
        {block.instruction && <p className="text-sm font-medium" style={{ color: "var(--brown-dark)" }}>{block.instruction}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {block.items.map((item, i) => (
            <div key={item.id} className="rounded-xl border p-3 space-y-2" style={{ borderColor: "var(--brown-pale)", background: "#fefcf8" }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color: "var(--brown-mid)" }}>{i + 1}.</span>
                <ManualBadge />
              </div>
              {item.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image_url} alt="" className="w-full rounded-lg border" style={{ borderColor: "var(--brown-pale)" }} />
              )}
              {item.question && <p className="text-xs" style={{ color: "var(--brown-light)" }}>{item.question}</p>}
              <textarea value={answers[item.id] ?? ""} onChange={e => setAnswer(item.id, e.target.value)}
                rows={2} placeholder="Твой ответ…"
                className="w-full px-3 py-2 rounded-lg border outline-none text-sm resize-none"
                style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "auto_question") {
    return (
      <div className="rounded-2xl border p-4 space-y-3" style={{ ...card }}>
        <div className="flex items-center gap-2">
          {block.instruction && <p className="text-sm font-medium flex-1" style={{ color: "var(--brown-dark)" }}>{block.instruction}</p>}
          <AutoBadge />
        </div>
        <div className="space-y-3">
          {block.items.map((item, i) => (
            <div key={item.id} className="space-y-1.5">
              <p className="text-sm" style={{ color: "var(--brown-dark)" }}>
                <span className="font-bold mr-1" style={{ color: "var(--brown-mid)" }}>{i + 1}.</span>
                {item.question}
              </p>
              <ItemInput
                item={{ id: item.id, points: 1, options: item.options } as GrammarItem}
                type={item.autoType!}
                answer={answers[item.id] ?? ""}
                onAnswer={v => setAnswer(item.id, v)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // free_question
  return (
    <div className="rounded-2xl border p-4 space-y-3" style={{ ...card }}>
      {block.items.map((item, i) => (
        <div key={item.id} className="space-y-1.5">
          <div className="flex items-center gap-2">
            <p className="text-sm flex-1" style={{ color: "var(--brown-dark)" }}>
              <span className="font-bold mr-1" style={{ color: "var(--brown-mid)" }}>{i + 1}.</span>
              {item.question}
            </p>
            <ManualBadge />
          </div>
          <textarea value={answers[item.id] ?? ""} onChange={e => setAnswer(item.id, e.target.value)}
            rows={3} placeholder="Твой ответ…"
            className="w-full px-3 py-2 rounded-lg border outline-none text-sm resize-none"
            style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)" }} />
        </div>
      ))}
    </div>
  );
}

function ResultMark({ correct }: { correct: boolean | null }) {
  if (correct === null) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: "#fff3cc", color: "#8a6200" }}>не проверено</span>;
  return correct
    ? <CheckCircle2 size={18} className="shrink-0" style={{ color: "#2a7a3a" }} />
    : <XCircle size={18} className="shrink-0" style={{ color: "#c0392b" }} />;
}

function ResultBlockView({ block, answers, results }: { block: RunBlock; answers: AnswerMap; results: Record<string, ItemResult> }) {
  if (block.type === "instruction") {
    return (
      <div className="rounded-2xl border p-4" style={{ background: "#f5ece3", borderColor: "var(--brown-pale)" }}>
        <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--brown-dark)" }}>{block.instruction}</p>
      </div>
    );
  }
  if (block.type === "word_bank") {
    return (
      <div className="rounded-2xl border p-4" style={{ ...card }}>
        <div className="flex flex-wrap gap-1.5">
          {(block.words ?? []).map((w, i) => (
            <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: "#f5ece3", color: "var(--brown-dark)" }}>{w}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-4 space-y-3" style={{ ...card }}>
      {block.instruction && <p className="text-sm font-medium" style={{ color: "var(--brown-dark)" }}>{block.instruction}</p>}
      {block.items.map((item, i) => {
        const r = results[item.id];
        return (
          <div key={item.id} className="rounded-xl border p-3 space-y-1.5" style={{ borderColor: "var(--brown-pale)", background: "#fefcf8" }}>
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                {item.question && (
                  <p className="text-xs mb-1" style={{ color: "var(--brown-light)" }}>
                    {block.type !== "image_answer" && <span className="font-bold mr-1" style={{ color: "var(--brown-mid)" }}>{i + 1}.</span>}
                    {item.question}
                  </p>
                )}
                {item.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image_url} alt="" className="w-full max-w-[200px] rounded-lg border mb-1.5" style={{ borderColor: "var(--brown-pale)" }} />
                )}
                <p className="text-sm px-3 py-2 rounded-lg" style={{ background: "white", border: "1px solid var(--brown-pale)", color: "var(--brown-dark)" }}>
                  {answers[item.id] || <span style={{ color: "var(--brown-light)" }}>— пусто —</span>}
                </p>
              </div>
              <ResultMark correct={r?.correct ?? null} />
            </div>
            {r?.correctAnswer && r.correct === false && (
              <p className="text-xs" style={{ color: "#2a7a3a" }}>Правильно: {r.correctAnswer}</p>
            )}
            {r?.comment && (
              <p className="text-xs italic" style={{ color: "var(--brown-mid)" }}>💬 {r.comment}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function HomeworkBlocksRunner({
  homeworkId, studentId, code, title, description, blocks, initialAnswers, initialStatus, results, score,
}: {
  homeworkId: string;
  studentId: string;
  code: string;
  title: string;
  description: string | null;
  blocks: RunBlock[];
  initialAnswers: AnswerMap;
  initialStatus: string;
  results?: Record<string, ItemResult> | null;
  score?: { earned: number; total: number } | null;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerMap>(initialAnswers);
  const [submitted, setSubmitted] = useState(initialStatus !== "pending");
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const skipFirstSave = useRef(true);
  useEffect(() => {
    if (submitted) return;
    if (skipFirstSave.current) { skipFirstSave.current = false; return; }
    setSaveStatus("saving");
    const t = setTimeout(async () => {
      const res = await saveHomeworkAttempt(homeworkId, studentId, answers);
      setSaveStatus(res?.error ? "idle" : "saved");
    }, 2500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers]);

  const setAnswer = (itemId: string, value: string) => setAnswers(prev => ({ ...prev, [itemId]: value }));

  async function handleSubmit() {
    if (submitting || submitted) return;
    setSubmitting(true);
    setSubmitError(null);
    const res = await submitHomeworkAttempt(homeworkId, studentId, answers);
    setSubmitting(false);
    if (res.error) { setSubmitError("Не получилось отправить, попробуй ещё раз"); return; }
    setSubmitted(true);
    router.refresh();
  }

  const gradableItems = blocks.filter(b => b.type !== "instruction" && b.type !== "word_bank").flatMap(b => b.items);
  const answeredCount = gradableItems.filter(it => (answers[it.id] ?? "").trim()).length;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link href={`/student/${code}?tab=homework`} className="flex items-center gap-1 text-sm hover:opacity-70 transition-all" style={{ color: "var(--brown-mid)" }}>
        <ChevronLeft size={16} /> Все задания
      </Link>

      <div className="rounded-2xl border p-5" style={{ ...card }}>
        <h2 className="text-xl font-bold" style={{ color: "var(--brown-dark)" }}>{title}</h2>
        {description && <p className="text-sm mt-1" style={{ color: "var(--brown-light)" }}>{description}</p>}
      </div>

      {initialStatus === "checked" && results ? (
        <>
          <div className="rounded-2xl border p-5 text-center" style={{ ...card }}>
            <p className="text-3xl mb-2">{score && score.total > 0 && score.earned >= score.total * 0.7 ? "🎉" : "📝"}</p>
            <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>Проверено репетитором</p>
            {score && <p className="text-sm mt-1" style={{ color: "var(--brown-mid)" }}>{score.earned} / {score.total} баллов</p>}
          </div>
          {blocks.map(block => <ResultBlockView key={block.id} block={block} answers={answers} results={results} />)}
        </>
      ) : submitted ? (
        <div className="rounded-2xl border p-8 text-center" style={{ ...card }}>
          <p className="text-4xl mb-3">📨</p>
          <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>Сдано, ждём проверки репетитора</p>
          <p className="text-sm mt-1" style={{ color: "var(--brown-light)" }}>Результат появится здесь, как только репетитор проверит</p>
        </div>
      ) : (
        <>
          {blocks.map(block => <BlockView key={block.id} block={block} answers={answers} setAnswer={setAnswer} />)}

          <div className="space-y-2">
            {submitError && <p className="text-sm text-red-600 text-center">{submitError}</p>}
            <div className="flex items-center justify-between gap-3 rounded-2xl border p-4 sticky bottom-2" style={{ ...card, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
              <p className="text-xs" style={{ color: "var(--brown-light)" }}>
                {saveStatus === "saving" ? "Сохраняем…" : saveStatus === "saved" ? "Черновик сохранён ✓" : `Отвечено: ${answeredCount}/${gradableItems.length}`}
              </p>
              <button type="button" onClick={handleSubmit} disabled={submitting}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90 transition-all"
                style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-button)" }}>
                {submitting ? "Отправляем…" : "Сдать работу репетитору"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

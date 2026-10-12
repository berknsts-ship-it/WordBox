"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { gradeWritingBatch } from "@/app/actions/tests";

export type WritingItem = {
  questionId: string;
  taskTitle: string | null;
  prompt: string;
  maxPoints: number;
  expectedAnswer: string | null;
  studentText: string;
  initialScore: number;
  initialComment: string;
};

export default function GradeForm({
  testId, items, autoScore, score5, score4, score3,
}: {
  testId: string;
  items: WritingItem[];
  autoScore: number;
  score5: number | null;
  score4: number | null;
  score3: number | null;
}) {
  const router = useRouter();
  const [scores, setScores] = useState<Record<string, string>>(
    Object.fromEntries(items.map(i => [i.questionId, String(i.initialScore)]))
  );
  const [comments, setComments] = useState<Record<string, string>>(
    Object.fromEntries(items.map(i => [i.questionId, i.initialComment]))
  );
  const [saving, setSaving] = useState(false);

  const clamped = (i: WritingItem) => Math.min(i.maxPoints, Math.max(0, parseInt(scores[i.questionId]) || 0));
  const manualTotal = items.reduce((s, i) => s + clamped(i), 0);
  const total = autoScore + manualTotal;

  let previewGrade = 2;
  if (score5 !== null && total >= score5) previewGrade = 5;
  else if (score4 !== null && total >= score4) previewGrade = 4;
  else if (score3 !== null && total >= score3) previewGrade = 3;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await gradeWritingBatch(testId, items.map(i => ({
      questionId: i.questionId, score: clamped(i), comment: comments[i.questionId] ?? "",
    })));
    setSaving(false);
    router.push(`/tutor/tests/${testId}`);
  }

  const inp = { borderColor: "var(--brown-pale)", background: "white", color: "var(--brown-dark)" };
  const card = { background: "white", borderColor: "var(--brown-pale)", boxShadow: "var(--shadow-card)" };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {items.map((item, idx) => (
        <div key={item.questionId} className="rounded-2xl border p-4 space-y-3" style={card}>
          <div className="flex items-start justify-between gap-2">
            <div>
              {item.taskTitle && (
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--brown-light)" }}>
                  {item.taskTitle}
                </p>
              )}
              <p className="text-sm font-medium whitespace-pre-wrap" style={{ color: "var(--brown-dark)" }}>
                {idx + 1}. {item.prompt}
              </p>
            </div>
            <span className="text-xs shrink-0" style={{ color: "var(--brown-light)" }}>макс. {item.maxPoints} б.</span>
          </div>

          <div className="rounded-xl p-3" style={{ background: "#f8f4ee" }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--brown-light)" }}>Ответ ученика</p>
            {item.studentText ? (
              <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--brown-dark)" }}>{item.studentText}</p>
            ) : (
              <p className="text-sm" style={{ color: "var(--brown-light)" }}>Ответ не заполнен</p>
            )}
          </div>

          {item.expectedAnswer && (
            <p className="text-xs" style={{ color: "var(--brown-light)" }}>
              Ожидаемый ответ (для ориентира): <span style={{ color: "var(--brown-mid)" }}>{item.expectedAnswer}</span>
            </p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-sm" style={{ color: "var(--brown-dark)" }}>Баллы:</label>
            <input
              type="number" min={0} max={item.maxPoints}
              value={scores[item.questionId]}
              onChange={e => setScores(s => ({ ...s, [item.questionId]: e.target.value }))}
              className="w-20 px-3 py-1.5 rounded-xl border text-sm outline-none"
              style={inp}
            />
            <span className="text-xs" style={{ color: "var(--brown-light)" }}>/ {item.maxPoints}</span>
            <input
              type="text" placeholder="Комментарий (необязательно)"
              value={comments[item.questionId] ?? ""}
              onChange={e => setComments(c => ({ ...c, [item.questionId]: e.target.value }))}
              className="flex-1 min-w-[160px] px-3 py-1.5 rounded-xl border text-sm outline-none"
              style={inp}
            />
          </div>
        </div>
      ))}

      <div className="rounded-2xl border p-4 flex items-center justify-between flex-wrap gap-3" style={card}>
        <div className="text-sm" style={{ color: "var(--brown-mid)" }}>
          Авто: {autoScore} б. + Письмо: {manualTotal} б. = <b style={{ color: "var(--brown-dark)" }}>{total} б.</b>
          {" "}· Оценка: <b style={{ color: "var(--brown-dark)" }}>{previewGrade}</b>
        </div>
        <button type="submit" disabled={saving}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: "var(--gradient-primary)", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Сохраняю…" : "Сохранить оценку"}
        </button>
      </div>
    </form>
  );
}

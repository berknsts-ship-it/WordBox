"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { gradeWriting } from "@/app/actions/tests";

export default function GradeForm({
  testId, questionId, prompt, maxPoints, autoScore,
  studentText, initialScore, initialComment,
  score5, score4, score3,
}: {
  testId: string;
  questionId: string;
  prompt: string;
  maxPoints: number;
  autoScore: number;
  studentText: string;
  initialScore: number;
  initialComment: string;
  score5: number | null;
  score4: number | null;
  score3: number | null;
}) {
  const router = useRouter();
  const [score, setScore] = useState(String(initialScore));
  const [comment, setComment] = useState(initialComment);
  const [saving, setSaving] = useState(false);

  const scoreNum = Math.min(maxPoints, Math.max(0, parseInt(score) || 0));
  const total = autoScore + scoreNum;

  let previewGrade = 2;
  if (score5 !== null && total >= score5) previewGrade = 5;
  else if (score4 !== null && total >= score4) previewGrade = 4;
  else if (score3 !== null && total >= score3) previewGrade = 3;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await gradeWriting(testId, questionId, scoreNum, comment);
    setSaving(false);
    router.push(`/tutor/tests/${testId}`);
  }

  const inp = { borderColor: "var(--brown-pale)", background: "white", color: "var(--brown-dark)" };
  const card = { background: "white", borderColor: "var(--brown-pale)", boxShadow: "var(--shadow-card)" };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Task */}
      {prompt && (
        <div className="rounded-2xl border p-4" style={card}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2"
            style={{ color: "var(--brown-light)" }}>Задание</p>
          <p className="text-sm" style={{ color: "var(--brown-dark)" }}>{prompt}</p>
          <p className="text-xs mt-1" style={{ color: "var(--brown-light)" }}>
            Максимум: {maxPoints} б.
          </p>
        </div>
      )}

      {/* Student's text */}
      <div className="rounded-2xl border p-4" style={card}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-2"
          style={{ color: "var(--brown-light)" }}>Ответ ученика</p>
        {studentText ? (
          <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--brown-dark)" }}>
            {studentText}
          </p>
        ) : (
          <p className="text-sm" style={{ color: "var(--brown-light)" }}>Ответ не заполнен</p>
        )}
      </div>

      {/* Grading */}
      <div className="rounded-2xl border p-4 space-y-4" style={card}>
        <p className="font-semibold" style={{ color: "var(--brown-dark)" }}>Оценивание</p>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm" style={{ color: "var(--brown-dark)" }}>
            Баллы за письмо:
          </label>
          <input type="number" value={score} min={0} max={maxPoints}
            onChange={e => setScore(e.target.value)}
            className="px-3 py-2 rounded-xl border outline-none text-sm text-center font-bold"
            style={{ ...inp, width: 80 }} />
          <span className="text-sm" style={{ color: "var(--brown-light)" }}>/ {maxPoints}</span>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide block mb-1"
            style={{ color: "var(--brown-light)" }}>Комментарий репетитора</label>
          <textarea value={comment} onChange={e => setComment(e.target.value)}
            rows={4} placeholder="Feedback for the student..."
            className="w-full px-3 py-2 rounded-xl border outline-none text-sm resize-none" style={inp} />
        </div>

        {/* Score preview */}
        <div className="p-3 rounded-xl text-sm flex flex-wrap gap-4" style={{ background: "#f8f4ee" }}>
          <span style={{ color: "var(--brown-mid)" }}>Авто: {autoScore} б.</span>
          <span style={{ color: "var(--brown-mid)" }}>Письмо: {scoreNum} б.</span>
          <span className="font-semibold" style={{ color: "var(--brown-dark)" }}>
            Итого: {total} б.
          </span>
          {(score5 || score4 || score3) && (
            <span className="font-bold px-2 py-0.5 rounded-lg"
              style={{
                background: previewGrade >= 4 ? "#d8f5e0" : previewGrade === 3 ? "#fff3cc" : "#ffe0e0",
                color: previewGrade >= 4 ? "#1a7a3a" : previewGrade === 3 ? "#c07800" : "#cc3030",
              }}>
              → оценка {previewGrade}
            </span>
          )}
        </div>
      </div>

      <button type="submit" disabled={saving}
        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
        style={{ background: "var(--gradient-primary)" }}>
        {saving ? "Сохраняю..." : "Сохранить оценку"}
      </button>
    </form>
  );
}

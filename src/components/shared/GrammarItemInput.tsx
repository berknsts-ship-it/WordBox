"use client";

import type { ExerciseType } from "@/app/actions/grammar";

export type GrammarItem = { id: string; points: number; options: string[] | null };

export const TYPE_LABELS: Record<ExerciseType, string> = {
  bracket: "Раскрыть скобки",
  mcq: "Выбор варианта",
  true_false: "Верно / неверно",
  fix_error: "Исправить ошибку",
  gap_fill: "Пропуск",
  word_order: "Порядок слов",
};

export function WordOrderPicker({ words, answer, onAnswer, disabled }: { words: string[]; answer: string; onAnswer: (a: string) => void; disabled?: boolean }) {
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

export function ItemInput({ item, type, answer, onAnswer }: { item: GrammarItem; type: ExerciseType; answer: string; onAnswer: (a: string) => void }) {
  const inputStyle = { borderColor: "var(--brown-pale)", color: "var(--brown-dark)" };

  if (type === "mcq") {
    const opts = item.options ?? [];
    return (
      <div className="space-y-2">
        {opts.map((opt, i) => {
          const letter = ["A", "B", "C", "D"][i];
          const selected = answer === letter;
          return (
            // Clicking an already-selected option clears it — an accidental
            // click (e.g. while dragging the exercise box around) needs a
            // way back to "no answer", not just a choice between options.
            <button key={letter} type="button" onClick={() => onAnswer(selected ? "" : letter)}
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
          // Same toggle-to-clear behavior as mcq above.
          <button key={v} type="button" onClick={() => onAnswer(answer === v ? "" : v)}
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

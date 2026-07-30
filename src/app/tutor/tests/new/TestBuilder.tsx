"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical, ArrowUp, ArrowDown, CheckCircle2 } from "lucide-react";
import { createTest, updateTest } from "@/app/actions/tests";

// ── Types ─────────────────────────────────────────────────────────────────────

export type QType = "mcq" | "true_false" | "fill_in" | "match" | "gap_fill";
export type MediaType = "audio" | "youtube" | "external";
export type SectionType = "listening" | "reading" | "vocabulary" | "writing";

export type Question = {
  _id: string;
  type: QType;
  prompt: string;
  points: number;
  // MCQ
  choices: [string, string, string, string];
  mcqCorrect: "A" | "B" | "C" | "D";
  // T/F
  tfCorrect: "true" | "false";
  // Fill-in
  fillCorrect: string;
  // Match
  matchLeft: string[];
  matchRight: string[];
  matchCorrect: number[];
  // Gap-fill
  gapTemplate: string;
  gapCorrect: string[];
};

export type Task = {
  _id: string;
  title: string;
  instruction: string;
  questions: Question[];
};

export type Section = {
  type: SectionType;
  enabled: boolean;
  tasks: Task[];
  // Listening
  mediaType: MediaType;
  mediaUrl: string;
  mediaFile: File | null;
  maxPlays: number;
  hideSubtitles: boolean;
  // Writing
  writingPrompt: string;
  writingPoints: number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2);

const SECTION_LABELS: Record<SectionType, string> = {
  listening: "Аудирование",
  reading: "Чтение",
  vocabulary: "Лексика и грамматика",
  writing: "Письмо",
};

const Q_LABELS: Record<QType, string> = {
  mcq: "A/B/C/D",
  true_false: "True / False",
  fill_in: "Вписать ответ",
  match: "Соединить пары",
  gap_fill: "Вписать в пропуск",
};

function emptyQuestion(): Question {
  return {
    _id: uid(),
    type: "mcq",
    prompt: "",
    points: 1,
    choices: ["", "", "", ""],
    mcqCorrect: "A",
    tfCorrect: "true",
    fillCorrect: "",
    matchLeft: ["", ""],
    matchRight: ["", ""],
    matchCorrect: [0, 1],
    gapTemplate: "",
    gapCorrect: [],
  };
}

function emptyTask(): Task {
  return { _id: uid(), title: "", instruction: "", questions: [] };
}

function defaultSection(type: SectionType): Section {
  return {
    type,
    enabled: false,
    tasks: [],
    mediaType: "audio",
    mediaUrl: "",
    mediaFile: null,
    maxPlays: 2,
    hideSubtitles: false,
    writingPrompt: "",
    writingPoints: 10,
  };
}

function countGaps(template: string): number {
  return (template.match(/___/g) ?? []).length;
}

// Every question type's correct-answer control lives inside this box —
// same green frame and header everywhere, so it's always obvious which
// part of the form is "what gets checked" vs. just the question text.
function AnswerKeyBox({ hint, children }: { hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg p-3 border-2" style={{ background: "#f0fdf4", borderColor: "#86efac" }}>
      <p className="text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ color: "#15803d" }}>
        <CheckCircle2 size={13} /> Правильный ответ — по нему проверяется работа
      </p>
      {hint && <p className="text-xs mb-2" style={{ color: "#15803d", opacity: 0.85 }}>{hint}</p>}
      {children}
    </div>
  );
}

// ── Question editor ───────────────────────────────────────────────────────────

function QuestionEditor({
  q,
  index,
  onUpdate,
  onDelete,
  taskOptions,
  onMoveToTask,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  q: Question;
  index: number;
  onUpdate: (updated: Question) => void;
  onDelete: () => void;
  taskOptions?: { index: number; label: string }[];
  onMoveToTask?: (toTaskIndex: number) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const [open, setOpen] = useState(true);
  const set = (patch: Partial<Question>) => onUpdate({ ...q, ...patch });

  const inp = { borderColor: "var(--brown-pale)", background: "white", color: "var(--brown-dark)" };
  const lbl = { color: "var(--brown-light)", fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.05em" };

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--brown-pale)" }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none"
        style={{ background: "#fdf8f0" }}
        onClick={() => setOpen(o => !o)}>
        <div className="flex flex-col shrink-0 -my-1" onClick={e => e.stopPropagation()}>
          <button type="button" onClick={onMoveUp} disabled={!canMoveUp}
            className="disabled:opacity-25 hover:opacity-70" style={{ color: "var(--brown-mid)" }} title="Вопрос выше">
            <ArrowUp size={12} />
          </button>
          <button type="button" onClick={onMoveDown} disabled={!canMoveDown}
            className="disabled:opacity-25 hover:opacity-70" style={{ color: "var(--brown-mid)" }} title="Вопрос ниже">
            <ArrowDown size={12} />
          </button>
        </div>
        <span className="text-sm font-medium flex-1" style={{ color: "var(--brown-dark)" }}>
          {index + 1}. {Q_LABELS[q.type]} — {q.points} б.
          {q.prompt && <span style={{ color: "var(--brown-light)" }}> · {q.prompt.slice(0, 40)}{q.prompt.length > 40 ? "…" : ""}</span>}
        </span>
        {taskOptions && taskOptions.length > 0 && onMoveToTask && (
          <select
            value=""
            onChange={e => { if (e.target.value !== "") onMoveToTask(parseInt(e.target.value)); }}
            onClick={e => e.stopPropagation()}
            className="text-xs px-1.5 py-1 rounded-lg border outline-none"
            style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)", background: "white" }}
            title="Переместить в другое задание"
          >
            <option value="">→ в задание…</option>
            {taskOptions.map(t => (
              <option key={t.index} value={t.index}>{t.label}</option>
            ))}
          </select>
        )}
        <button type="button" onClick={e => { e.stopPropagation(); onDelete(); }}
          className="p-1 rounded hover:opacity-70"
          style={{ color: "#dc2626" }}>
          <Trash2 size={13} />
        </button>
        {open ? <ChevronUp size={14} style={{ color: "var(--brown-light)" }} /> : <ChevronDown size={14} style={{ color: "var(--brown-light)" }} />}
      </div>

      {open && (
        <div className="p-3 space-y-3 border-t" style={{ borderColor: "var(--brown-pale)" }}>
          {/* Type + Points */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex-1">
              <label style={lbl}>Тип</label>
              <select value={q.type} onChange={e => set({ type: e.target.value as QType })}
                className="w-full mt-1 px-2 py-1.5 rounded-lg border outline-none text-sm" style={inp}>
                {Object.entries(Q_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div style={{ width: 80 }}>
              <label style={lbl}>Баллы</label>
              <input type="number" min={1} max={99} value={q.points}
                onChange={e => set({ points: parseInt(e.target.value) || 1 })}
                className="w-full mt-1 px-2 py-1.5 rounded-lg border outline-none text-sm text-center" style={inp} />
            </div>
          </div>

          {/* Prompt */}
          <div>
            <label style={lbl}>Вопрос / задание</label>
            <textarea value={q.prompt} onChange={e => set({ prompt: e.target.value })}
              rows={2}
              className="w-full mt-1 px-2 py-1.5 rounded-lg border outline-none text-sm resize-none"
              style={inp} placeholder="Текст вопроса..." />
          </div>

          {/* MCQ */}
          {q.type === "mcq" && (
            <AnswerKeyBox hint="Нажмите на вариант, который правильный — он подсветится зелёным.">
              <div className="space-y-1.5">
                {(["A", "B", "C", "D"] as const).map((letter, i) => {
                  const isCorrect = q.mcqCorrect === letter;
                  return (
                    <div key={letter}
                      onClick={() => set({ mcqCorrect: letter })}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg border-2 cursor-pointer transition-all"
                      style={{ borderColor: isCorrect ? "#22c55e" : "var(--brown-pale)", background: isCorrect ? "#dcfce7" : "white" }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: isCorrect ? "#22c55e" : "#e5e7eb", color: isCorrect ? "white" : "var(--brown-mid)" }}>
                        {isCorrect ? "✓" : letter}
                      </span>
                      <input value={q.choices[i]} onClick={e => e.stopPropagation()} onChange={e => {
                        const c = [...q.choices] as [string, string, string, string];
                        c[i] = e.target.value;
                        set({ choices: c });
                      }}
                        className="flex-1 bg-transparent outline-none text-sm" style={{ color: "var(--brown-dark)" }}
                        placeholder={`Вариант ${letter}`} />
                    </div>
                  );
                })}
              </div>
            </AnswerKeyBox>
          )}

          {/* True/False */}
          {q.type === "true_false" && (
            <AnswerKeyBox hint="Нажмите, что из этого верно.">
              <div className="flex gap-3">
                {(["true", "false"] as const).map(v => {
                  const isCorrect = q.tfCorrect === v;
                  return (
                    <button key={v} type="button" onClick={() => set({ tfCorrect: v })}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 text-sm font-semibold transition-all"
                      style={{ borderColor: isCorrect ? "#22c55e" : "var(--brown-pale)", background: isCorrect ? "#dcfce7" : "white", color: "var(--brown-dark)" }}>
                      {isCorrect && <CheckCircle2 size={14} style={{ color: "#22c55e" }} />}
                      {v === "true" ? "True" : "False"}
                    </button>
                  );
                })}
              </div>
            </AnswerKeyBox>
          )}

          {/* Fill-in */}
          {q.type === "fill_in" && (
            <AnswerKeyBox hint="То, что должен напечатать ученик. Регистр букв не важен.">
              <input value={q.fillCorrect} onChange={e => set({ fillCorrect: e.target.value })}
                className="w-full px-2 py-1.5 rounded-lg border-2 outline-none text-sm bg-white"
                style={{ borderColor: "#86efac", color: "var(--brown-dark)" }}
                placeholder="Например: goes" />
            </AnswerKeyBox>
          )}

          {/* Match */}
          {q.type === "match" && (
            <AnswerKeyBox hint="Ученик увидит буквы слева и перемешанные варианты справа — ему нужно подобрать пару. Каждая строка ниже уже и есть верная пара.">
              <div className="space-y-1.5">
                {q.matchLeft.map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs font-bold shrink-0 w-4" style={{ color: "#22c55e" }}>✓</span>
                    <input value={q.matchLeft[i]} onChange={e => {
                      const l = [...q.matchLeft]; l[i] = e.target.value;
                      set({ matchLeft: l });
                    }}
                      className="flex-1 px-2 py-1 rounded-lg border outline-none text-sm bg-white" style={{ borderColor: "#86efac", color: "var(--brown-dark)" }}
                      placeholder="Левый" />
                    <span style={{ color: "#22c55e" }}>=</span>
                    <input value={q.matchRight[i]} onChange={e => {
                      const r = [...q.matchRight]; r[i] = e.target.value;
                      set({ matchRight: r });
                    }}
                      className="flex-1 px-2 py-1 rounded-lg border outline-none text-sm bg-white" style={{ borderColor: "#86efac", color: "var(--brown-dark)" }}
                      placeholder="Правый" />
                    {q.matchLeft.length > 2 && (
                      <button type="button" onClick={() => {
                        set({
                          matchLeft: q.matchLeft.filter((_, j) => j !== i),
                          matchRight: q.matchRight.filter((_, j) => j !== i),
                          matchCorrect: q.matchCorrect.filter((_, j) => j !== i),
                        });
                      }} style={{ color: "#dc2626" }}><Trash2 size={13} /></button>
                    )}
                  </div>
                ))}
                <button type="button"
                  onClick={() => set({
                    matchLeft: [...q.matchLeft, ""],
                    matchRight: [...q.matchRight, ""],
                    matchCorrect: [...q.matchCorrect, q.matchLeft.length],
                  })}
                  className="text-xs px-2 py-1 rounded-lg border bg-white"
                  style={{ borderColor: "#86efac", color: "#15803d" }}>
                  + Добавить пару
                </button>
              </div>
            </AnswerKeyBox>
          )}

          {/* Gap-fill */}
          {q.type === "gap_fill" && (
            <div className="space-y-2">
              <div className="rounded-lg p-2.5" style={{ background: "#fdf8f0", border: "1px dashed var(--brown-pale)" }}>
                <p className="text-xs" style={{ color: "var(--brown-mid)" }}>
                  Напечатайте текст задания и поставьте <b>три подчёркивания ___</b> на месте каждого пропуска.
                  Например: <i>&quot;She ___ every day.&quot;</i> — после этого ниже появится поле для правильного ответа на этот пропуск.
                </p>
              </div>
              <div>
                <label style={lbl}>Текст с пропусками</label>
                <textarea value={q.gapTemplate} onChange={e => {
                  const template = e.target.value;
                  const n = countGaps(template);
                  const prev = q.gapCorrect;
                  const gaps = Array.from({ length: n }, (_, i) => prev[i] ?? "");
                  set({ gapTemplate: template, gapCorrect: gaps });
                }}
                  rows={3}
                  className="w-full mt-1 px-2 py-1.5 rounded-lg border outline-none text-sm resize-none"
                  style={inp} placeholder="The cat ___ on the ___." />
              </div>

              {countGaps(q.gapTemplate) > 0 && (
                <AnswerKeyBox hint={`Обнаружено пропусков: ${countGaps(q.gapTemplate)}. Впишите верный ответ для каждого по порядку.`}>
                  <div className="flex flex-wrap gap-2">
                    {q.gapCorrect.map((g, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="text-xs font-bold" style={{ color: "#15803d" }}>{i + 1}.</span>
                        <input value={g}
                          onChange={e => {
                            const gaps = [...q.gapCorrect]; gaps[i] = e.target.value;
                            set({ gapCorrect: gaps });
                          }}
                          className="px-2 py-1 rounded-lg border outline-none text-sm bg-white"
                          style={{ borderColor: "#86efac", color: "var(--brown-dark)", width: 110 }}
                          placeholder={`Пропуск ${i + 1}`} />
                      </div>
                    ))}
                  </div>
                </AnswerKeyBox>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Task editor ───────────────────────────────────────────────────────────────

function TaskEditor({
  task,
  index,
  onUpdate,
  onDelete,
  taskOptions,
  onMoveQuestion,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  task: Task;
  index: number;
  onUpdate: (updated: Task) => void;
  onDelete: () => void;
  taskOptions: { index: number; label: string }[];
  onMoveQuestion: (qIdx: number, toTaskIndex: number) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const inp = { borderColor: "var(--brown-pale)", background: "white", color: "var(--brown-dark)" };
  const lbl = { color: "var(--brown-light)", fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.05em" };

  const addQuestion = () => onUpdate({ ...task, questions: [...task.questions, emptyQuestion()] });
  const updateQuestion = (qIdx: number, q: Question) =>
    onUpdate({ ...task, questions: task.questions.map((qq, j) => j === qIdx ? q : qq) });
  const deleteQuestion = (qIdx: number) =>
    onUpdate({ ...task, questions: task.questions.filter((_, j) => j !== qIdx) });
  const moveQuestionUpdown = (qIdx: number, dir: -1 | 1) => {
    const target = qIdx + dir;
    if (target < 0 || target >= task.questions.length) return;
    const qs = [...task.questions];
    [qs[qIdx], qs[target]] = [qs[target], qs[qIdx]];
    onUpdate({ ...task, questions: qs });
  };

  const otherTaskOptions = taskOptions.filter(t => t.index !== index);

  return (
    <div className="rounded-xl border-2 p-3.5 space-y-3" style={{ borderColor: "var(--brown-pale)", background: "white" }}>
      <div className="flex items-center gap-2">
        <div className="flex flex-col shrink-0 -my-1">
          <button type="button" onClick={onMoveUp} disabled={!canMoveUp}
            className="disabled:opacity-25 hover:opacity-70" style={{ color: "var(--brown-mid)" }} title="Задание выше">
            <ArrowUp size={13} />
          </button>
          <button type="button" onClick={onMoveDown} disabled={!canMoveDown}
            className="disabled:opacity-25 hover:opacity-70" style={{ color: "var(--brown-mid)" }} title="Задание ниже">
            <ArrowDown size={13} />
          </button>
        </div>
        <span className="text-sm font-bold shrink-0" style={{ color: "var(--brown-mid)" }}>Задание {index + 1}</span>
        <div className="flex-1" />
        <button type="button" onClick={onDelete} className="p-1 rounded hover:opacity-70" style={{ color: "#dc2626" }}>
          <Trash2 size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label style={lbl}>Заголовок задания</label>
          <input value={task.title} onChange={e => onUpdate({ ...task, title: e.target.value })}
            className="w-full mt-1 px-2 py-1.5 rounded-lg border outline-none text-sm" style={inp}
            placeholder="Complete with some/any" />
        </div>
        <div>
          <label style={lbl}>Инструкция ученику</label>
          <input value={task.instruction} onChange={e => onUpdate({ ...task, instruction: e.target.value })}
            className="w-full mt-1 px-2 py-1.5 rounded-lg border outline-none text-sm" style={inp}
            placeholder="Complete the voicemail with some or any." />
        </div>
      </div>

      <div className="space-y-2 pl-3 border-l-2" style={{ borderColor: "var(--brown-pale)" }}>
        {task.questions.map((q, qIdx) => (
          <QuestionEditor
            key={q._id}
            q={q}
            index={qIdx}
            onUpdate={updated => updateQuestion(qIdx, updated)}
            onDelete={() => deleteQuestion(qIdx)}
            taskOptions={otherTaskOptions}
            onMoveToTask={toIndex => onMoveQuestion(qIdx, toIndex)}
            onMoveUp={() => moveQuestionUpdown(qIdx, -1)}
            onMoveDown={() => moveQuestionUpdown(qIdx, 1)}
            canMoveUp={qIdx > 0}
            canMoveDown={qIdx < task.questions.length - 1}
          />
        ))}
        <button type="button" onClick={addQuestion}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border w-full justify-center text-xs font-medium hover:opacity-80 transition-all"
          style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)", borderStyle: "dashed" }}>
          <Plus size={13} /> Добавить вопрос
        </button>
      </div>
    </div>
  );
}

// ── Main TestBuilder ──────────────────────────────────────────────────────────

export type TestBuilderInitial = {
  title: string;
  studentId: string;
  timeLimitMin: string;
  issuedAt: string;
  score5: string;
  score4: string;
  score3: string;
  sections: Section[];
};

export default function TestBuilder({
  students,
  existingTestId,
  initial,
}: {
  students: { id: string; name: string }[];
  existingTestId?: string;
  initial?: TestBuilderInitial;
}) {
  const router = useRouter();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [studentId, setStudentId] = useState(initial?.studentId ?? "");
  const [timeLimitMin, setTimeLimitMin] = useState(initial?.timeLimitMin ?? "");
  const [issuedAt, setIssuedAt] = useState(initial?.issuedAt ?? "");
  const [score5, setScore5] = useState(initial?.score5 ?? "");
  const [score4, setScore4] = useState(initial?.score4 ?? "");
  const [score3, setScore3] = useState(initial?.score3 ?? "");

  const SECTION_ORDER: SectionType[] = ["listening", "reading", "vocabulary", "writing"];
  const [sections, setSections] = useState<Section[]>(initial?.sections ?? SECTION_ORDER.map(defaultSection));

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const updateSection = (idx: number, patch: Partial<Section>) => {
    setSections(prev => prev.map((s, i) => i === idx ? { ...s, ...patch } : s));
  };

  const addTask = (sIdx: number) => {
    setSections(prev => prev.map((s, i) =>
      i === sIdx ? { ...s, tasks: [...s.tasks, emptyTask()] } : s
    ));
  };

  const updateTask = (sIdx: number, tIdx: number, task: Task) => {
    setSections(prev => prev.map((s, i) =>
      i === sIdx ? { ...s, tasks: s.tasks.map((tt, j) => j === tIdx ? task : tt) } : s
    ));
  };

  const deleteTask = (sIdx: number, tIdx: number) => {
    setSections(prev => prev.map((s, i) =>
      i === sIdx ? { ...s, tasks: s.tasks.filter((_, j) => j !== tIdx) } : s
    ));
  };

  const moveQuestionToTask = (sIdx: number, fromTaskIdx: number, qIdx: number, toTaskIdx: number) => {
    if (fromTaskIdx === toTaskIdx) return;
    setSections(prev => prev.map((s, i) => {
      if (i !== sIdx) return s;
      const tasks = [...s.tasks];
      const question = tasks[fromTaskIdx].questions[qIdx];
      tasks[fromTaskIdx] = { ...tasks[fromTaskIdx], questions: tasks[fromTaskIdx].questions.filter((_, j) => j !== qIdx) };
      tasks[toTaskIdx] = { ...tasks[toTaskIdx], questions: [...tasks[toTaskIdx].questions, question] };
      return { ...s, tasks };
    }));
  };

  const moveTaskUpdown = (sIdx: number, tIdx: number, dir: -1 | 1) => {
    setSections(prev => prev.map((s, i) => {
      if (i !== sIdx) return s;
      const target = tIdx + dir;
      if (target < 0 || target >= s.tasks.length) return s;
      const tasks = [...s.tasks];
      [tasks[tIdx], tasks[target]] = [tasks[target], tasks[tIdx]];
      return { ...s, tasks };
    }));
  };

  const moveSectionUpdown = (idx: number, dir: -1 | 1) => {
    setSections(prev => {
      const arr = [...prev];
      let target = idx + dir;
      while (target >= 0 && target < arr.length && !arr[target].enabled) {
        target += dir;
      }
      if (target < 0 || target >= arr.length) return prev;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  };

  async function uploadAudio(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "test-audio");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) { setError("Ошибка загрузки аудио"); return null; }
    const data = await res.json();
    return data.url as string;
  }

  async function handleSave(status: "draft" | "issued") {
    if (!title.trim()) { setError("Введите название теста"); return; }

    setSaving(true); setError(null);
    let finalSections = [...sections];

    // Upload audio if needed
    const listeningIdx = sections.findIndex(s => s.type === "listening" && s.enabled);
    if (listeningIdx >= 0) {
      const ls = sections[listeningIdx];
      if (ls.mediaType === "audio" && ls.mediaFile) {
        setUploading(true);
        const url = await uploadAudio(ls.mediaFile);
        setUploading(false);
        if (!url) { setSaving(false); return; }
        finalSections = finalSections.map((s, i) =>
          i === listeningIdx ? { ...s, mediaUrl: url } : s
        );
      }
    }

    // Build input
    const sectionInputs = finalSections
      .filter(s => s.enabled)
      .map((s, i) => {
        if (s.type === "writing") {
          return {
            type: s.type,
            order_index: i,
            tasks: [{
              order_index: 0,
              title: null,
              instruction: null,
              questions: [{
                type: "writing" as const,
                prompt: s.writingPrompt,
                options: null,
                correct_answer: null,
                points: s.writingPoints,
              }],
            }],
          };
        }

        return {
          type: s.type,
          order_index: i,
          media_type: s.type === "listening" ? s.mediaType : null,
          media_url: s.type === "listening" ? (s.mediaType !== "audio" ? s.mediaUrl : (finalSections[listeningIdx]?.mediaUrl ?? null)) : null,
          max_plays: s.type === "listening" ? s.maxPlays : 2,
          hide_subtitles: s.type === "listening" ? s.hideSubtitles : false,
          tasks: s.tasks.map((t, ti) => ({
            order_index: ti,
            title: t.title.trim() || null,
            instruction: t.instruction.trim() || null,
            questions: t.questions.map(q => ({
              type: q.type,
              prompt: q.prompt,
              points: q.points,
              options: buildOptions(q),
              correct_answer: buildCorrectAnswer(q),
            })),
          })),
        };
      });

    const testInput = {
      title: title.trim(),
      student_id: studentId || null,
      time_limit_min: timeLimitMin ? parseInt(timeLimitMin) : null,
      issued_at: issuedAt ? `${issuedAt}T00:00:00` : null,
      score_5: score5 ? parseInt(score5) : null,
      score_4: score4 ? parseInt(score4) : null,
      score_3: score3 ? parseInt(score3) : null,
      sections: sectionInputs,
    };

    const result = existingTestId
      ? await updateTest(existingTestId, testInput)
      : await createTest(testInput);

    setSaving(false);
    if (result.error) { setError(result.error); return; }

    // Issue if requested
    if (status === "issued" && result.id) {
      const { issueTest } = await import("@/app/actions/tests");
      await issueTest(result.id);
    }

    router.push(existingTestId ? `/tutor/tests/${existingTestId}` : "/tutor/tests");
  }

  const inp = { borderColor: "var(--brown-pale)", background: "white", color: "var(--brown-dark)" };
  const lbl = "text-xs font-semibold uppercase tracking-wide mb-1 block";

  return (
    <div className="space-y-6 max-w-3xl">
      {/* ── Basic settings ── */}
      <div className="rounded-2xl border p-5 space-y-4"
        style={{ background: "white", borderColor: "var(--brown-pale)", boxShadow: "var(--shadow-card)" }}>
        <h2 className="font-semibold" style={{ color: "var(--brown-dark)" }}>Настройки</h2>

        <div>
          <label className={lbl} style={{ color: "var(--brown-light)" }}>Название *</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border outline-none text-sm" style={inp}
            placeholder="Контрольная работа №1" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={lbl} style={{ color: "var(--brown-light)" }}>Ученик</label>
            <select value={studentId} onChange={e => setStudentId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border outline-none text-sm" style={inp}>
              <option value="">Не назначен</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl} style={{ color: "var(--brown-light)" }}>Ограничение времени (мин)</label>
            <input type="number" min={5} max={240} value={timeLimitMin}
              onChange={e => setTimeLimitMin(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border outline-none text-sm" style={inp}
              placeholder="Без ограничения" />
          </div>
          <div>
            <label className={lbl} style={{ color: "var(--brown-light)" }}>Дата выдачи</label>
            <input type="date" value={issuedAt} onChange={e => setIssuedAt(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border outline-none text-sm" style={inp} />
          </div>
        </div>

        {/* Grading scale */}
        <div>
          <p className={lbl} style={{ color: "var(--brown-light)" }}>Шкала оценивания (мин. баллов)</p>
          <div className="flex gap-3 flex-wrap mt-1">
            {([["5", score5, setScore5, "#1a7a3a"], ["4", score4, setScore4, "#2060d0"], ["3", score3, setScore3, "#c07800"]] as const).map(([grade, val, setter, color]) => (
              <div key={grade} className="flex items-center gap-1.5">
                <span className="text-sm font-bold px-2 py-0.5 rounded-lg"
                  style={{ background: "#f8f4ee", color }}>«{grade}»</span>
                <span className="text-xs" style={{ color: "var(--brown-light)" }}>от</span>
                <input type="number" value={val} onChange={e => (setter as (v: string) => void)(e.target.value)}
                  className="px-2 py-1 rounded-lg border outline-none text-sm text-center"
                  style={{ ...inp, width: 64 }} placeholder="—" />
                <span className="text-xs" style={{ color: "var(--brown-light)" }}>б.</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sections ── */}
      <div className="rounded-2xl border p-5"
        style={{ background: "white", borderColor: "var(--brown-pale)", boxShadow: "var(--shadow-card)" }}>
        <h2 className="font-semibold mb-4" style={{ color: "var(--brown-dark)" }}>Разделы</h2>

        {/* Toggles */}
        <div className="flex flex-wrap gap-3 mb-6">
          {sections.map((s, i) => (
            <label key={s.type} className="flex items-center gap-2 cursor-pointer text-sm font-medium select-none"
              style={{ color: s.enabled ? "var(--brown-dark)" : "var(--brown-light)" }}>
              <input type="checkbox" checked={s.enabled}
                onChange={e => updateSection(i, { enabled: e.target.checked })}
                className="w-4 h-4 accent-amber-700 rounded" />
              {SECTION_LABELS[s.type]}
            </label>
          ))}
        </div>

        {/* Section editors */}
        <div className="space-y-6">
          {(() => {
            const enabledIdxs = sections.map((_, i) => i).filter(i => sections[i].enabled);
            return sections.map((s, sIdx) => {
              if (!s.enabled) return null;
              const pos = enabledIdxs.indexOf(sIdx);
              const canMoveUp = pos > 0;
              const canMoveDown = pos < enabledIdxs.length - 1;
              return (
              <div key={s.type} className="rounded-xl border p-4 space-y-4"
                style={{ borderColor: "var(--brown-pale)", background: "#fefcf8" }}>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col shrink-0 -my-1">
                    <button type="button" onClick={() => moveSectionUpdown(sIdx, -1)} disabled={!canMoveUp}
                      className="disabled:opacity-25 hover:opacity-70" style={{ color: "var(--brown-mid)" }} title="Раздел выше">
                      <ArrowUp size={13} />
                    </button>
                    <button type="button" onClick={() => moveSectionUpdown(sIdx, 1)} disabled={!canMoveDown}
                      className="disabled:opacity-25 hover:opacity-70" style={{ color: "var(--brown-mid)" }} title="Раздел ниже">
                      <ArrowDown size={13} />
                    </button>
                  </div>
                  <h3 className="font-semibold text-sm" style={{ color: "var(--brown-dark)" }}>
                    {SECTION_LABELS[s.type]}
                  </h3>
                </div>

                {/* Listening media */}
                {s.type === "listening" && (
                  <div className="space-y-3">
                    <div>
                      <label className={lbl} style={{ color: "var(--brown-light)" }}>Тип медиа</label>
                      <div className="flex gap-4 mt-1 flex-wrap">
                        {(["audio", "youtube", "external"] as const).map(mt => (
                          <label key={mt} className="flex items-center gap-1.5 cursor-pointer text-sm"
                            style={{ color: "var(--brown-dark)" }}>
                            <input type="radio" value={mt} checked={s.mediaType === mt}
                              onChange={() => updateSection(sIdx, { mediaType: mt })}
                              className="accent-amber-700" />
                            {mt === "audio" ? "Аудиофайл" : mt === "youtube" ? "YouTube" : "Внешняя ссылка"}
                          </label>
                        ))}
                      </div>
                    </div>

                    {s.mediaType === "audio" ? (
                      <div>
                        <label className={lbl} style={{ color: "var(--brown-light)" }}>Аудиофайл</label>
                        <input ref={audioInputRef} type="file" accept="audio/*"
                          onChange={e => updateSection(sIdx, { mediaFile: e.target.files?.[0] ?? null })}
                          className="w-full mt-1 text-sm" style={{ color: "var(--brown-dark)" }} />
                        {s.mediaFile && (
                          <p className="text-xs mt-1" style={{ color: "#1a7a3a" }}>✓ {s.mediaFile.name}</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className={lbl} style={{ color: "var(--brown-light)" }}>
                          {s.mediaType === "youtube" ? "Ссылка YouTube" : "Внешняя ссылка"}
                        </label>
                        <input value={s.mediaUrl}
                          onChange={e => updateSection(sIdx, { mediaUrl: e.target.value })}
                          className="w-full mt-1 px-3 py-2 rounded-xl border outline-none text-sm" style={inp}
                          placeholder={s.mediaType === "youtube" ? "https://youtube.com/watch?v=..." : "https://..."} />
                      </div>
                    )}

                    <div className="flex items-center gap-6 flex-wrap">
                      <div className="flex items-center gap-2">
                        <label className="text-sm" style={{ color: "var(--brown-dark)" }}>Прослушиваний:</label>
                        <input type="number" min={1} max={5} value={s.maxPlays}
                          onChange={e => updateSection(sIdx, { maxPlays: parseInt(e.target.value) || 2 })}
                          className="px-2 py-1 rounded-lg border outline-none text-sm text-center"
                          style={{ ...inp, width: 56 }} />
                      </div>
                      {s.mediaType === "youtube" && (
                        <label className="flex items-center gap-2 cursor-pointer text-sm select-none"
                          style={{ color: "var(--brown-dark)" }}>
                          <input type="checkbox" checked={s.hideSubtitles}
                            onChange={e => updateSection(sIdx, { hideSubtitles: e.target.checked })}
                            className="w-4 h-4 accent-amber-700" />
                          Скрыть субтитры
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* Writing prompt */}
                {s.type === "writing" ? (
                  <div className="space-y-3">
                    <div>
                      <label className={lbl} style={{ color: "var(--brown-light)" }}>Задание (что написать)</label>
                      <textarea value={s.writingPrompt}
                        onChange={e => updateSection(sIdx, { writingPrompt: e.target.value })}
                        rows={3} placeholder="Напишите эссе на тему..."
                        className="w-full mt-1 px-3 py-2 rounded-xl border outline-none text-sm resize-none" style={inp} />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm" style={{ color: "var(--brown-dark)" }}>Максимум баллов:</label>
                      <input type="number" min={1} max={100} value={s.writingPoints}
                        onChange={e => updateSection(sIdx, { writingPoints: parseInt(e.target.value) || 10 })}
                        className="px-2 py-1 rounded-lg border outline-none text-sm text-center"
                        style={{ ...inp, width: 64 }} />
                    </div>
                  </div>
                ) : (
                  /* Tasks */
                  <div className="space-y-3">
                    {s.tasks.map((t, tIdx) => (
                      <TaskEditor
                        key={t._id}
                        task={t}
                        index={tIdx}
                        onUpdate={updated => updateTask(sIdx, tIdx, updated)}
                        onDelete={() => deleteTask(sIdx, tIdx)}
                        taskOptions={s.tasks.map((tt, i) => ({ index: i, label: `Задание ${i + 1}${tt.title ? `: ${tt.title}` : ""}` }))}
                        onMoveQuestion={(qIdx, toTaskIndex) => moveQuestionToTask(sIdx, tIdx, qIdx, toTaskIndex)}
                        onMoveUp={() => moveTaskUpdown(sIdx, tIdx, -1)}
                        onMoveDown={() => moveTaskUpdown(sIdx, tIdx, 1)}
                        canMoveUp={tIdx > 0}
                        canMoveDown={tIdx < s.tasks.length - 1}
                      />
                    ))}
                    <button type="button" onClick={() => addTask(sIdx)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border w-full justify-center text-sm font-medium hover:opacity-80 transition-all"
                      style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)", borderStyle: "dashed" }}>
                      <Plus size={14} /> Добавить задание
                    </button>
                  </div>
                )}
              </div>
              );
            });
          })()}

          {sections.every(s => !s.enabled) && (
            <p className="text-sm text-center py-4" style={{ color: "var(--brown-light)" }}>
              Выберите хотя бы один раздел выше
            </p>
          )}
        </div>
      </div>

      {/* ── Actions ── */}
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#fee2e2", color: "#b91c1c" }}>
          {error}
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <button type="button" disabled={saving}
          onClick={() => handleSave("draft")}
          className="px-5 py-2.5 rounded-xl border text-sm font-semibold disabled:opacity-50"
          style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)" }}>
          {saving ? "Сохраняю..." : existingTestId ? "Сохранить изменения" : "Сохранить черновик"}
        </button>
        <button type="button" disabled={saving}
          onClick={() => handleSave("issued")}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: "var(--gradient-primary)" }}>
          {uploading ? "Загружаю файл..." : saving ? "Сохраняю..." : "Сохранить и выдать ученику"}
        </button>
      </div>
    </div>
  );
}

// ── Data helpers ──────────────────────────────────────────────────────────────

function buildOptions(q: Question): Record<string, unknown> | null {
  switch (q.type) {
    case "mcq":       return { choices: q.choices };
    case "match":     return { left: q.matchLeft, right: q.matchRight };
    case "gap_fill":  return { template: q.gapTemplate };
    default:          return null;
  }
}

function buildCorrectAnswer(q: Question): Record<string, unknown> | null {
  switch (q.type) {
    case "mcq":       return { answer: q.mcqCorrect };
    case "true_false":return { answer: q.tfCorrect };
    case "fill_in":   return { answer: q.fillCorrect };
    case "match":     return { matches: q.matchCorrect };
    case "gap_fill":  return { gaps: q.gapCorrect };
    default:          return null;
  }
}

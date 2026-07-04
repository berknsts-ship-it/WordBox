"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { createTest } from "@/app/actions/tests";

// ── Types ─────────────────────────────────────────────────────────────────────

type QType = "mcq" | "true_false" | "fill_in" | "match" | "gap_fill";
type MediaType = "audio" | "youtube" | "external";
type SectionType = "listening" | "reading" | "vocabulary" | "writing";

type Question = {
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

type Section = {
  type: SectionType;
  enabled: boolean;
  questions: Question[];
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

function defaultSection(type: SectionType): Section {
  return {
    type,
    enabled: false,
    questions: [],
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

// ── Question editor ───────────────────────────────────────────────────────────

function QuestionEditor({
  q,
  index,
  onUpdate,
  onDelete,
}: {
  q: Question;
  index: number;
  onUpdate: (updated: Question) => void;
  onDelete: () => void;
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
        <GripVertical size={14} style={{ color: "var(--brown-light)" }} />
        <span className="text-sm font-medium flex-1" style={{ color: "var(--brown-dark)" }}>
          {index + 1}. {Q_LABELS[q.type]} — {q.points} б.
          {q.prompt && <span style={{ color: "var(--brown-light)" }}> · {q.prompt.slice(0, 40)}{q.prompt.length > 40 ? "…" : ""}</span>}
        </span>
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
            <div>
              <label style={lbl}>Варианты ответов</label>
              <div className="mt-1 space-y-1.5">
                {(["A", "B", "C", "D"] as const).map((letter, i) => (
                  <div key={letter} className="flex items-center gap-2">
                    <input type="radio" name={`mcq-${q._id}`} value={letter}
                      checked={q.mcqCorrect === letter}
                      onChange={() => set({ mcqCorrect: letter })}
                      className="accent-amber-700 shrink-0" />
                    <span className="text-sm font-bold w-4 shrink-0" style={{ color: "var(--brown-mid)" }}>{letter}</span>
                    <input value={q.choices[i]} onChange={e => {
                      const c = [...q.choices] as [string, string, string, string];
                      c[i] = e.target.value;
                      set({ choices: c });
                    }}
                      className="flex-1 px-2 py-1 rounded-lg border outline-none text-sm" style={inp}
                      placeholder={`Вариант ${letter}`} />
                  </div>
                ))}
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--brown-light)" }}>Выберите радиокнопку рядом с правильным ответом</p>
            </div>
          )}

          {/* True/False */}
          {q.type === "true_false" && (
            <div>
              <label style={lbl}>Правильный ответ</label>
              <div className="flex gap-4 mt-1">
                {(["true", "false"] as const).map(v => (
                  <label key={v} className="flex items-center gap-1.5 cursor-pointer text-sm" style={{ color: "var(--brown-dark)" }}>
                    <input type="radio" value={v} checked={q.tfCorrect === v}
                      onChange={() => set({ tfCorrect: v })}
                      className="accent-amber-700" />
                    {v === "true" ? "True" : "False"}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Fill-in */}
          {q.type === "fill_in" && (
            <div>
              <label style={lbl}>Правильный ответ</label>
              <input value={q.fillCorrect} onChange={e => set({ fillCorrect: e.target.value })}
                className="w-full mt-1 px-2 py-1.5 rounded-lg border outline-none text-sm" style={inp}
                placeholder="Верный ответ (регистр не важен)" />
            </div>
          )}

          {/* Match */}
          {q.type === "match" && (
            <div>
              <label style={lbl}>Пары (левый → правый)</label>
              <div className="mt-1 space-y-1.5">
                {q.matchLeft.map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input value={q.matchLeft[i]} onChange={e => {
                      const l = [...q.matchLeft]; l[i] = e.target.value;
                      set({ matchLeft: l });
                    }}
                      className="flex-1 px-2 py-1 rounded-lg border outline-none text-sm" style={inp}
                      placeholder="Левый" />
                    <span style={{ color: "var(--brown-light)" }}>→</span>
                    <input value={q.matchRight[i]} onChange={e => {
                      const r = [...q.matchRight]; r[i] = e.target.value;
                      set({ matchRight: r });
                    }}
                      className="flex-1 px-2 py-1 rounded-lg border outline-none text-sm" style={inp}
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
                  className="text-xs px-2 py-1 rounded-lg border"
                  style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)" }}>
                  + Добавить пару
                </button>
              </div>
              <p className="text-xs mt-1.5" style={{ color: "var(--brown-light)" }}>
                Пары перемешаются для ученика. Ключ задаётся порядком строк (левый[i] → правый[i]).
              </p>
            </div>
          )}

          {/* Gap-fill */}
          {q.type === "gap_fill" && (
            <div>
              <label style={lbl}>Текст с пропусками (используйте ___ для каждого пропуска)</label>
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

              {countGaps(q.gapTemplate) > 0 && (
                <div className="mt-2">
                  <label style={lbl}>Правильные ответы</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {q.gapCorrect.map((g, i) => (
                      <input key={i} value={g}
                        onChange={e => {
                          const gaps = [...q.gapCorrect]; gaps[i] = e.target.value;
                          set({ gapCorrect: gaps });
                        }}
                        className="px-2 py-1 rounded-lg border outline-none text-sm"
                        style={{ ...inp, width: 120 }}
                        placeholder={`Пропуск ${i + 1}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main TestBuilder ──────────────────────────────────────────────────────────

export default function TestBuilder({
  students,
}: {
  students: { id: string; name: string }[];
}) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [studentId, setStudentId] = useState("");
  const [timeLimitMin, setTimeLimitMin] = useState("");
  const [issuedAt, setIssuedAt] = useState("");
  const [score5, setScore5] = useState("");
  const [score4, setScore4] = useState("");
  const [score3, setScore3] = useState("");

  const SECTION_ORDER: SectionType[] = ["listening", "reading", "vocabulary", "writing"];
  const [sections, setSections] = useState<Section[]>(SECTION_ORDER.map(defaultSection));

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const updateSection = (idx: number, patch: Partial<Section>) => {
    setSections(prev => prev.map((s, i) => i === idx ? { ...s, ...patch } : s));
  };

  const addQuestion = (sIdx: number) => {
    setSections(prev => prev.map((s, i) =>
      i === sIdx ? { ...s, questions: [...s.questions, emptyQuestion()] } : s
    ));
  };

  const updateQuestion = (sIdx: number, qIdx: number, q: Question) => {
    setSections(prev => prev.map((s, i) =>
      i === sIdx ? { ...s, questions: s.questions.map((qq, j) => j === qIdx ? q : qq) } : s
    ));
  };

  const deleteQuestion = (sIdx: number, qIdx: number) => {
    setSections(prev => prev.map((s, i) =>
      i === sIdx ? { ...s, questions: s.questions.filter((_, j) => j !== qIdx) } : s
    ));
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
          i === listeningIdx ? { ...s, media_url: url } : s
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
            questions: [{
              type: "writing" as const,
              prompt: s.writingPrompt,
              options: null,
              correct_answer: null,
              points: s.writingPoints,
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
          questions: s.questions.map(q => ({
            type: q.type,
            prompt: q.prompt,
            points: q.points,
            options: buildOptions(q),
            correct_answer: buildCorrectAnswer(q),
          })),
        };
      });

    const result = await createTest({
      title: title.trim(),
      student_id: studentId || null,
      time_limit_min: timeLimitMin ? parseInt(timeLimitMin) : null,
      issued_at: issuedAt ? `${issuedAt}T00:00:00` : null,
      score_5: score5 ? parseInt(score5) : null,
      score_4: score4 ? parseInt(score4) : null,
      score_3: score3 ? parseInt(score3) : null,
      sections: sectionInputs,
    });

    setSaving(false);
    if (result.error) { setError(result.error); return; }

    // Issue if requested
    if (status === "issued" && result.id) {
      const { issueTest } = await import("@/app/actions/tests");
      await issueTest(result.id);
    }

    router.push("/tutor/tests");
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
          {sections.map((s, sIdx) => {
            if (!s.enabled) return null;
            return (
              <div key={s.type} className="rounded-xl border p-4 space-y-4"
                style={{ borderColor: "var(--brown-pale)", background: "#fefcf8" }}>
                <h3 className="font-semibold text-sm" style={{ color: "var(--brown-dark)" }}>
                  {SECTION_LABELS[s.type]}
                </h3>

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
                  /* Questions */
                  <div className="space-y-2">
                    {s.questions.map((q, qIdx) => (
                      <QuestionEditor
                        key={q._id}
                        q={q}
                        index={qIdx}
                        onUpdate={updated => updateQuestion(sIdx, qIdx, updated)}
                        onDelete={() => deleteQuestion(sIdx, qIdx)}
                      />
                    ))}
                    <button type="button" onClick={() => addQuestion(sIdx)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border w-full justify-center text-sm font-medium hover:opacity-80 transition-all"
                      style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)", borderStyle: "dashed" }}>
                      <Plus size={14} /> Добавить вопрос
                    </button>
                  </div>
                )}
              </div>
            );
          })}

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
          {saving ? "Сохраняю..." : "Сохранить черновик"}
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

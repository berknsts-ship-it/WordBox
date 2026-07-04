"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { startTest, submitTest, incrementPlayCount } from "@/app/actions/tests";
import { Clock, Volume2, ExternalLink } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Section = {
  id: string;
  type: string;
  media_type: string | null;
  media_url: string | null;
  max_plays: number;
  hide_subtitles: boolean;
  test_questions: Question[];
};

type Question = {
  id: string;
  type: string;
  prompt: string | null;
  options: Record<string, unknown> | null;
  points: number;
  order_index: number;
};

type AnswerMap = Record<string, Record<string, unknown>>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getYouTubeEmbed(url: string, hideSubtitles: boolean): string {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (!match) return url;
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    ...(hideSubtitles ? { cc_load_policy: "0", cc_lang_pref: "none" } : {}),
  });
  return `https://www.youtube.com/embed/${match[1]}?${params}`;
}

// ── Question renderers ────────────────────────────────────────────────────────

function MCQQuestion({ q, answer, onAnswer }: { q: Question; answer?: Record<string, unknown>; onAnswer: (a: Record<string, unknown>) => void }) {
  const choices = (q.options?.choices as string[]) ?? [];
  const selected = answer?.answer as string | undefined;
  return (
    <div className="space-y-2">
      {choices.map((c, i) => {
        const letter = ["A", "B", "C", "D"][i];
        return (
          <button key={i} type="button"
            onClick={() => onAnswer({ answer: letter })}
            className="w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm"
            style={{
              borderColor: selected === letter ? "var(--brown-dark)" : "var(--brown-pale)",
              background: selected === letter ? "var(--brown-pale)" : "white",
              color: "var(--brown-dark)",
              fontWeight: selected === letter ? 600 : 400,
            }}>
            <span className="font-bold mr-2" style={{ color: "var(--brown-mid)" }}>{letter}.</span>
            {c}
          </button>
        );
      })}
    </div>
  );
}

function TFQuestion({ q, answer, onAnswer }: { q: Question; answer?: Record<string, unknown>; onAnswer: (a: Record<string, unknown>) => void }) {
  const selected = answer?.answer as string | undefined;
  return (
    <div className="flex gap-3">
      {["true", "false"].map(v => (
        <button key={v} type="button"
          onClick={() => onAnswer({ answer: v })}
          className="flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all"
          style={{
            borderColor: selected === v ? "var(--brown-dark)" : "var(--brown-pale)",
            background: selected === v ? "var(--brown-pale)" : "white",
            color: "var(--brown-dark)",
          }}>
          {v === "true" ? "True" : "False"}
        </button>
      ))}
    </div>
  );
}

function FillInQuestion({ q, answer, onAnswer }: { q: Question; answer?: Record<string, unknown>; onAnswer: (a: Record<string, unknown>) => void }) {
  return (
    <input
      type="text"
      value={(answer?.answer as string) ?? ""}
      onChange={e => onAnswer({ answer: e.target.value })}
      className="w-full px-4 py-3 rounded-xl border-2 outline-none text-sm"
      style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)" }}
      placeholder="Ваш ответ..."
    />
  );
}

function MatchQuestion({ q, answer, onAnswer }: { q: Question; answer?: Record<string, unknown>; onAnswer: (a: Record<string, unknown>) => void }) {
  const left = (q.options?.left as string[]) ?? [];
  const right = (q.options?.right as string[]) ?? [];
  // Shuffle right side for display (stable shuffle by sort)
  const shuffledRight = [...right].sort();
  const matches = (answer?.matches as number[]) ?? Array(left.length).fill(-1);

  const setMatch = (li: number, ri: number) => {
    const m = [...matches];
    m[li] = ri;
    onAnswer({ matches: m });
  };

  return (
    <div className="space-y-2">
      {left.map((l, li) => (
        <div key={li} className="flex items-center gap-3">
          <div className="flex-1 px-3 py-2 rounded-lg text-sm"
            style={{ background: "#f8f4ee", color: "var(--brown-dark)" }}>
            {l}
          </div>
          <span style={{ color: "var(--brown-light)" }}>→</span>
          <select
            value={matches[li] === -1 ? "" : String(matches[li])}
            onChange={e => setMatch(li, parseInt(e.target.value))}
            className="flex-1 px-3 py-2 rounded-xl border outline-none text-sm"
            style={{ borderColor: "var(--brown-pale)", background: "white", color: "var(--brown-dark)" }}>
            <option value="">Выберите...</option>
            {shuffledRight.map((r, ri) => (
              <option key={ri} value={right.indexOf(r)}>{r}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

function GapFillQuestion({ q, answer, onAnswer }: { q: Question; answer?: Record<string, unknown>; onAnswer: (a: Record<string, unknown>) => void }) {
  const template = (q.options?.template as string) ?? "";
  const parts = template.split("___");
  const gaps = (answer?.gaps as string[]) ?? Array(parts.length - 1).fill("");

  const setGap = (i: number, v: string) => {
    const g = [...gaps];
    g[i] = v;
    onAnswer({ gaps: g });
  };

  return (
    <div className="text-sm" style={{ color: "var(--brown-dark)", lineHeight: 2 }}>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <input
              type="text"
              value={gaps[i] ?? ""}
              onChange={e => setGap(i, e.target.value)}
              className="inline-block px-2 py-0.5 rounded-lg border-b-2 outline-none text-sm text-center mx-1"
              style={{ borderColor: "var(--brown-dark)", background: "transparent", width: 100 }}
            />
          )}
        </span>
      ))}
    </div>
  );
}

function WritingQuestion({ q, answer, onAnswer }: { q: Question; answer?: Record<string, unknown>; onAnswer: (a: Record<string, unknown>) => void }) {
  return (
    <textarea
      value={(answer?.text as string) ?? ""}
      onChange={e => onAnswer({ text: e.target.value })}
      rows={8}
      className="w-full px-4 py-3 rounded-xl border-2 outline-none text-sm resize-none"
      style={{ borderColor: "var(--brown-pale)", color: "var(--brown-dark)" }}
      placeholder="Пишите здесь..."
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TestTaker({
  test, sections, studentId, studentCode, existingAnswers,
}: {
  test: { id: string; title: string; status: string; time_limit_min: number | null; play_count: number; started_at: string | null };
  sections: Section[];
  studentId: string;
  studentCode: string;
  existingAnswers: { question_id: string; answer: Record<string, unknown> }[];
}) {
  const router = useRouter();
  const [started, setStarted] = useState(test.status === "in_progress");
  const [answers, setAnswers] = useState<AnswerMap>(() => {
    const m: AnswerMap = {};
    existingAnswers.forEach(a => { m[a.question_id] = a.answer; });
    return m;
  });
  const [playCount, setPlayCount] = useState(test.play_count);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const startedAt = useRef<Date | null>(test.started_at ? new Date(test.started_at) : null);

  // Timer
  useEffect(() => {
    if (!started || !test.time_limit_min) return;
    const tick = () => {
      if (!startedAt.current) return;
      const elapsed = (Date.now() - startedAt.current.getTime()) / 1000;
      const left = test.time_limit_min! * 60 - elapsed;
      setTimeLeft(Math.max(0, left));
      if (left <= 0) handleSubmit();
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  const handleStart = async () => {
    await startTest(test.id, studentId);
    startedAt.current = new Date();
    setStarted(true);
  };

  const handleAnswer = (questionId: string, answer: Record<string, unknown>) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    const payload = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
    await submitTest(test.id, studentId, payload);
    setSubmitted(true);
  }, [answers, submitting, test.id, studentId]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // ── Start screen ──
  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "var(--theme-bg, #f8f4ee)" }}>
        <div className="rounded-2xl border p-8 max-w-md w-full text-center"
          style={{ background: "white", borderColor: "var(--brown-pale)", boxShadow: "var(--shadow-card)" }}>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--brown-dark)" }}>
            {test.title}
          </h1>
          {test.time_limit_min && (
            <p className="text-sm mb-6" style={{ color: "var(--brown-light)" }}>
              <Clock size={14} className="inline mr-1" />
              Ограничение времени: {test.time_limit_min} мин.
            </p>
          )}
          <p className="text-sm mb-6" style={{ color: "var(--brown-mid)" }}>
            После нажатия «Начать» таймер запустится. Завершить работу нужно до окончания времени.
          </p>
          <button onClick={handleStart}
            className="w-full py-3 rounded-xl font-semibold text-white"
            style={{ background: "var(--gradient-primary)" }}>
            Начать тест
          </button>
        </div>
      </div>
    );
  }

  // ── Submitted screen ──
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "var(--theme-bg, #f8f4ee)" }}>
        <div className="rounded-2xl border p-8 max-w-md w-full text-center"
          style={{ background: "white", borderColor: "var(--brown-pale)", boxShadow: "var(--shadow-card)" }}>
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--brown-dark)" }}>
            Работа сдана!
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--brown-mid)" }}>
            Результат будет доступен после проверки репетитором.
          </p>
          <button onClick={() => router.push(`/student/${studentCode}?tab=tests`)}
            className="px-6 py-2.5 rounded-xl font-semibold text-white"
            style={{ background: "var(--gradient-primary)" }}>
            Вернуться к кабинету
          </button>
        </div>
      </div>
    );
  }

  // ── Test taking ──
  return (
    <div className="min-h-screen" style={{ background: "var(--theme-bg, #f8f4ee)" }}>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between"
        style={{ background: "white", boxShadow: "0 1px 8px rgba(0,0,0,0.08)" }}>
        <h1 className="font-bold text-base truncate" style={{ color: "var(--brown-dark)" }}>
          {test.title}
        </h1>
        <div className="flex items-center gap-3 shrink-0">
          {timeLeft !== null && (
            <span className="flex items-center gap-1 text-sm font-mono font-bold px-3 py-1 rounded-full"
              style={{ background: timeLeft < 120 ? "#fee2e2" : "#f0fdf4", color: timeLeft < 120 ? "#dc2626" : "#1a7a3a" }}>
              <Clock size={13} /> {formatTime(timeLeft)}
            </span>
          )}
          <button onClick={handleSubmit} disabled={submitting}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--gradient-primary)" }}>
            {submitting ? "Отправляю..." : "Сдать работу"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {sections.map(section => {
          const questions = [...section.test_questions].sort((a, b) => a.order_index - b.order_index);
          return (
            <div key={section.id} className="space-y-4">
              {/* Section header */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: "var(--brown-pale)" }} />
                <span className="text-xs font-bold uppercase tracking-widest px-3"
                  style={{ color: "var(--brown-light)" }}>
                  {{ listening: "Аудирование", reading: "Чтение", vocabulary: "Лексика и грамматика", writing: "Письмо" }[section.type] ?? section.type}
                </span>
                <div className="h-px flex-1" style={{ background: "var(--brown-pale)" }} />
              </div>

              {/* Listening media */}
              {section.type === "listening" && section.media_url && (
                <div className="rounded-2xl border p-4"
                  style={{ background: "white", borderColor: "var(--brown-pale)" }}>
                  {section.media_type === "youtube" ? (
                    <>
                      <div className="relative w-full rounded-xl overflow-hidden mb-3"
                        style={{ paddingTop: "56.25%" }}>
                        <iframe
                          src={playCount < section.max_plays
                            ? getYouTubeEmbed(section.media_url, section.hide_subtitles)
                            : "about:blank"}
                          className="absolute inset-0 w-full h-full border-0"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs" style={{ color: "var(--brown-light)" }}>
                        <span>Просмотрено: {playCount} / {section.max_plays}</span>
                        {playCount < section.max_plays && (
                          <button
                            onClick={async () => {
                              await incrementPlayCount(test.id);
                              setPlayCount(p => p + 1);
                            }}
                            className="px-3 py-1 rounded-lg border text-xs"
                            style={{ borderColor: "var(--brown-pale)", color: "var(--brown-mid)" }}>
                            Отметить как просмотренное
                          </button>
                        )}
                      </div>
                    </>
                  ) : section.media_type === "audio" ? (
                    <div className="flex flex-col gap-3">
                      <audio
                        controls
                        onPlay={() => {
                          if (playCount < section.max_plays) {
                            incrementPlayCount(test.id);
                            setPlayCount(p => p + 1);
                          }
                        }}
                        className="w-full"
                        src={section.media_url}
                        style={{ filter: "sepia(30%)" }}
                      />
                      <p className="text-xs" style={{ color: "var(--brown-light)" }}>
                        <Volume2 size={12} className="inline mr-1" />
                        Прослушиваний: {playCount} / {section.max_plays}
                      </p>
                    </div>
                  ) : (
                    <a href={section.media_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-medium"
                      style={{ color: "#2060d0" }}>
                      <ExternalLink size={14} /> Открыть материал
                    </a>
                  )}
                </div>
              )}

              {/* Questions */}
              {questions.map((q, qi) => (
                <div key={q.id} className="rounded-2xl border p-5"
                  style={{ background: "white", borderColor: "var(--brown-pale)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  <div className="mb-3">
                    <span className="text-xs font-semibold" style={{ color: "var(--brown-light)" }}>
                      Вопрос {qi + 1} · {q.points} б.
                    </span>
                    {q.prompt && (
                      <p className="mt-1 font-medium" style={{ color: "var(--brown-dark)" }}>{q.prompt}</p>
                    )}
                  </div>

                  {q.type === "mcq" && <MCQQuestion q={q} answer={answers[q.id]} onAnswer={a => handleAnswer(q.id, a)} />}
                  {q.type === "true_false" && <TFQuestion q={q} answer={answers[q.id]} onAnswer={a => handleAnswer(q.id, a)} />}
                  {q.type === "fill_in" && <FillInQuestion q={q} answer={answers[q.id]} onAnswer={a => handleAnswer(q.id, a)} />}
                  {q.type === "match" && <MatchQuestion q={q} answer={answers[q.id]} onAnswer={a => handleAnswer(q.id, a)} />}
                  {q.type === "gap_fill" && <GapFillQuestion q={q} answer={answers[q.id]} onAnswer={a => handleAnswer(q.id, a)} />}
                  {q.type === "writing" && <WritingQuestion q={q} answer={answers[q.id]} onAnswer={a => handleAnswer(q.id, a)} />}
                </div>
              ))}
            </div>
          );
        })}

        {/* Bottom submit */}
        <button onClick={handleSubmit} disabled={submitting}
          className="w-full py-3 rounded-2xl font-semibold text-white disabled:opacity-50"
          style={{ background: "var(--gradient-primary)" }}>
          {submitting ? "Отправляю..." : "Сдать работу"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import Link from "next/link";
import { upsertWordProgress } from "@/app/actions/trainer";

// ─── Types ────────────────────────────────────────────────────────────────────

type TrainerWord = {
  id: string;
  english: string;
  russian: string;
  example: string | null;
  example_sentence: string | null;
  answer_variants: string[];
};

type CardMode = "flash" | "selfcheck" | "matching" | "fillblank" | "mixed";
type SessionPhase = "mode-select" | "training" | "done";
type QueueItem = { word: TrainerWord; pass: 1 | 2 };
type SingleCardType = "flash" | "selfcheck" | "fillblank";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getCardType(word: TrainerWord, pass: 1 | 2, mode: CardMode): SingleCardType {
  if (mode === "flash") return "flash";
  if (mode === "selfcheck") return "selfcheck";
  if (mode === "fillblank") return word.example_sentence ? "fillblank" : "flash";
  if (mode === "mixed") {
    const available: SingleCardType[] = ["flash", "selfcheck"];
    if (word.example_sentence) available.push("fillblank");
    // Deterministic per word+pass so it doesn't flicker on re-render
    const idx = (word.id.charCodeAt(0) + pass) % available.length;
    return available[idx];
  }
  return "flash";
}

const MATCHING_GROUP = 4;

// ─── Confetti ─────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ["#C4A468", "#74070E", "#6b9e6b", "#4a6580", "#C05010", "#9C7A45", "#EDE0CC"];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: `${(i * 100) / 28 + Math.sin(i) * 4}%`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: `${(i * 0.08) % 2.4}s`,
        duration: `${1.4 + (i * 0.07) % 1.2}s`,
        size: `${7 + (i * 3) % 9}px`,
        rotate: i % 2 === 0 ? "2px" : "0px", // 0px = circle, 2px = rounded square
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 50 }}>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="wb-confetti-piece"
          style={{
            left: p.left,
            top: "-16px",
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.rotate,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

// ─── Done Screen ──────────────────────────────────────────────────────────────

function DoneScreen({
  total,
  setName,
  code,
  onRestart,
}: {
  total: number;
  setName: string;
  code: string;
  onRestart: () => void;
}) {
  return (
    <>
      <Confetti />
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-7xl mb-5">🎉</p>
        <h2 className="text-2xl font-semibold mb-2" style={{ color: "var(--brown-dark)" }}>
          Отлично, ты справился!
        </h2>
        <p className="mb-8 max-w-xs" style={{ color: "var(--brown-mid)" }}>
          Все {total} слов из набора «{setName}» выучены в этой сессии
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <button
            onClick={onRestart}
            className="flex-1 py-3 rounded-2xl font-semibold text-sm hover:opacity-80 transition-opacity"
            style={{ background: "var(--theme-card-bg)", color: "var(--brown-mid)", border: "1.5px solid var(--theme-card-border)" }}
          >
            🔄 Повторить
          </button>
          <Link
            href={`/student/${code}?tab=trainer`}
            className="flex-1 py-3 rounded-2xl font-semibold text-sm text-white hover:opacity-80 transition-opacity text-center"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-button)" }}
          >
            К наборам
          </Link>
        </div>
      </div>
    </>
  );
}

// ─── Mode Select ──────────────────────────────────────────────────────────────

function ModeSelectScreen({
  words,
  onStart,
}: {
  words: TrainerWord[];
  onStart: (mode: CardMode) => void;
}) {
  const hasSentences = words.some((w) => w.example_sentence);

  const modes: { mode: CardMode; icon: string; label: string; desc: string; disabled?: boolean }[] = [
    { mode: "flash",     icon: "🃏", label: "Флешкарты",       desc: "Переворачивай и оценивай сам" },
    { mode: "selfcheck", icon: "✍️", label: "Проверь себя",    desc: "Введи перевод вручную" },
    { mode: "matching",  icon: "🔗", label: "Сопоставление",   desc: "Соедини слово с переводом" },
    { mode: "fillblank", icon: "📝", label: "Заполни пробел",  desc: "Вставь слово в предложение", disabled: !hasSentences },
    { mode: "mixed",     icon: "🔀", label: "Смешанный",       desc: "Все типы вперемешку" },
  ];

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-lg font-semibold mb-1 text-center" style={{ color: "var(--brown-dark)" }}>
        Выбери режим тренировки
      </h2>
      <p className="text-sm text-center mb-5" style={{ color: "var(--brown-light)" }}>
        {words.length} слов в наборе
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {modes.map(({ mode, icon, label, desc, disabled }) => (
          <button
            key={mode}
            onClick={() => !disabled && onStart(mode)}
            disabled={disabled}
            className={`rounded-2xl border p-4 text-left transition-all ${
              disabled ? "opacity-40 cursor-not-allowed" : "hover:shadow-md hover:border-[var(--brown-pale)] cursor-pointer"
            }`}
            style={{ background: "var(--theme-card-bg)", borderColor: "var(--theme-card-border)" }}
          >
            <p className="text-2xl mb-2">{icon}</p>
            <p className="font-semibold text-sm" style={{ color: "var(--brown-dark)" }}>{label}</p>
            <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--brown-light)" }}>{desc}</p>
            {disabled && (
              <p className="text-xs mt-1" style={{ color: "#b06030" }}>Нет предложений</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Session Header ───────────────────────────────────────────────────────────

function SessionHeader({
  setName,
  code,
  queueCount,
  learningCount,
  masteredCount,
  total,
}: {
  setName: string;
  code: string;
  queueCount: number;
  learningCount: number;
  masteredCount: number;
  total: number;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <Link
          href={`/student/${code}?tab=trainer`}
          className="text-sm font-semibold hover:underline"
          style={{ color: "var(--brown-light)" }}
        >
          ← Назад
        </Link>
        <p className="text-xs font-semibold" style={{ color: "var(--brown-light)" }}>
          {setName}
        </p>
        <div className="w-16" />
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full overflow-hidden mb-2.5" style={{ background: "var(--theme-card-bg)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            background: masteredCount === total ? "#6b9e6b" : "var(--brown-mid)",
            width: `${total > 0 ? (masteredCount / total) * 100 : 0}%`,
          }}
        />
      </div>

      {/* Counters */}
      <div className="flex items-center justify-center gap-4 text-xs" style={{ color: "var(--brown-light)" }}>
        <span>📋 {queueCount} в очереди</span>
        <span>📖 {learningCount} учу</span>
        <span style={{ color: masteredCount > 0 ? "#4a7a5e" : "var(--brown-light)" }}>
          ✓ {masteredCount} выучил
        </span>
      </div>
    </div>
  );
}

// ─── Flashcard ────────────────────────────────────────────────────────────────

function FlashCard({
  word,
  pass,
  onKnow,
  onRetry,
}: {
  word: TrainerWord;
  pass: 1 | 2;
  onKnow: () => void;
  onRetry: () => void;
}) {
  const [flipped, setFlipped] = useState(false);

  // Reset flip when word changes
  useEffect(() => { setFlipped(false); }, [word.id, pass]);

  return (
    <>
      <div
        className="flip-card w-full mb-5"
        style={{ height: "240px" }}
        onClick={() => {
          if (!flipped) speak(word.english);
          setFlipped(!flipped);
        }}
      >
        <div className={`flip-card-inner ${flipped ? "flipped" : ""}`}>
          <div
            className="flip-card-front rounded-3xl flex flex-col items-center justify-center p-8 cursor-pointer select-none"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-button)" }}
          >
            {pass === 2 && (
              <p className="text-white/60 text-xs mb-3 font-semibold uppercase tracking-wider">
                🔄 Второй проход
              </p>
            )}
            <p className="text-4xl font-bold text-white text-center mb-3">{word.english}</p>
            <p className="text-white/60 text-sm">нажми, чтобы узнать перевод</p>
            <button
              onClick={(e) => { e.stopPropagation(); speak(word.english); }}
              className="mt-4 text-white/70 hover:text-white text-2xl transition-colors"
            >
              🔊
            </button>
          </div>
          <div
            className="flip-card-back rounded-3xl flex flex-col items-center justify-center p-8 cursor-pointer select-none"
            style={{ background: "var(--theme-card-bg)" }}
          >
            <p className="text-4xl font-bold text-center mb-3" style={{ color: "var(--brown-dark)" }}>
              {word.russian}
            </p>
            {word.example && (
              <p className="text-sm italic text-center mt-2 max-w-xs leading-relaxed" style={{ color: "var(--brown-mid)" }}>
                {word.example}
              </p>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); speak(word.english); }}
              className="mt-4 text-2xl hover:opacity-70 transition-opacity"
              style={{ color: "var(--brown-mid)" }}
            >
              🔊
            </button>
          </div>
        </div>
      </div>

      <div
        className={`flex gap-3 transition-opacity duration-300 ${flipped ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <button
          onClick={onRetry}
          className="flex-1 py-3 rounded-2xl font-semibold text-sm hover:opacity-80 transition-opacity"
          style={{ background: "var(--theme-card-bg)", color: "var(--brown-mid)", border: "1.5px solid var(--theme-card-border)" }}
        >
          🔄 Ещё раз
        </button>
        <button
          onClick={onKnow}
          className="flex-1 py-3 rounded-2xl font-semibold text-sm text-white hover:opacity-80 transition-opacity"
          style={{ background: "#6b9e6b" }}
        >
          {pass === 2 ? "✓ Выучил!" : "✓ Знаю!"}
        </button>
      </div>
    </>
  );
}

// ─── Self-check Card ──────────────────────────────────────────────────────────

function SelfCheckCard({
  word,
  pass,
  onKnow,
  onRetry,
}: {
  word: TrainerWord;
  pass: 1 | 2;
  onKnow: () => void;
  onRetry: () => void;
}) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  useEffect(() => {
    setInput("");
    setResult(null);
  }, [word.id, pass]);

  function check() {
    const clean = input.trim().toLowerCase();
    if (!clean) return;
    const correct = word.russian.trim().toLowerCase();
    const variants = (word.answer_variants ?? []).map((v) => v.toLowerCase());
    setResult(clean === correct || variants.includes(clean) ? "correct" : "wrong");
  }

  const bgColor = result === "correct" ? "#e8f5e8" : result === "wrong" ? "#fef0f0" : undefined;

  return (
    <>
      <div
        className="rounded-3xl flex flex-col items-center justify-center p-8 mb-5"
        style={{
          background: bgColor ?? "var(--gradient-primary)",
          boxShadow: bgColor ? "none" : "var(--shadow-button)",
          minHeight: "200px",
        }}
      >
        {pass === 2 && !result && (
          <p className="text-white/60 text-xs mb-3 font-semibold uppercase tracking-wider">
            🔄 Второй проход
          </p>
        )}
        <p
          className="text-4xl font-bold text-center mb-3"
          style={{ color: result ? "var(--brown-dark)" : "white" }}
        >
          {word.english}
        </p>
        {!result && <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>напиши перевод на русском</p>}
        {result === "correct" && (
          <p className="text-lg font-semibold" style={{ color: "#4a7a5e" }}>✓ Правильно! — {word.russian}</p>
        )}
        {result === "wrong" && (
          <p className="text-lg font-semibold text-center" style={{ color: "#c04040" }}>
            Правильный ответ: <strong>{word.russian}</strong>
          </p>
        )}
        <button
          onClick={() => speak(word.english)}
          className="mt-4 text-2xl hover:opacity-70 transition-opacity"
          style={{ color: result ? "var(--brown-mid)" : "rgba(255,255,255,0.7)" }}
        >
          🔊
        </button>
      </div>

      {!result ? (
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check()}
            placeholder="Перевод на русском..."
            className="flex-1 px-4 py-3 rounded-2xl border text-sm outline-none"
            style={{ borderColor: "var(--brown-pale)", background: "white", color: "var(--brown-dark)" }}
            autoFocus
          />
          <button
            onClick={check}
            disabled={!input.trim()}
            className="px-5 py-3 rounded-2xl font-semibold text-sm text-white hover:opacity-80 disabled:opacity-40 transition-opacity"
            style={{ background: "var(--gradient-primary)" }}
          >
            →
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 py-3 rounded-2xl font-semibold text-sm hover:opacity-80 transition-opacity"
            style={{ background: "var(--theme-card-bg)", color: "var(--brown-mid)", border: "1.5px solid var(--theme-card-border)" }}
          >
            🔄 Ещё раз
          </button>
          <button
            onClick={result === "correct" ? onKnow : onRetry}
            className="flex-1 py-3 rounded-2xl font-semibold text-sm text-white hover:opacity-80 transition-opacity"
            style={{ background: result === "correct" ? "#6b9e6b" : "var(--gradient-primary)" }}
          >
            {result === "correct" ? (pass === 2 ? "✓ Выучил!" : "✓ Знаю!") : "Продолжить →"}
          </button>
        </div>
      )}
    </>
  );
}

// ─── Fill-in-blank Card ───────────────────────────────────────────────────────

function FillBlankCard({
  word,
  pass,
  onKnow,
  onRetry,
}: {
  word: TrainerWord;
  pass: 1 | 2;
  onKnow: () => void;
  onRetry: () => void;
}) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  useEffect(() => {
    setInput("");
    setResult(null);
  }, [word.id, pass]);

  const sentence = word.example_sentence ?? "";

  function check() {
    const clean = input.trim().toLowerCase();
    if (!clean) return;
    const correct = word.english.trim().toLowerCase();
    const variants = (word.answer_variants ?? []).map((v) => v.toLowerCase());
    setResult(clean === correct || variants.includes(clean) ? "correct" : "wrong");
  }

  const parts = sentence.split("___");

  return (
    <>
      <div
        className="rounded-3xl p-7 mb-5"
        style={{
          background: result === "correct" ? "#e8f5e8" : result === "wrong" ? "#fef0f0" : "var(--theme-card-bg)",
          border: "1.5px solid var(--theme-card-border)",
          minHeight: "180px",
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--brown-light)" }}>
          Вставь пропущенное слово
        </p>
        <p className="text-xl text-center leading-relaxed font-medium mb-4" style={{ color: "var(--brown-dark)" }}>
          {result ? (
            sentence.replace("___", `[${word.english}]`)
          ) : (
            <>
              {parts[0]}
              <span className="font-bold" style={{ color: "var(--brown-mid)" }}>___</span>
              {parts[1]}
            </>
          )}
        </p>
        <p className="text-sm text-center" style={{ color: "var(--brown-mid)" }}>
          {word.russian}
        </p>
        {result === "correct" && (
          <p className="text-center mt-3 font-semibold text-sm" style={{ color: "#4a7a5e" }}>✓ Правильно!</p>
        )}
        {result === "wrong" && (
          <p className="text-center mt-3 font-semibold text-sm" style={{ color: "#c04040" }}>
            Ответ: <strong>{word.english}</strong>
          </p>
        )}
      </div>

      {!result ? (
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check()}
            placeholder="Введи слово по-английски..."
            className="flex-1 px-4 py-3 rounded-2xl border text-sm outline-none"
            style={{ borderColor: "var(--brown-pale)", background: "white", color: "var(--brown-dark)" }}
            autoFocus
          />
          <button
            onClick={check}
            disabled={!input.trim()}
            className="px-5 py-3 rounded-2xl font-semibold text-sm text-white hover:opacity-80 disabled:opacity-40 transition-opacity"
            style={{ background: "var(--gradient-primary)" }}
          >
            →
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 py-3 rounded-2xl font-semibold text-sm hover:opacity-80 transition-opacity"
            style={{ background: "var(--theme-card-bg)", color: "var(--brown-mid)", border: "1.5px solid var(--theme-card-border)" }}
          >
            🔄 Ещё раз
          </button>
          <button
            onClick={result === "correct" ? onKnow : onRetry}
            className="flex-1 py-3 rounded-2xl font-semibold text-sm text-white hover:opacity-80 transition-opacity"
            style={{ background: result === "correct" ? "#6b9e6b" : "var(--gradient-primary)" }}
          >
            {result === "correct" ? (pass === 2 ? "✓ Выучил!" : "✓ Знаю!") : "Продолжить →"}
          </button>
        </div>
      )}
    </>
  );
}

// ─── Matching Batch ───────────────────────────────────────────────────────────

function MatchingBatch({
  batch,
  onComplete,
}: {
  batch: QueueItem[];
  onComplete: () => void;
}) {
  const [leftItems] = useState(() => shuffle(batch.map((qi) => qi.word)));
  const [rightItems] = useState(() => shuffle(batch.map((qi) => qi.word)));
  const [selLeft, setSelLeft] = useState<string | null>(null);
  const [selRight, setSelRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [flash, setFlash] = useState<"wrong" | null>(null);

  function tryMatch(leftId: string, rightId: string) {
    if (leftId === rightId) {
      const next = new Set([...matched, leftId]);
      setMatched(next);
      setSelLeft(null);
      setSelRight(null);
      if (next.size === batch.length) {
        setTimeout(onComplete, 400);
      }
    } else {
      setFlash("wrong");
      setTimeout(() => {
        setSelLeft(null);
        setSelRight(null);
        setFlash(null);
      }, 500);
    }
  }

  function handleLeft(id: string) {
    if (matched.has(id)) return;
    const newLeft = selLeft === id ? null : id;
    setSelLeft(newLeft);
    if (newLeft && selRight) tryMatch(newLeft, selRight);
  }

  function handleRight(id: string) {
    if (matched.has(id)) return;
    const newRight = selRight === id ? null : id;
    setSelRight(newRight);
    if (selLeft && newRight) tryMatch(selLeft, newRight);
  }

  const matchedCount = matched.size;
  const total = batch.length;

  return (
    <div className="max-w-lg mx-auto">
      <p className="text-sm text-center mb-4" style={{ color: "var(--brown-light)" }}>
        Соедини каждое слово с переводом · {matchedCount}/{total}
      </p>
      {batch.some((qi) => qi.pass === 2) && (
        <p className="text-xs text-center mb-3" style={{ color: "var(--brown-light)" }}>🔄 Второй проход</p>
      )}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Left: English */}
        <div className="space-y-2">
          {leftItems.map((w) => {
            const isMatched = matched.has(w.id);
            const isSel = selLeft === w.id;
            const isWrong = isSel && flash === "wrong";
            return (
              <button
                key={w.id}
                onClick={() => handleLeft(w.id)}
                disabled={isMatched}
                className="w-full py-3 px-3 rounded-2xl text-sm font-semibold transition-all text-left"
                style={{
                  background: isMatched ? "#e8f5e8" : isWrong ? "#fef0f0" : isSel ? "var(--gradient-primary)" : "var(--theme-card-bg)",
                  color: isMatched ? "#4a7a5e" : isSel && !isWrong ? "white" : "var(--brown-dark)",
                  border: `1.5px solid ${isMatched ? "#6b9e6b" : isSel && !isWrong ? "transparent" : "var(--theme-card-border)"}`,
                  opacity: isMatched ? 0.65 : 1,
                }}
              >
                {isMatched ? "✓ " : ""}{w.english}
              </button>
            );
          })}
        </div>

        {/* Right: Russian */}
        <div className="space-y-2">
          {rightItems.map((w) => {
            const isMatched = matched.has(w.id);
            const isSel = selRight === w.id;
            const isWrong = isSel && flash === "wrong";
            return (
              <button
                key={w.id}
                onClick={() => handleRight(w.id)}
                disabled={isMatched}
                className="w-full py-3 px-3 rounded-2xl text-sm font-semibold transition-all text-left"
                style={{
                  background: isMatched ? "#e8f5e8" : isWrong ? "#fef0f0" : isSel ? "var(--gradient-primary)" : "var(--theme-card-bg)",
                  color: isMatched ? "#4a7a5e" : isSel && !isWrong ? "white" : "var(--brown-dark)",
                  border: `1.5px solid ${isMatched ? "#6b9e6b" : isSel && !isWrong ? "transparent" : "var(--theme-card-border)"}`,
                  opacity: isMatched ? 0.65 : 1,
                }}
              >
                {isMatched ? "✓ " : ""}{w.russian}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main WordTrainer ──────────────────────────────────────────────────────────

export default function WordTrainer({
  words,
  setName,
  code,
  studentId,
}: {
  words: TrainerWord[];
  setName: string;
  code: string;
  studentId: string;
}) {
  const total = words.length;
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>("mode-select");
  const [mode, setMode] = useState<CardMode>("flash");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [, startTransition] = useTransition();

  // Derived session counters (no extra state needed)
  const queueCount = queue.filter((qi) => qi.pass === 1).length;
  const learningCount = queue.filter((qi) => qi.pass === 2).length;
  const masteredCount = total - queueCount - learningCount;

  // Detect completion
  useEffect(() => {
    if (sessionPhase === "training" && queue.length === 0 && total > 0) {
      setSessionPhase("done");
    }
  }, [queue.length, sessionPhase, total]);

  function saveProgress(wordId: string, status: "queue" | "learning" | "mastered") {
    startTransition(async () => {
      await upsertWordProgress(studentId, wordId, status);
    });
  }

  function startSession(selectedMode: CardMode) {
    setMode(selectedMode);
    setQueue(shuffle(words).map((w) => ({ word: w, pass: 1 as const })));
    setSessionPhase("training");
  }

  function restart() {
    setQueue(shuffle(words).map((w) => ({ word: w, pass: 1 as const })));
    setSessionPhase("training");
  }

  function processAnswer(wordId: string, isKnow: boolean) {
    setQueue((prev) => {
      const [current, ...rest] = prev;
      if (!current || current.word.id !== wordId) return prev;

      if (isKnow) {
        if (current.pass === 1) {
          saveProgress(wordId, "learning");
          return [...rest, { word: current.word, pass: 2 as const }];
        } else {
          saveProgress(wordId, "mastered");
          return rest;
        }
      } else {
        // Don't know: reset to pass 1, push to end
        saveProgress(wordId, "queue");
        return [...rest, { word: current.word, pass: 1 as const }];
      }
    });
  }

  function processMatchingBatch(size: number) {
    setQueue((prev) => {
      const batch = prev.slice(0, size);
      const rest = prev.slice(size);
      const toEnd: QueueItem[] = [];

      for (const qi of batch) {
        if (qi.pass === 1) {
          saveProgress(qi.word.id, "learning");
          toEnd.push({ word: qi.word, pass: 2 as const });
        } else {
          saveProgress(qi.word.id, "mastered");
          // Don't re-add → word is mastered
        }
      }

      return [...rest, ...shuffle(toEnd)];
    });
  }

  // ── Mode select ──
  if (sessionPhase === "mode-select") {
    return <ModeSelectScreen words={words} onStart={startSession} />;
  }

  // ── Done ──
  if (sessionPhase === "done") {
    return (
      <DoneScreen
        total={total}
        setName={setName}
        code={code}
        onRestart={restart}
      />
    );
  }

  // ── Training ──
  if (queue.length === 0) return null;

  const current = queue[0];

  const header = (
    <SessionHeader
      setName={setName}
      code={code}
      queueCount={queueCount}
      learningCount={learningCount}
      masteredCount={masteredCount}
      total={total}
    />
  );

  // Matching mode: batch
  if (mode === "matching") {
    const batchSize = Math.min(MATCHING_GROUP, queue.length);
    if (batchSize >= 2) {
      const batch = queue.slice(0, batchSize);
      return (
        <div className="max-w-lg mx-auto">
          {header}
          <MatchingBatch
            key={batch.map((qi) => qi.word.id + qi.pass).join("|")}
            batch={batch}
            onComplete={() => processMatchingBatch(batchSize)}
          />
        </div>
      );
    }
    // Fallback to flashcard if only 1 word left
  }

  // Single-card modes
  const cardType = getCardType(current.word, current.pass, mode);

  return (
    <div className="max-w-lg mx-auto">
      {header}
      {cardType === "flash" && (
        <FlashCard
          key={current.word.id + current.pass}
          word={current.word}
          pass={current.pass}
          onKnow={() => processAnswer(current.word.id, true)}
          onRetry={() => processAnswer(current.word.id, false)}
        />
      )}
      {cardType === "selfcheck" && (
        <SelfCheckCard
          key={current.word.id + current.pass}
          word={current.word}
          pass={current.pass}
          onKnow={() => processAnswer(current.word.id, true)}
          onRetry={() => processAnswer(current.word.id, false)}
        />
      )}
      {cardType === "fillblank" && current.word.example_sentence && (
        <FillBlankCard
          key={current.word.id + current.pass}
          word={current.word}
          pass={current.pass}
          onKnow={() => processAnswer(current.word.id, true)}
          onRetry={() => processAnswer(current.word.id, false)}
        />
      )}
    </div>
  );
}

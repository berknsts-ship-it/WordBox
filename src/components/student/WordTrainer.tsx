"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

type Word = {
  id: string;
  english: string;
  russian: string;
  example: string | null;
};

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

export default function WordTrainer({ words, setName, code }: {
  words: Word[];
  setName: string;
  code: string;
}) {
  const [shuffled, setShuffled] = useState<Word[]>(() =>
    [...words].sort(() => Math.random() - 0.5)
  );
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [repeat, setRepeat] = useState<Word[]>([]);
  const [phase, setPhase] = useState<"main" | "repeat" | "done">("main");

  const current = phase === "repeat" ? repeat[index] : shuffled[index];
  const total = words.length;
  const progress = phase === "done" ? total : known.size;

  const next = useCallback((isKnown: boolean) => {
    if (!current) return;

    const newKnown = new Set(known);
    if (isKnown) {
      newKnown.add(current.id);
      setKnown(newKnown);
    } else {
      setRepeat((prev) => [...prev, current]);
    }

    setFlipped(false);

    const list = phase === "repeat" ? repeat : shuffled;
    if (index + 1 < list.length) {
      setIndex(index + 1);
    } else {
      // Закончили текущий проход
      const leftover = phase === "repeat" ? repeat.slice(index + 1) : [];
      const stillUnknown = [...leftover].filter((w) => !newKnown.has(w.id));
      if (phase === "main") {
        const mainLeftover = shuffled.slice(index + 1).filter((w) => !newKnown.has(w.id));
        const allRepeat = [...mainLeftover, ...repeat];
        if (allRepeat.length === 0) {
          setPhase("done");
        } else {
          setRepeat(allRepeat.sort(() => Math.random() - 0.5));
          setIndex(0);
          setPhase("repeat");
        }
      } else {
        if (stillUnknown.length === 0) {
          setPhase("done");
        } else {
          setRepeat(stillUnknown.sort(() => Math.random() - 0.5));
          setIndex(0);
        }
      }
    }
  }, [current, index, known, phase, repeat, shuffled]);

  function restart() {
    setShuffled([...words].sort(() => Math.random() - 0.5));
    setIndex(0);
    setFlipped(false);
    setKnown(new Set());
    setRepeat([]);
    setPhase("main");
  }

  if (phase === "done") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-6xl mb-4">🎉</p>
        <h2 className="text-2xl mb-2" style={{ color: "var(--brown-dark)" }}>
          Отлично!
        </h2>
        <p className="mb-8" style={{ color: "var(--brown-mid)" }}>
          Ты выучил все {total} слова из набора «{setName}»
        </p>
        <div className="flex gap-3">
          <button
            onClick={restart}
            className="px-6 py-3 rounded-2xl text-white font-semibold hover:opacity-80 transition-opacity"
            style={{ background: "var(--brown-mid)" }}
          >
            Повторить снова
          </button>
          <Link
            href={`/student/${code}?tab=trainer`}
            className="px-6 py-3 rounded-2xl font-semibold hover:opacity-80 transition-opacity"
            style={{ background: "var(--brown-pale)", color: "var(--brown-mid)" }}
          >
            К наборам
          </Link>
        </div>
      </div>
    );
  }

  const list = phase === "repeat" ? repeat : shuffled;

  return (
    <div className="max-w-lg mx-auto">
      {/* Шапка */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/student/${code}?tab=trainer`}
          className="text-sm font-semibold hover:underline"
          style={{ color: "var(--brown-light)" }}
        >
          ← Назад
        </Link>
        <div className="text-center">
          <p className="text-xs font-semibold" style={{ color: "var(--brown-light)" }}>
            {setName}
          </p>
          {phase === "repeat" && (
            <p className="text-xs" style={{ color: "var(--brown-light)" }}>
              🔄 Повторение
            </p>
          )}
        </div>
        <p className="text-sm font-semibold" style={{ color: "var(--brown-mid)" }}>
          {index + 1} / {list.length}
        </p>
      </div>

      {/* Прогресс */}
      <div className="w-full h-2 rounded-full mb-8 overflow-hidden" style={{ background: "var(--brown-pale)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            background: "var(--brown-mid)",
            width: `${(progress / total) * 100}%`,
          }}
        />
      </div>

      {/* Карточка */}
      <div
        className="flip-card w-full mb-6"
        style={{ height: "260px" }}
        onClick={() => {
          if (!flipped) speak(current.english);
          setFlipped(!flipped);
        }}
      >
        <div className={`flip-card-inner ${flipped ? "flipped" : ""}`}>
          {/* Лицевая сторона — английский */}
          <div
            className="flip-card-front rounded-3xl flex flex-col items-center justify-center p-8 cursor-pointer select-none"
            style={{ background: "var(--brown-mid)" }}
          >
            <p className="text-4xl font-bold text-white text-center mb-3">
              {current.english}
            </p>
            <p className="text-white/60 text-sm">нажми, чтобы узнать перевод</p>
            <button
              onClick={(e) => { e.stopPropagation(); speak(current.english); }}
              className="mt-4 text-white/80 hover:text-white text-2xl transition-colors"
              title="Произнести"
            >
              🔊
            </button>
          </div>

          {/* Обратная сторона — русский */}
          <div
            className="flip-card-back rounded-3xl flex flex-col items-center justify-center p-8 cursor-pointer select-none"
            style={{ background: "var(--brown-pale)" }}
          >
            <p className="text-4xl font-bold text-center mb-3" style={{ color: "var(--brown-dark)" }}>
              {current.russian}
            </p>
            {current.example && (
              <p className="text-sm italic text-center mt-2" style={{ color: "var(--brown-mid)" }}>
                {current.example}
              </p>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); speak(current.english); }}
              className="mt-4 text-2xl hover:opacity-70 transition-opacity"
              style={{ color: "var(--brown-mid)" }}
              title="Произнести"
            >
              🔊
            </button>
          </div>
        </div>
      </div>

      {/* Кнопки — появляются только после переворота */}
      <div className={`flex gap-3 transition-all duration-300 ${flipped ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <button
          onClick={() => next(false)}
          className="flex-1 py-3 rounded-2xl font-semibold text-sm hover:opacity-80 transition-opacity"
          style={{ background: "var(--brown-pale)", color: "var(--brown-mid)" }}
        >
          🔄 Ещё раз
        </button>
        <button
          onClick={() => next(true)}
          className="flex-1 py-3 rounded-2xl font-semibold text-sm text-white hover:opacity-80 transition-opacity"
          style={{ background: "#6b9e6b" }}
        >
          ✓ Знаю!
        </button>
      </div>

      {/* Счётчик знаю */}
      <p className="text-center text-xs mt-4" style={{ color: "var(--brown-light)" }}>
        Знаю: {progress} из {total}
      </p>
    </div>
  );
}

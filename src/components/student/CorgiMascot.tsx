"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { CORGI_EVENT } from "@/lib/corgi-events";

const GREETING = "Hello! Ready to learn?";
const MISSED_YOU = "I missed you!";
const MISSED_YOU_GAP_DAYS = 2;
const BUBBLE_MS = 3800;
const IDLE_MIN_MS = 3 * 60 * 1000;
const IDLE_MAX_MS = 6 * 60 * 1000;

// Easy to extend — just strings. Ask her for topic-specific lines later
// (e.g. "Ss says sss!") and drop them into the right list.
const ENCOURAGEMENTS = ["You're doing great!", "Keep going!", "I believe in you!"];
const CLICK_PHRASES = [...ENCOURAGEMENTS, "Woof! 🐾", "You've got this!", "Learning is fun!"];

const TAB_PHRASES: Record<string, string> = {
  trainer: "Let's practice!",
  grammar: "Let's practice!",
  vocabulary: "New words? Cool!",
  board: "Let's draw and learn!",
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function CorgiMascot() {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();

  // /student/[code], /student/[code]/board -> code is the path segment.
  // /student/tests/[id]?code=... -> code is a query param instead.
  const segMatch = pathname.match(/^\/student\/([^/]+)/);
  const seg = segMatch?.[1];
  const isStudentRoute = !!seg;
  const isTestRoute = seg === "tests";
  const studentCode = (isTestRoute ? searchParams.get("code") : seg) || "guest";
  const isBoard = pathname.endsWith("/board");
  const tab = searchParams.get("tab") ?? "schedule";

  const codeRef = useRef(studentCode);
  codeRef.current = studentCode;

  const [hidden, setHidden] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevTabKey = useRef<string | null>(null);

  const showBubble = useCallback((text: string) => {
    setBubble(text);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), BUBBLE_MS);
  }, []);

  // Load hidden preference once we know which student this is.
  useEffect(() => {
    if (!isStudentRoute) return;
    const stored = localStorage.getItem(`wb_corgi_hidden_${studentCode}`);
    setHidden(stored === "1");
    setLoaded(true);
  }, [isStudentRoute, studentCode]);

  // Greeting / "missed you" — once per mount (root layout persists across
  // in-app navigation, so this fires roughly once per browser session).
  useEffect(() => {
    if (!isStudentRoute) return;
    const code = codeRef.current;
    const key = `wb_corgi_last_visit_${code}`;
    const prev = localStorage.getItem(key);
    const now = Date.now();
    if (prev) {
      const gapDays = (now - Number(prev)) / 86400000;
      showBubble(gapDays >= MISSED_YOU_GAP_DAYS ? MISSED_YOU : GREETING);
    } else {
      showBubble(GREETING);
    }
    localStorage.setItem(key, String(now));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStudentRoute]);

  // React to tab / board navigation (skip the very first render — the
  // greeting effect above already claimed that moment).
  useEffect(() => {
    if (!isStudentRoute) return;
    const key = isBoard ? "board" : isTestRoute ? "tests" : tab;
    if (prevTabKey.current === null) {
      prevTabKey.current = key;
      return;
    }
    if (prevTabKey.current === key) return;
    prevTabKey.current = key;
    const phrase = isBoard ? TAB_PHRASES.board : TAB_PHRASES[tab];
    if (phrase) showBubble(phrase);
  }, [isStudentRoute, isBoard, isTestRoute, tab, showBubble]);

  // Reward / completion events dispatched from trainer, grammar, tests.
  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent<{ text: string }>).detail;
      if (detail?.text) showBubble(detail.text);
    }
    window.addEventListener(CORGI_EVENT, handler);
    return () => window.removeEventListener(CORGI_EVENT, handler);
  }, [showBubble]);

  // Idle encouragement, only while the tab is actually visible.
  useEffect(() => {
    if (!isStudentRoute || hidden) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = IDLE_MIN_MS + Math.random() * (IDLE_MAX_MS - IDLE_MIN_MS);
      timer = setTimeout(() => {
        if (document.visibilityState === "visible") showBubble(pick(ENCOURAGEMENTS));
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [isStudentRoute, hidden, showBubble]);

  // Pause the video off-screen/off-tab so a looping mp4 doesn't burn cycles
  // in the background — this is the whole point of the perf ask.
  useEffect(() => {
    function onVis() {
      const v = videoRef.current;
      if (!v) return;
      if (document.visibilityState === "hidden") v.pause();
      else if (!hidden) v.play().catch(() => {});
    }
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [hidden]);

  const toggleHidden = (next: boolean) => {
    setHidden(next);
    localStorage.setItem(`wb_corgi_hidden_${studentCode}`, next ? "1" : "0");
    if (next) setBubble(null);
  };

  if (!isStudentRoute || !loaded) return null;

  return (
    <div
      className="fixed z-[999] pointer-events-none"
      style={{
        right: "max(env(safe-area-inset-right, 0px), 12px)",
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
      }}
    >
      <style>{`
        @keyframes corgi-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes corgi-bubble-in { from { opacity: 0; transform: translateY(6px) scale(.94); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .corgi-bob { animation: corgi-bob 3.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .corgi-bob { animation: none; }
          .corgi-bubble { animation: none !important; }
        }
      `}</style>

      {hidden ? (
        <button
          onClick={() => toggleHidden(false)}
          aria-label="Показать корги"
          className="pointer-events-auto w-8 h-8 rounded-full flex items-center justify-center text-base shadow-md hover:scale-105 transition-transform"
          style={{ background: "white", border: "1px solid rgba(0,0,0,.08)" }}
        >
          🐾
        </button>
      ) : (
        <div className="relative pointer-events-none">
          {bubble && (
            <div
              className="corgi-bubble pointer-events-none absolute bottom-full right-0 mb-2 max-w-[170px] rounded-2xl px-3 py-2 text-sm font-medium text-center shadow-lg"
              style={{
                background: "#fffaf0",
                color: "#4a3826",
                border: "1px solid rgba(0,0,0,.06)",
                animation: "corgi-bubble-in .25s ease-out",
              }}
            >
              {bubble}
              <div
                className="absolute -bottom-[5px] right-5 w-2.5 h-2.5 rotate-45"
                style={{ background: "#fffaf0", borderRight: "1px solid rgba(0,0,0,.06)", borderBottom: "1px solid rgba(0,0,0,.06)" }}
              />
            </div>
          )}

          <div className="relative pointer-events-auto w-[92px] h-[92px] sm:w-[128px] sm:h-[128px]">
            {/* The video has a baked-in ground shadow and a plain white
                background (mp4 can't carry real alpha) — mix-blend-mode
                multiply drops the white out against whatever's behind it,
                so the corgi sits directly on the page instead of inside a
                card/circle. */}
            <button
              onClick={() => showBubble(pick(CLICK_PHRASES))}
              aria-label="Корги"
              className="corgi-bob w-full h-full block"
            >
              <video
                ref={videoRef}
                src="/mascot/corgi.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain"
                style={{ mixBlendMode: "multiply" }}
              />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleHidden(true); }}
              aria-label="Спрятать корги"
              className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "rgba(30,25,20,.65)" }}
            >
              <X size={11} color="white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

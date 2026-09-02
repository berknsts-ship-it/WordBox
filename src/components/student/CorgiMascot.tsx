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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
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

  // The source video has a plain white background baked in (mp4 has no
  // alpha channel) and CSS mix-blend-mode does not reliably apply to
  // <video> — verified against real Chromium, not just spec-reading: the
  // white box stayed even with a clean, non-isolated ancestor chain, so
  // this isn't a stacking-context bug, video compositing just doesn't
  // route through the blend pipeline the way it does for img/canvas.
  // Redrawing each frame onto a small canvas and zeroing the alpha of
  // near-white pixels keys the background out for real, at a resolution
  // small enough (200x200) that the per-frame pixel loop costs nothing.
  useEffect(() => {
    if (!isStudentRoute || hidden) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const SIZE = 200;
    canvas.width = SIZE;
    canvas.height = SIZE;

    function draw() {
      if (video && video.readyState >= 2 && ctx) {
        ctx.drawImage(video, 0, 0, SIZE, SIZE);
        const frame = ctx.getImageData(0, 0, SIZE, SIZE);
        const d = frame.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2];
          const min = Math.min(r, g, b);
          if (min > 248) d[i + 3] = 0;
          else if (min > 230) d[i + 3] = Math.round(((248 - min) / 18) * 255);
        }
        ctx.putImageData(frame, 0, 0);
      }
      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isStudentRoute, hidden]);

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
        /* margin, not transform: a transform on any ancestor of the video
           isolates mix-blend-mode from the real page behind it, which was
           silently turning the white background back on. */
        @keyframes corgi-bob { 0%,100% { margin-top: 0; } 50% { margin-top: -6px; } }
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
            {/* Video plays off-screen purely to decode frames; the canvas
                is what's actually shown, redrawn each frame with near-white
                pixels keyed to transparent (see the effect above) — CSS
                mix-blend-mode doesn't reliably strip a <video>'s background,
                confirmed against real Chromium, so this reads real pixels
                instead of trusting the compositor to blend it. */}
            <video
              ref={videoRef}
              src="/mascot/corgi.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{ position: "fixed", left: "-9999px", top: "-9999px", width: "1px", height: "1px" }}
            />
            <button
              onClick={() => showBubble(pick(CLICK_PHRASES))}
              aria-label="Корги"
              className="corgi-bob w-full h-full block"
            >
              <canvas ref={canvasRef} className="w-full h-full object-contain" />
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

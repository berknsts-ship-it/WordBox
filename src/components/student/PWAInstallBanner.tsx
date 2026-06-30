"use client";

import { useEffect, useRef, useState } from "react";
import { X, Smartphone } from "lucide-react";

export default function PWAInstallBanner() {
  const promptRef = useRef<Event & { prompt(): void; userChoice: Promise<{ outcome: string }> } | null>(null);
  const [show, setShow] = useState<"android" | "ios" | null>(null);

  useEffect(() => {
    if (localStorage.getItem("pwa-banner-dismissed")) return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if ((window.navigator as { standalone?: boolean }).standalone) return;

    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;

    if (ios) { setShow("ios"); return; }

    const handler = (e: Event) => {
      e.preventDefault();
      promptRef.current = e as typeof promptRef.current;
      setShow("android");
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    localStorage.setItem("pwa-banner-dismissed", "1");
    setShow(null);
  }

  async function install() {
    const p = promptRef.current;
    if (!p) return;
    p.prompt();
    const { outcome } = await p.userChoice;
    if (outcome === "accepted") setShow(null);
    promptRef.current = null;
  }

  if (!show) return null;

  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3 mt-4"
      style={{
        background: "rgba(253,248,242,0.92)",
        boxShadow: "0 2px 16px rgba(28,10,11,0.08), inset 0 0 0 1px rgba(156,122,69,0.22)",
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: "linear-gradient(145deg, #5e1018, #74070E)" }}
      >
        <Smartphone size={18} style={{ color: "#C4A468" }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight" style={{ color: "var(--brown-dark)" }}>
          Добавить на экран
        </p>
        {show === "ios" ? (
          <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--brown-light)" }}>
            Нажми <span style={{ color: "var(--brown-mid)" }}>⬆ Поделиться</span> → «На экран «Домой»»
          </p>
        ) : (
          <p className="text-xs mt-0.5" style={{ color: "var(--brown-light)" }}>
            Работает как приложение — без браузера
          </p>
        )}
      </div>

      {show === "android" && (
        <button
          onClick={install}
          className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80"
          style={{
            background: "linear-gradient(135deg, #5e1018, #74070E)",
            color: "#EDE0CC",
          }}
        >
          Установить
        </button>
      )}

      <button
        onClick={dismiss}
        className="shrink-0 p-1 rounded-lg hover:opacity-60 transition-opacity"
        style={{ color: "var(--brown-light)" }}
      >
        <X size={15} />
      </button>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";

export default function SplashScreen({
  code,
  children,
}: {
  code: string;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const key = `splash_${code}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    setVisible(true);
    const fadeTimer = setTimeout(() => setFading(true), 2000);
    const hideTimer = setTimeout(() => setVisible(false), 2900);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [code]);

  return (
    <>
      {children}
      {visible && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{
            background: "linear-gradient(160deg, #fdf8f0 0%, #f5e8d0 60%, #ecdbb8 100%)",
            opacity: fading ? 0 : 1,
            transition: "opacity 0.9s ease",
            pointerEvents: fading ? "none" : "all",
          }}
        >
          {/* Декоративные линии — имитация страницы */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity: 0.18 }}>
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="absolute w-full h-px"
                style={{ background: "rgba(180,145,90,0.6)", top: `${80 + i * 28}px` }} />
            ))}
            {/* Поле */}
            <div className="absolute top-0 bottom-0 w-px" style={{ background: "rgba(210,130,120,0.7)", left: "72px" }} />
          </div>

          {/* Декоративные круги */}
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(184,149,106,0.18) 0%, transparent 70%)" }} />
          <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(124,92,62,0.12) 0%, transparent 70%)" }} />

          {/* Контент */}
          <div className="relative text-center px-8">
            {/* Иконка */}
            <div className="flex justify-center mb-8">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #7c5c3e 0%, #b8956a 100%)",
                  boxShadow: "0 8px 32px rgba(124,92,62,0.35)",
                }}
              >
                <BookOpen size={36} className="text-white" />
              </div>
            </div>

            {/* Текст */}
            <h1
              className="text-5xl mb-3"
              style={{
                fontFamily: "var(--font-lora)",
                color: "var(--brown-dark)",
                letterSpacing: "-0.5px",
              }}
            >
              Hello!
            </h1>
            <p
              className="text-xl font-medium"
              style={{ color: "var(--brown-light)", fontFamily: "var(--font-lora)", fontStyle: "italic" }}
            >
              How are you?
            </p>

            {/* Декоративные буквы внизу */}
            <div
              className="mt-10 flex justify-center gap-3 select-none"
              style={{ color: "var(--brown-pale)", fontSize: "13px", letterSpacing: "4px", fontFamily: "Georgia, serif" }}
            >
              A · B · C · D · E
            </div>
          </div>
        </div>
      )}
    </>
  );
}

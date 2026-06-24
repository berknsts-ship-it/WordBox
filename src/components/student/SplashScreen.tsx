"use client";

import { useState, useEffect } from "react";

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
    const fadeTimer = setTimeout(() => setFading(true), 1800);
    const hideTimer = setTimeout(() => setVisible(false), 2600);
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
            background: "var(--cream)",
            opacity: fading ? 0 : 1,
            transition: "opacity 0.8s ease",
            pointerEvents: fading ? "none" : "all",
          }}
        >
          <div className="text-center px-8">
            <div className="text-6xl mb-6">👋</div>
            <h1
              className="text-4xl mb-3"
              style={{ fontFamily: "var(--font-lora)", color: "var(--brown-dark)" }}
            >
              Hello!
            </h1>
            <p className="text-xl" style={{ color: "var(--brown-mid)" }}>
              How are you?
            </p>
          </div>
        </div>
      )}
    </>
  );
}

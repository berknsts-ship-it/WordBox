"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { THEME_MAP, DEFAULT_THEME, type ThemeId } from "./themes";
import { saveStudentTheme } from "@/app/actions/theme";

interface ThemeCtx {
  theme: ThemeId;
  preview: ThemeId;      // currently previewed (may differ from saved)
  applyPreview: (id: ThemeId) => void;
  saveTheme: (id: ThemeId) => Promise<void>;
  cancelPreview: () => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}

function loadFont(url: string) {
  if (typeof document === "undefined") return;
  if (document.querySelector(`link[data-theme-font="${url}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  link.setAttribute("data-theme-font", url);
  document.head.appendChild(link);
}

function applyThemeAttr(id: ThemeId) {
  document.documentElement.setAttribute("data-theme", id);
  const t = THEME_MAP[id];
  if (t) loadFont(t.fontUrl);
}

export default function ThemeProvider({
  initialTheme,
  studentId,
  children,
}: {
  initialTheme: ThemeId;
  studentId: string;
  children: React.ReactNode;
}) {
  const [saved,   setSaved]   = useState<ThemeId>(initialTheme);
  const [preview, setPreview] = useState<ThemeId>(initialTheme);
  const savedRef = useRef<ThemeId>(initialTheme);

  // Apply theme on mount + whenever preview changes
  useEffect(() => {
    applyThemeAttr(preview);
  }, [preview]);

  // Cleanup: remove data-theme on unmount (e.g. navigating to tutor pages)
  useEffect(() => {
    return () => { document.documentElement.removeAttribute("data-theme"); };
  }, []);

  const applyPreview = useCallback((id: ThemeId) => {
    setPreview(id);
  }, []);

  const cancelPreview = useCallback(() => {
    setPreview(savedRef.current);
  }, []);

  const saveTheme = useCallback(async (id: ThemeId) => {
    setPreview(id);
    setSaved(id);
    savedRef.current = id;
    await saveStudentTheme(studentId, id);
  }, [studentId]);

  return (
    <Ctx.Provider value={{ theme: saved, preview, applyPreview, saveTheme, cancelPreview }}>
      {children}
    </Ctx.Provider>
  );
}

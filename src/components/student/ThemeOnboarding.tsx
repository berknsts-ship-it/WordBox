"use client";

import { useState } from "react";
import ThemePickerGrid from "./ThemePickerGrid";
import { useTheme } from "./ThemeProvider";
import { DEFAULT_THEME, type ThemeId } from "./themes";

export default function ThemeOnboarding({ onDone }: { onDone: () => void }) {
  const { preview, saveTheme } = useTheme();
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    setSaving(true);
    await saveTheme(preview as ThemeId);
    setSaving(false);
    onDone();
  };

  const handleSkip = async () => {
    setSaving(true);
    await saveTheme(DEFAULT_THEME);
    setSaving(false);
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto"
      style={{ background: "var(--theme-bg)", color: "var(--theme-text)" }}>
      <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-5 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="text-3xl mb-2">🎨</div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--theme-font)" }}>
            Выбери тему оформления
          </h1>
          <p className="text-sm" style={{ color: "var(--theme-text-secondary)" }}>
            Можно поменять в любой момент в настройках
          </p>
        </div>

        {/* Grid */}
        <div className="flex-1">
          <ThemePickerGrid grouped />
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={handleContinue}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl font-semibold text-white text-base transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: "var(--theme-accent)" }}>
            {saving ? "Сохраняю..." : "Продолжить"}
          </button>
          <button
            onClick={handleSkip}
            disabled={saving}
            className="w-full py-2 text-sm text-center transition-all hover:opacity-70"
            style={{ color: "var(--theme-text-secondary)" }}>
            Пропустить — применить «Классику»
          </button>
        </div>
      </div>
    </div>
  );
}

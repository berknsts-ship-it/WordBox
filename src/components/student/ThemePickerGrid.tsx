"use client";

import { Check } from "lucide-react";
import { THEMES, THEMES_BY_CATEGORY, CATEGORY_NAMES, type ThemeId, type ThemeData } from "./themes";
import { useTheme } from "./ThemeProvider";

function ThemeCard({ t, active, previewing }: { t: ThemeData; active: boolean; previewing: boolean }) {
  const { applyPreview } = useTheme();
  return (
    <button
      onClick={() => applyPreview(t.id)}
      title={t.name}
      className="relative flex flex-col rounded-xl overflow-hidden border-2 transition-all focus:outline-none"
      style={{
        borderColor: previewing ? t.accent : active ? `${t.accent}55` : "transparent",
        boxShadow: previewing ? `0 0 0 3px ${t.accent}33` : "none",
        background: t.bg,
      }}>
      {/* Mini preview */}
      <div className="w-full h-14 relative flex flex-col gap-1.5 p-2" style={{ background: t.bg }}>
        {/* Accent bar */}
        <div className="w-full h-2.5 rounded-full" style={{ background: t.accent }}/>
        <div className="w-3/4 h-1.5 rounded-full" style={{ background: t.accent2 }}/>
        {/* Card sim */}
        <div className="w-full flex-1 rounded-md" style={{ background: t.cardBg, border: `1px solid ${t.accent}22` }}/>
      </div>
      {/* Name */}
      <div className="px-2 py-1.5 text-center text-xs font-semibold leading-tight"
        style={{ background: t.bg, color: t.text }}>
        {t.name}
      </div>
      {/* Check mark */}
      {(active || previewing) && (
        <div className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ background: t.accent }}>
          <Check size={9} color="white" strokeWidth={3}/>
        </div>
      )}
    </button>
  );
}

export default function ThemePickerGrid({ grouped }: { grouped: boolean }) {
  const { theme: saved, preview } = useTheme();

  if (!grouped) {
    return (
      <div className="grid grid-cols-4 gap-2">
        {THEMES.map(t => (
          <ThemeCard key={t.id} t={t} active={t.id === saved} previewing={t.id === preview && t.id !== saved}/>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {(["bright", "game", "atmospheric", "luxury"] as const).map(cat => (
        <div key={cat}>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-3"
            style={{ color: "var(--theme-text-secondary, #8A7560)", letterSpacing: "0.08em" }}>
            {CATEGORY_NAMES[cat]}
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {THEMES_BY_CATEGORY[cat].map(t => (
              <ThemeCard key={t.id} t={t} active={t.id === saved} previewing={t.id === preview && t.id !== saved}/>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

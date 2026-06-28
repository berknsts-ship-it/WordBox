"use client";

import { useState, useRef, useEffect } from "react";
import { Palette, Check } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { THEMES, type ThemeId, type ThemeData } from "./themes";

function MiniCard({ t, active, onSelect }: { t: ThemeData; active: boolean; onSelect: () => void }) {
  return (
    <button
      title={t.name}
      onClick={onSelect}
      className="relative flex flex-col rounded-lg overflow-hidden border-2 transition-all focus:outline-none"
      style={{
        borderColor: active ? t.accent : "transparent",
        boxShadow:   active ? `0 0 0 2px ${t.accent}33` : "none",
        background:  t.bg,
      }}>
      <div className="w-full h-10 p-1.5 flex flex-col gap-1" style={{ background: t.bg }}>
        <div className="w-full h-2 rounded-full"   style={{ background: t.accent }}/>
        <div className="w-2/3 h-1.5 rounded-full" style={{ background: t.accent2 }}/>
      </div>
      <div className="px-1 py-1 text-center leading-tight"
        style={{ background: t.bg, color: t.text, fontSize: 9, fontWeight: 600 }}>
        {t.name}
      </div>
      {active && (
        <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
          style={{ background: t.accent }}>
          <Check size={7} color="white" strokeWidth={3}/>
        </div>
      )}
    </button>
  );
}

export default function ThemePickerPopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { preview, saveTheme } = useTheme();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = async (id: ThemeId) => {
    await saveTheme(id);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        title="Сменить тему"
        className="flex items-center justify-center w-8 h-8 rounded-full border transition-all hover:opacity-80"
        style={{
          borderColor: "var(--theme-card-border, rgba(156,122,69,0.2))",
          background:  "var(--theme-card-bg, white)",
          color:       "var(--theme-accent, #7A1F1F)",
        }}>
        <Palette size={15}/>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 rounded-2xl border shadow-xl p-4"
          style={{
            background:  "var(--theme-card-bg, white)",
            borderColor: "var(--theme-card-border, rgba(156,122,69,0.15))",
            width: 272,
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: "var(--theme-text-secondary, #8A7560)", letterSpacing: "0.08em" }}>
            Тема оформления
          </p>
          <div className="grid grid-cols-4 gap-2">
            {THEMES.map(t => (
              <MiniCard
                key={t.id}
                t={t}
                active={t.id === preview}
                onSelect={() => handleSelect(t.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

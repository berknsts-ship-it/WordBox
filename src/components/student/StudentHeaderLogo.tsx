"use client";

import { BookOpen } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import WBLogo from "@/components/WBLogo";

const LUXURY = new Set(["classic", "emerald", "graphite"]);

const LOGO_COLORS: Record<string, { ring: string; text: string }> = {
  classic:  { ring: "#9C7A45", text: "#4A1414" },
  emerald:  { ring: "#C9A668", text: "#EEF4EB" },
  graphite: { ring: "#C4A468", text: "#F0EDE8" },
};

export default function StudentHeaderLogo() {
  const { theme } = useTheme();

  if (LUXURY.has(theme)) {
    const colors = LOGO_COLORS[theme] ?? LOGO_COLORS.classic;
    return (
      <div className="flex items-center gap-2">
        <WBLogo size={30} ringColor={colors.ring} textColor={colors.text} />
        <span
          className="text-base leading-none"
          style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontWeight: 600,
            color: "var(--theme-accent)",
            letterSpacing: "0.03em",
          }}
        >
          Word Box
        </span>
      </div>
    );
  }

  // For Craft, --theme-accent is cream (#D4C896) — use accent-2 (darker green) for icon bg
  const iconBg = theme === "craft"
    ? "var(--theme-accent-2)"
    : "var(--theme-accent)";

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-7 h-7 flex items-center justify-center flex-shrink-0"
        style={{
          background: iconBg,
          borderRadius: "var(--theme-radius, 8px)",
        }}
      >
        <BookOpen size={13} className="text-white" />
      </div>
      <span
        className="font-bold text-base tracking-wide"
        style={{
          color: "var(--theme-text)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        Word Box
      </span>
    </div>
  );
}

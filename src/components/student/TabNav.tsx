"use client";

import Link from "next/link";
import { CalendarDays, ClipboardList, PenLine, NotebookText, Brain, BookText, FolderOpen } from "lucide-react";
import { THEME_TAB_ICONS, type ThemeId } from "./themes";

const TABS = [
  { id: "schedule",  label: "Расписание", icon: CalendarDays },
  { id: "homework",  label: "Задания",    icon: ClipboardList },
  { id: "materials", label: "Материалы",  icon: FolderOpen },
  { id: "board",     label: "Доска",      icon: PenLine },
  { id: "journal",   label: "Журнал",     icon: NotebookText },
  { id: "trainer",   label: "Тренажёр",   icon: Brain },
  { id: "grammar",   label: "Грамматика", icon: BookText },
];

// Icon foreground color on top of --theme-accent background
// Light accents need a dark icon; dark accents get white
const ICON_FG: Partial<Record<ThemeId, string>> = {
  sun:      "#5A3800",   // yellow accent → dark brown
  craft:    "#2A4010",   // cream accent  → dark green
  kawaii:   "#8B2252",   // light pink    → deep pink
  emerald:  "#0E2A22",   // gold accent   → deep green
  graphite: "#1A1A1D",   // warm gold     → near-black
};

export default function TabNav({
  code,
  activeTab,
  pendingHomework = 0,
  themeId,
}: {
  code: string;
  activeTab: string;
  pendingHomework?: number;
  themeId?: string | null;
}) {
  const themeIcons = themeId ? THEME_TAB_ICONS[themeId as ThemeId] : undefined;
  const iconFg = ICON_FG[themeId as ThemeId] ?? "#ffffff";

  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 sm:pb-0">
      <div className="flex sm:grid sm:grid-cols-7 gap-1.5 sm:gap-2 w-max sm:w-full">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const showBadge = tab.id === "homework" && pendingHomework > 0;
          const emojiIcon = themeIcons?.[tab.id];

          return (
            <Link
              key={tab.id}
              href={`/student/${code}?tab=${tab.id}`}
              className="relative flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 sm:px-1 rounded-xl sm:rounded-2xl transition-all min-w-[62px] sm:min-w-0"
              style={
                isActive
                  ? {
                      background: "color-mix(in srgb, var(--theme-accent) 12%, var(--theme-card-bg))",
                      border: "2px solid var(--theme-accent)",
                      transform: "translateY(-1px)",
                    }
                  : {
                      background: "var(--theme-card-bg)",
                      border: "1.5px solid var(--theme-card-border)",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }
              }
            >
              {/* App-icon square */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: isActive ? "var(--gradient-primary)" : "var(--theme-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: isActive
                    ? "0 4px 14px rgba(0,0,0,0.22)"
                    : "0 2px 8px rgba(0,0,0,0.14)",
                }}
              >
                {emojiIcon
                  ? <span style={{ fontSize: 20, lineHeight: 1 }} aria-hidden="true">{emojiIcon}</span>
                  : <Icon size={20} color={isActive ? "#ffffff" : iconFg} />
                }
              </div>

              <span
                className="text-xs font-semibold text-center leading-tight whitespace-nowrap"
                style={{ color: isActive ? "var(--theme-accent)" : "var(--theme-text-secondary)" }}
              >
                {tab.label}
              </span>

              {showBadge && (
                <span
                  className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full text-white font-bold"
                  style={{ background: "#e85d4a", fontSize: "10px" }}
                >
                  {pendingHomework}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

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
              className="relative flex flex-col items-center justify-center gap-1 py-2.5 px-3 sm:px-1 rounded-xl sm:rounded-2xl transition-all min-w-[64px] sm:min-w-0"
              style={
                isActive
                  ? {
                      background: "var(--gradient-primary)",
                      color: "#fff",
                      boxShadow: "var(--shadow-button)",
                    }
                  : {
                      background: "var(--theme-card-bg)",
                      color: "var(--theme-text-secondary)",
                      border: "1.5px solid var(--theme-card-border)",
                    }
              }
            >
              {emojiIcon
                ? <span className="text-xl leading-none" aria-hidden="true">{emojiIcon}</span>
                : <Icon size={18} />
              }
              <span className="text-xs font-semibold text-center leading-tight whitespace-nowrap">
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

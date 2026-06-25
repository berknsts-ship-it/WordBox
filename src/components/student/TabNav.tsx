"use client";

import Link from "next/link";
import { CalendarDays, ClipboardList, PenLine, NotebookText, Brain, BookText } from "lucide-react";

const TABS = [
  { id: "schedule", label: "Расписание",  icon: CalendarDays },
  { id: "homework", label: "Задания",      icon: ClipboardList },
  { id: "board",    label: "Доска",        icon: PenLine },
  { id: "journal",  label: "Журнал",       icon: NotebookText },
  { id: "trainer",  label: "Тренажёр",     icon: Brain },
  { id: "grammar",  label: "Грамматика",   icon: BookText },
];

export default function TabNav({
  code,
  activeTab,
  pendingHomework = 0,
}: {
  code: string;
  activeTab: string;
  pendingHomework?: number;
}) {
  return (
    <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const showBadge = tab.id === "homework" && pendingHomework > 0;

        return (
          <Link
            key={tab.id}
            href={`/student/${code}?tab=${tab.id}`}
            className="relative flex flex-col items-center justify-center gap-1 py-2.5 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all"
            style={
              isActive
                ? {
                    background: "var(--gradient-primary)",
                    color: "#fff",
                    boxShadow: "var(--shadow-button)",
                  }
                : {
                    background: "rgba(255,255,255,0.75)",
                    color: "var(--brown-light)",
                    border: "1.5px solid var(--brown-pale)",
                  }
            }
          >
            <Icon size={18} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:block text-xs font-semibold text-center leading-tight px-1">
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
  );
}

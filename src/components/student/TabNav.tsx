"use client";

import Link from "next/link";

const TABS = [
  { id: "schedule",  label: "Расписание",      icon: "📅" },
  { id: "homework",  label: "Домашние задания", icon: "📝" },
  { id: "board",     label: "Доска",            icon: "🖊️" },
  { id: "journal",   label: "Журнал уроков",    icon: "📖" },
  { id: "materials", label: "Материалы",        icon: "📂" },
  { id: "trainer",   label: "Тренажёр",         icon: "🃏" },
  { id: "grammar",   label: "Грамматика",        icon: "📐" },
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
    <div className="flex gap-2 overflow-x-auto pb-1">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const showBadge = tab.id === "homework" && pendingHomework > 0;
        return (
          <Link
            key={tab.id}
            href={`/student/${code}?tab=${tab.id}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all relative"
            style={
              isActive
                ? { background: "var(--brown-mid)", color: "#fff" }
                : { background: "rgba(255,255,255,0.7)", color: "var(--brown-light)", border: "1.5px solid var(--brown-pale)" }
            }
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {showBadge && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white"
                style={{ background: "#e85d4a", fontSize: "11px" }}>
                {pendingHomework}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

"use client";

import Link from "next/link";

const TABS = [
  { id: "schedule",  label: "Расписание",      icon: "📅" },
  { id: "homework",  label: "Домашние задания", icon: "📝" },
  { id: "journal",   label: "Журнал уроков",    icon: "📖" },
  { id: "materials", label: "Материалы",        icon: "📂" },
  { id: "trainer",   label: "Тренажёр",         icon: "🃏" },
];

export default function TabNav({ code, activeTab }: { code: string; activeTab: string }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={`/student/${code}?tab=${tab.id}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all"
            style={
              isActive
                ? { background: "var(--brown-mid)", color: "#fff" }
                : { background: "rgba(255,255,255,0.7)", color: "var(--brown-light)", border: "1.5px solid var(--brown-pale)" }
            }
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

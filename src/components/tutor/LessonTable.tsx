"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface LessonRow {
  id: string;
  date: string;
  duration_min?: number | null;
  price_rub?: number | null;
  status: string;
  deducted_amount?: number | null;
  date_history?: string[] | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  scheduled:   { label: "Запланировано", color: "#2060d0", bg: "#e8f0ff" },
  completed:   { label: "Проведено",     color: "#1a7a3a", bg: "#d8f5e0" },
  cancelled:   { label: "Отменено",      color: "#999",    bg: "#f0f0f0" },
  missed:      { label: "Сгорело",       color: "#cc3030", bg: "#ffe0e0" },
  // Shouldn't occur on new data (reschedule now resets status to
  // "scheduled" and records the move in date_history instead) — kept only
  // so any lesson that predates that change still renders sensibly.
  rescheduled: { label: "Перенесено",    color: "#c07800", bg: "#fff3cc" },
};

function formatChainDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru", { day: "numeric", month: "short" });
}

function toCSV(rows: LessonRow[]): string {
  const header = ["Дата", "Время", "Длительность (мин)", "Статус", "Сумма (₽)", "Перенос"];
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [header.map(esc).join(",")];
  for (const l of rows) {
    const dateStr = new Date(l.date).toLocaleDateString("ru");
    const timeStr = l.date.slice(11, 16);
    const status = STATUS_CONFIG[l.status]?.label ?? l.status;
    const amount = l.deducted_amount ?? l.price_rub ?? "";
    const chain = l.date_history?.length ? [...l.date_history, l.date].map(formatChainDate).join(" → ") : "";
    lines.push([dateStr, timeStr, l.duration_min ?? "", status, amount, chain].map(esc).join(","));
  }
  return lines.join("\n");
}

const COLLAPSED_DEFAULT = 5;

// Real table (not a list of divs) so status/amount/reschedule-history line
// up in columns like the tutor's used to seeing in a spreadsheet. Shared
// between the subscription summary and the pay-per-lesson history — same
// columns either way, just a different set of rows passed in.
export default function LessonTable({
  lessons, title, collapsedCount = COLLAPSED_DEFAULT,
}: {
  lessons: LessonRow[];
  title?: string;
  collapsedCount?: number;
}) {
  const [open, setOpen] = useState(false);
  if (lessons.length === 0) return null;

  const sorted = [...lessons].sort((a, b) => b.date.localeCompare(a.date));
  const visible = open ? sorted : sorted.slice(0, collapsedCount);

  const downloadCSV = () => {
    const csv = "﻿" + toCSV(sorted); // BOM so Excel opens Cyrillic correctly
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `занятия-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        {title
          ? <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--brown-light)" }}>{title}</p>
          : <span />}
        <button onClick={downloadCSV} className="text-xs font-medium hover:underline" style={{ color: "var(--brown-mid)" }}>
          Экспорт CSV
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--brown-pale)" }}>
        <table className="w-full text-sm" style={{ borderCollapse: "collapse", minWidth: 580 }}>
          <thead>
            <tr style={{ background: "#fdf8f0" }}>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap" style={{ color: "var(--brown-mid)" }}>Дата</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap" style={{ color: "var(--brown-mid)" }}>Длительность</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap" style={{ color: "var(--brown-mid)" }}>Статус</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap" style={{ color: "var(--brown-mid)" }}>Сумма</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap" style={{ color: "var(--brown-mid)" }}>Перенос</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(l => {
              const cfg = STATUS_CONFIG[l.status] ?? STATUS_CONFIG.scheduled;
              const amount = l.deducted_amount ?? l.price_rub;
              const chain = l.date_history?.length ? [...l.date_history, l.date] : null;
              const dateStr = new Date(l.date).toLocaleDateString("ru", { day: "numeric", month: "long" });
              const timeStr = l.date.slice(11, 16);
              return (
                <tr key={l.id} className="border-t" style={{ borderColor: "var(--brown-pale)" }}>
                  <td className="px-3 py-2 whitespace-nowrap" style={{ color: "var(--brown-dark)" }}>
                    {dateStr}{timeStr !== "00:00" && `, ${timeStr}`}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap" style={{ color: "var(--brown-mid)" }}>
                    {l.duration_min ? `${l.duration_min} мин` : "—"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap" style={{ color: "var(--brown-dark)" }}>
                    {amount ? `${amount.toLocaleString("ru")} ₽` : "—"}
                  </td>
                  <td className="px-3 py-2 text-xs whitespace-nowrap" style={{ color: chain ? "#c07800" : "var(--brown-light)" }}>
                    {chain ? chain.map(formatChainDate).join(" → ") : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {sorted.length > collapsedCount && (
        <button onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1 text-xs font-medium mt-2 hover:opacity-70 transition-all"
          style={{ color: "var(--brown-mid)" }}>
          <ChevronDown size={13} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
          {open ? "Свернуть" : `Показать ещё ${sorted.length - collapsedCount}`}
        </button>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { formatLastSeen, type ActivityTone } from "@/lib/relativeTime";

export type ProgressRow = {
  id: string;
  name: string;
  lastSeen: string | null;
  lexiconDone: number;
  lexiconMasteryPct: number | null;
  grammarDone: number;
  grammarAvgPct: number | null;
  testsDone: number;
  testsAvgStars: number | null;
  lessonsLeft: number | null;
};

type SortKey = "name" | "lastSeen" | "lexiconDone" | "grammarDone" | "testsDone" | "lessonsLeft";

const TONE_STYLE: Record<ActivityTone, { color: string; background: string }> = {
  ok:      { color: "#2a7a3a", background: "#f2faf2" },
  warn:    { color: "#a06010", background: "#fff8e8" },
  danger:  { color: "#a03020", background: "#fff3f0" },
  neutral: { color: "var(--brown-light)", background: "#fdf8f0" },
};

function Badge({ label, tone }: { label: string; tone: ActivityTone }) {
  const s = TONE_STYLE[tone];
  return (
    <span className="text-xs font-semibold px-2 py-1 rounded-lg whitespace-nowrap" style={{ color: s.color, background: s.background }}>
      {label}
    </span>
  );
}

function SortHeader({ label, sortKey, active, dir, onClick }: {
  label: string; sortKey: SortKey; active: boolean; dir: "asc" | "desc"; onClick: (k: SortKey) => void;
}) {
  return (
    <button
      onClick={() => onClick(sortKey)}
      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider whitespace-nowrap hover:opacity-70 transition-opacity"
      style={{ color: active ? "var(--brown-dark)" : "var(--brown-light)" }}
    >
      {label}
      {active ? (dir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} />}
    </button>
  );
}

export default function ProgressTable({ rows }: { rows: ProgressRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("lastSeen");
  const [dir, setDir] = useState<"asc" | "desc">("asc");

  function handleSort(key: SortKey) {
    if (key === sortKey) setDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setDir("asc"); }
  }

  const sorted = useMemo(() => {
    const val = (r: ProgressRow): number | string => {
      switch (sortKey) {
        case "name": return r.name.toLowerCase();
        case "lastSeen": return r.lastSeen ? new Date(r.lastSeen).getTime() : -1;
        case "lexiconDone": return r.lexiconDone;
        case "grammarDone": return r.grammarDone;
        case "testsDone": return r.testsDone;
        case "lessonsLeft": return r.lessonsLeft ?? -1;
      }
    };
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = val(a), bv = val(b);
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return dir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortKey, dir]);

  if (rows.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl border" style={{ background: "white", borderColor: "var(--brown-pale)" }}>
        <p className="text-sm" style={{ color: "var(--brown-light)" }}>Пока нет учеников.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--brown-pale)" }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: 720 }}>
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--brown-pale)", background: "#fdf8f0" }}>
              <th className="text-left px-4 py-3"><SortHeader label="Ученик" sortKey="name" active={sortKey === "name"} dir={dir} onClick={handleSort} /></th>
              <th className="text-left px-4 py-3"><SortHeader label="Был на сайте" sortKey="lastSeen" active={sortKey === "lastSeen"} dir={dir} onClick={handleSort} /></th>
              <th className="text-left px-4 py-3"><SortHeader label="Лексика" sortKey="lexiconDone" active={sortKey === "lexiconDone"} dir={dir} onClick={handleSort} /></th>
              <th className="text-left px-4 py-3"><SortHeader label="Грамматика" sortKey="grammarDone" active={sortKey === "grammarDone"} dir={dir} onClick={handleSort} /></th>
              <th className="text-left px-4 py-3"><SortHeader label="Тесты" sortKey="testsDone" active={sortKey === "testsDone"} dir={dir} onClick={handleSort} /></th>
              <th className="text-left px-4 py-3"><SortHeader label="Абонемент" sortKey="lessonsLeft" active={sortKey === "lessonsLeft"} dir={dir} onClick={handleSort} /></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(r => {
              const seen = formatLastSeen(r.lastSeen);
              return (
                <tr key={r.id} className="border-b last:border-0 hover:bg-black/[0.015] transition-colors" style={{ borderColor: "var(--brown-pale)" }}>
                  <td className="px-4 py-3">
                    <Link href={`/tutor/students/${r.id}`} className="font-semibold hover:underline" style={{ color: "var(--brown-dark)" }}>
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3"><Badge label={seen.label} tone={seen.tone} /></td>
                  <td className="px-4 py-3" style={{ color: "var(--brown-dark)" }}>
                    {r.lexiconDone} {r.lexiconDone === 1 ? "набор" : "наборов"}
                    {r.lexiconMasteryPct !== null && (
                      <span className="ml-1.5 text-xs" style={{ color: "var(--brown-light)" }}>· {r.lexiconMasteryPct}% освоено</span>
                    )}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--brown-dark)" }}>
                    {r.grammarDone} {r.grammarDone === 1 ? "набор" : "наборов"}
                    {r.grammarAvgPct !== null && (
                      <span className="ml-1.5 text-xs" style={{ color: "var(--brown-light)" }}>· {r.grammarAvgPct}%</span>
                    )}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--brown-dark)" }}>
                    {r.testsDone}
                    {r.testsAvgStars !== null && (
                      <span className="ml-1.5 text-xs" style={{ color: "var(--brown-light)" }}>· ★ {r.testsAvgStars.toFixed(1)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--brown-dark)" }}>
                    {r.lessonsLeft === null ? <span style={{ color: "var(--brown-light)" }}>—</span> : `${r.lessonsLeft} занятий`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

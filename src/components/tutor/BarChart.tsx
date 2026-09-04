"use client";

import { useState } from "react";

export type BarDatum = { label: string; value: number; color: string; tooltip: string };

// Deliberately plain HTML/CSS bars, not SVG — mark spec still applies (thin
// bars, rounded top only, 2px gaps, hover tooltip) but this reads more
// consistently with the rest of the app's hand-styled divs than an
// SVG chart component would.
export default function BarChart({ data, height = 120 }: { data: BarDatum[]; height?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map(d => d.value));

  if (data.length === 0) {
    return <p className="text-sm py-8 text-center" style={{ color: "var(--brown-light)" }}>Пока нет данных.</p>;
  }

  return (
    <div>
      <div className="flex items-end gap-[2px]" style={{ height }}>
        {data.map((d, i) => (
          <div
            key={i}
            className="flex-1 min-w-[3px] max-w-[24px] relative cursor-default"
            style={{ height: "100%" }}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <div
              className="absolute bottom-0 left-0 right-0 rounded-t-[4px] transition-opacity"
              style={{
                height: `${d.value > 0 ? Math.max(3, (d.value / max) * 100) : 1}%`,
                background: d.color,
                opacity: hover === null || hover === i ? 1 : 0.5,
              }}
            />
            {hover === i && (
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap z-10 pointer-events-none"
                style={{ background: "var(--brown-dark)", color: "white" }}
              >
                {d.tooltip}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="h-px" style={{ background: "var(--brown-pale)" }} />
    </div>
  );
}

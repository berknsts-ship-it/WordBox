// Fixed status palette (never themed) — good/warning/critical bands used to
// flag weak spots at a glance in the progress charts.
export const STATUS_COLORS = {
  good: "#0ca30c",
  warning: "#fab219",
  critical: "#d03b3b",
} as const;

export type Status = keyof typeof STATUS_COLORS;

// Mirrors the thresholds tests.ts already uses for computeStars (90/75/60/45%)
// collapsed to three bands instead of five, to match the same good/warning/
// critical language used everywhere else in this feature (last-seen badges,
// etc.) rather than inventing a second scale.
export function statusFromPct(pct: number): Status {
  if (pct >= 75) return "good";
  if (pct >= 45) return "warning";
  return "critical";
}

export function statusFromStars(stars: number): Status {
  if (stars >= 4) return "good";
  if (stars === 3) return "warning";
  return "critical";
}

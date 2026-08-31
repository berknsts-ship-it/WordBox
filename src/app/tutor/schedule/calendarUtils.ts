// Shared helpers for the Day/Week/Month calendar views — time-grid layout
// math and the status colour palette, so all three views (and the lesson
// chips inside them) agree on what "completed" or "missed" looks like.

export type TimedLesson = {
  id: string;
  date: string;
  duration_min?: number | null;
  status: string;
  student_id: string;
  students?: { name: string } | null;
};

export const STATUS_BG: Record<string, string> = {
  scheduled:   "#dbeafe",
  completed:   "#d1fae5",
  missed:      "#fee2e2",
  cancelled:   "#f1f5f9",
  rescheduled: "#fef3c7",
};
export const STATUS_TEXT: Record<string, string> = {
  scheduled:   "#1d4ed8",
  completed:   "#166534",
  missed:      "#b91c1c",
  cancelled:   "#94a3b8",
  rescheduled: "#92400e",
};
export const STATUS_LABEL: Record<string, string> = {
  scheduled:   "Запланирован",
  completed:   "Проведён",
  missed:      "Сгорел",
  cancelled:   "Отменён",
  rescheduled: "Перенесён",
};

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function minutesOfDay(iso: string): number {
  return parseInt(iso.slice(11, 13)) * 60 + parseInt(iso.slice(14, 16));
}

export function computeHourRange(lessons: TimedLesson[], defaultStart = 8, defaultEnd = 21): { startHour: number; endHour: number } {
  let startHour = defaultStart, endHour = defaultEnd;
  for (const l of lessons) {
    const startMin = minutesOfDay(l.date);
    const endMin = startMin + (l.duration_min ?? 60);
    startHour = Math.min(startHour, Math.floor(startMin / 60));
    endHour = Math.max(endHour, Math.ceil(endMin / 60));
  }
  return { startHour, endHour };
}

export type LaidOutLesson<T> = T & { col: number; cols: number };

// Greedy same-day overlap clustering — lessons whose time ranges touch share
// a cluster and split the column width between them (col/cols), so an
// accidental double-booking is still visible side by side instead of one
// block hiding another entirely.
export function layoutLessons<T extends TimedLesson>(lessons: T[]): LaidOutLesson<T>[] {
  const sorted = [...lessons].sort((a, b) => a.date.localeCompare(b.date));
  const result: LaidOutLesson<T>[] = [];
  let cluster: T[] = [];
  let clusterEnd = -Infinity;
  const flush = () => {
    if (!cluster.length) return;
    cluster.forEach((l, i) => result.push({ ...l, col: i, cols: cluster.length }));
    cluster = [];
  };
  for (const l of sorted) {
    const start = minutesOfDay(l.date);
    const end = start + (l.duration_min ?? 60);
    if (cluster.length === 0 || start < clusterEnd) {
      cluster.push(l);
      clusterEnd = Math.max(clusterEnd, end);
    } else {
      flush();
      cluster = [l];
      clusterEnd = end;
    }
  }
  flush();
  return result;
}

export function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

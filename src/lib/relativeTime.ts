export type ActivityTone = "ok" | "warn" | "danger" | "neutral";

export function formatLastSeen(iso: string | null): { label: string; tone: ActivityTone } {
  if (!iso) return { label: "не заходил(а)", tone: "neutral" };

  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) return { label: "только что", tone: "ok" };
  if (minutes < 60) return { label: `${minutes} мин. назад`, tone: "ok" };
  if (hours < 24) return { label: `${hours} ч. назад`, tone: "ok" };
  if (days === 1) return { label: "вчера", tone: "ok" };
  if (days < 3) return { label: `${days} дня назад`, tone: "ok" };
  if (days < 7) return { label: `${days} дней назад`, tone: "warn" };
  if (days < 30) return { label: `${days} дней назад`, tone: "danger" };
  return { label: `${Math.floor(days / 30)} мес. назад`, tone: "danger" };
}
